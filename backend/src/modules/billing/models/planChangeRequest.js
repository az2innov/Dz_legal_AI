/**
 * Modèle pour gérer les demandes de changement de plan
 * Table: plan_change_requests
 */

const db = require('../../../config/db');

class PlanChangeRequest {
    /**
     * Créer une nouvelle demande de changement de plan
     */
    static async create(data) {
        const { userId, currentPlan, requestedPlan, amount, paymentMethod, userNotes } = data;

        const result = await db.query(
            `INSERT INTO plan_change_requests 
             (user_id, current_plan, requested_plan, amount, payment_method, user_notes, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, currentPlan, requestedPlan, amount, paymentMethod || null, userNotes || null]
        );

        return result.insertId;
    }

    /**
     * Récupérer une demande par ID
     */
    static async findById(id) {
        const result = await db.query(
            'SELECT * FROM plan_change_requests WHERE id = ?',
            [id]
        );

        return result.rows[0] || null;
    }

    /**
     * Récupérer toutes les demandes d'un utilisateur
     */
    static async findByUserId(userId, status = null) {
        let query = 'SELECT * FROM plan_change_requests WHERE user_id = ?';
        const params = [userId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Récupérer toutes les demandes avec informations utilisateur (pour admin)
     */
    static async findAllWithUserInfo(status = null) {
        let query = `
            SELECT 
                r.*,
                u.email as user_email,
                u.full_name as user_full_name,
                u.whatsapp_number as user_phone,
                approver.email as approver_email,
                approver.full_name as approver_name
            FROM plan_change_requests r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN users approver ON r.approved_by = approver.id
        `;

        const params = [];

        if (status && status !== 'all') {
            query += ' WHERE r.status = ?';
            params.push(status);
        }

        query += ' ORDER BY r.created_at DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Vérifier si un utilisateur a déjà une demande pending
     */
    static async hasPendingRequest(userId) {
        const result = await db.query(
            'SELECT id FROM plan_change_requests WHERE user_id = ? AND status = ?',
            [userId, 'pending']
        );

        return result.rows.length > 0;
    }

    /**
     * Mettre à jour le statut d'une demande
     */
    static async updateStatus(id, status, adminId = null, adminNotes = null) {
        const updates = ['status = ?'];
        const params = [status];

        if (status === 'approved' && adminId) {
            updates.push('approved_by = ?', 'approved_at = NOW()');
            params.push(adminId);
        }

        if (adminNotes) {
            updates.push('admin_notes = ?');
            params.push(adminNotes);
        }

        params.push(id);

        const query = `UPDATE plan_change_requests SET ${updates.join(', ')} WHERE id = ?`;

        const result = await db.query(query, params);
        return result.affectedRows > 0;
    }

    /**
     * Approuver une demande (met à jour le statut ET le plan utilisateur)
     */
    static async approve(requestId, adminId, adminNotes = null) {
        // Récupérer la demande
        const request = await this.findById(requestId);

        if (!request) {
            throw new Error('Demande introuvable');
        }

        if (request.status !== 'pending') {
            throw new Error('Cette demande a déjà été traitée');
        }

        // Mise à jour en transaction
        try {
            // 1. Mettre à jour le plan de l'utilisateur
            await db.query(
                'UPDATE users SET plan = ? WHERE id = ?',
                [request.requested_plan, request.user_id]
            );

            // 2. Marquer la demande comme approuvée
            await this.updateStatus(requestId, 'approved', adminId, adminNotes);

            return true;
        } catch (error) {
            console.error('Erreur lors de l\'approbation:', error);
            throw error;
        }
    }

    /**
     * Rejeter une demande
     */
    static async reject(requestId, adminNotes) {
        const request = await this.findById(requestId);

        if (!request) {
            throw new Error('Demande introuvable');
        }

        if (request.status !== 'pending') {
            throw new Error('Cette demande a déjà été traitée');
        }

        return await this.updateStatus(requestId, 'rejected', null, adminNotes);
    }

    /**
     * Annuler une demande (par l'utilisateur)
     */
    static async cancel(requestId, userId) {
        const request = await this.findById(requestId);

        if (!request) {
            throw new Error('Demande introuvable');
        }

        if (request.user_id !== userId) {
            throw new Error('Vous n\'êtes pas autorisé à annuler cette demande');
        }

        if (request.status !== 'pending') {
            throw new Error('Seules les demandes en attente peuvent être annulées');
        }

        return await this.updateStatus(requestId, 'cancelled');
    }

    /**
     * Obtenir les statistiques des demandes
     */
    static async getStats() {
        const result = await db.query(`
            SELECT 
                status,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM plan_change_requests
            GROUP BY status
        `);

        return result.rows;
    }
}

module.exports = PlanChangeRequest;
