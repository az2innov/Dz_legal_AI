const db = require('../../../config/db');
const crypto = require('crypto');
// IMPORT FONCTION EMAIL
const { sendInvitationEmail } = require('../../../shared/emailService');

// 1. Créer une Organisation
async function createOrganization(userId, name, taxId, address) {
    // Insère le propriétaire dès la création + Plan Pro par défaut
    const orgResult = await db.query(
        "INSERT INTO organizations (name, tax_id, address, owner_id, plan) VALUES ($1, $2, $3, $4, 'pro') RETURNING *",
        [name, taxId, address, userId]
    );
    const org = orgResult.rows[0];

    // Lier l'utilisateur
    await db.query("UPDATE users SET organization_id = $1 WHERE id = $2", [org.id, userId]);

    return org;
}

// 2. Inviter un membre
async function inviteMember(adminUserId, email) {
    const userRes = await db.query("SELECT organization_id FROM users WHERE id = $1", [adminUserId]);
    const orgId = userRes.rows[0]?.organization_id;

    if (!orgId) throw new Error("Vous devez d'abord créer ou rejoindre une organisation.");

    const token = crypto.randomBytes(32).toString('hex');

    await db.query(
        "INSERT INTO organization_invitations (organization_id, email, token) VALUES ($1, $2, $3)",
        [orgId, email, token]
    );

    // Envoi Email (Nouveau Template)
    await sendInvitationEmail(email, token);

    return { message: "Invitation envoyée." };
}

// 3. Rejoindre via token
async function joinOrganizationByToken(userId, token) {
    const inviteRes = await db.query("SELECT * FROM organization_invitations WHERE token = $1 AND status = 'pending'", [token]);
    if (inviteRes.rows.length === 0) return null; 

    const invite = inviteRes.rows[0];

    await db.query("UPDATE users SET organization_id = $1 WHERE id = $2", [invite.organization_id, userId]);
    await db.query("UPDATE organization_invitations SET status = 'accepted' WHERE id = $1", [invite.id]);

    return invite.organization_id;
}

// 4. Obtenir l'équipe (Renvoie objet { ownerId, members })
async function getTeamMembers(userId) {
    const userRes = await db.query("SELECT organization_id FROM users WHERE id = $1", [userId]);
    const orgId = userRes.rows[0]?.organization_id;

    if (!orgId) return { ownerId: null, members: [] };

    const orgRes = await db.query("SELECT owner_id FROM organizations WHERE id = $1", [orgId]);
    const ownerId = orgRes.rows[0]?.owner_id;

    const members = await db.query("SELECT id, full_name, email, role, created_at FROM users WHERE organization_id = $1 ORDER BY created_at ASC", [orgId]);
    
    return { 
        ownerId: ownerId, 
        members: members.rows 
    };
}

// 5. Supprimer un membre
async function removeMember(ownerId, memberIdToDelete) {
    const orgResult = await db.query("SELECT id FROM organizations WHERE owner_id = $1", [ownerId]);
    
    if (orgResult.rows.length === 0) {
        throw new Error("Seul le responsable du cabinet peut supprimer des membres.");
    }
    
    const orgId = orgResult.rows[0].id;

    if (ownerId === memberIdToDelete) {
        throw new Error("Impossible de se retirer soi-même.");
    }

    const result = await db.query(
        "UPDATE users SET organization_id = NULL WHERE id = $1 AND organization_id = $2",
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