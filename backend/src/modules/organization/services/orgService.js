const db = require('../../../config/db');
const crypto = require('crypto');
// IMPORT FONCTION EMAIL
const { sendInvitationEmail } = require('../../../shared/emailService');

// 1. Créer une Organisation
async function createOrganization(userId, name, taxId, address) {
    // Insère le propriétaire dès la création + Plan Pro par défaut
    const result = await db.query(
        "INSERT INTO organizations (name, tax_id, address, owner_id, plan) VALUES (?, ?, ?, ?, 'pro')",
        [name, taxId, address, userId]
    );
    const orgId = result.rows.insertId;

    // Lier l'utilisateur
    await db.query("UPDATE users SET organization_id = ? WHERE id = ?", [orgId, userId]);

    // Récupérer l'objet org complet pour le retour
    const orgRes = await db.query("SELECT * FROM organizations WHERE id = ?", [orgId]);
    return orgRes.rows[0];
}

// 2. Inviter un membre
async function inviteMember(adminUserId, email) {
    try {
        console.log(`[inviteMember] adminUserId: ${adminUserId}, targetEmail: ${email}`);

        const userRes = await db.query("SELECT organization_id FROM users WHERE id = ?", [adminUserId]);
        const orgId = userRes.rows[0]?.organization_id;

        console.log(`[inviteMember] orgId trouvé: ${orgId}`);

        if (!orgId) {
            console.error("[inviteMember] Erreur: orgId est null");
            throw new Error("Vous devez d'abord créer ou rejoindre une organisation.");
        }

        const token = crypto.randomBytes(32).toString('hex');

        console.log(`[inviteMember] Insertion invitation pour orgId ${orgId}...`);
        await db.query(
            "INSERT INTO organization_invitations (organization_id, email, token) VALUES (?, ?, ?)",
            [orgId, email, token]
        );
        console.log("[inviteMember] Insertion réussie");

        // Envoi Email (Nouveau Template)
        console.log(`[inviteMember] Envoi email à ${email}... par admin ${adminUserId}`);
        await sendInvitationEmail(email, token);
        console.log("[inviteMember] Processus terminé avec succès");

        return { message: "Invitation envoyée." };
    } catch (error) {
        console.error("[inviteMember] ERREUR:", error.message);
        throw error;
    }
}


// 3. Rejoindre via token
async function joinOrganizationByToken(userId, token) {
    const inviteRes = await db.query("SELECT * FROM organization_invitations WHERE token = ? AND status = 'pending'", [token]);
    if (inviteRes.rows.length === 0) return null;

    const invite = inviteRes.rows[0];

    await db.query("UPDATE users SET organization_id = ? WHERE id = ?", [invite.organization_id, userId]);
    await db.query("UPDATE organization_invitations SET status = 'accepted' WHERE id = ?", [invite.id]);

    return invite.organization_id;
}

// 4. Obtenir l'équipe (Renvoie objet { ownerId, members })
async function getTeamMembers(userId) {
    const userRes = await db.query("SELECT organization_id FROM users WHERE id = ?", [userId]);
    const orgId = userRes.rows[0]?.organization_id;

    if (!orgId) return { ownerId: null, members: [] };

    const orgRes = await db.query("SELECT owner_id FROM organizations WHERE id = ?", [orgId]);
    const ownerId = orgRes.rows[0]?.owner_id;

    const members = await db.query(
        "SELECT id, full_name, email, role, created_at FROM users WHERE organization_id = ? ORDER BY created_at ASC",
        [orgId]
    );

    return {
        ownerId: ownerId,
        members: members.rows
    };
}


// 5. Supprimer un membre
async function removeMember(ownerId, memberIdToDelete) {
    const orgResult = await db.query("SELECT id FROM organizations WHERE owner_id = ?", [ownerId]);

    if (orgResult.rows.length === 0) {
        throw new Error("Seul le responsable du cabinet peut supprimer des membres.");
    }

    const orgId = orgResult.rows[0].id;

    if (ownerId === memberIdToDelete) {
        throw new Error("Impossible de se retirer soi-même.");
    }

    const result = await db.query(
        "UPDATE users SET organization_id = NULL WHERE id = ? AND organization_id = ?",
        [memberIdToDelete, orgId]
    );

    if (result.rowCount === 0) {
        throw new Error("Utilisateur introuvable.");
    }

    return { message: "Membre retiré." };
}

module.exports = {
    createOrganization,
    inviteMember,
    joinOrganizationByToken,
    getTeamMembers,
    removeMember
};