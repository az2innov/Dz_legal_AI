const db = require('../../../config/db');
const crypto = require('crypto');
const { sendEmail } = require('../../../shared/emailService');

// 1. Créer une Organisation
async function createOrganization(userId, name, taxId, address) {
    // On insère le owner_id dès la création
    const orgResult = await db.query(
        "INSERT INTO organizations (name, tax_id, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, taxId, address, userId]
    );
    const org = orgResult.rows[0];

    // On lie l'utilisateur à l'organisation
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

    const link = `${process.env.FRONTEND_URL}/register?invite=${token}`;
    await sendEmail(
        email,
        "Invitation à rejoindre un Cabinet sur Dz Legal AI",
        `Cliquez ici pour rejoindre : ${link}`,
        `<p>Vous avez été invité à rejoindre un espace de travail.</p><p><a href="${link}">Cliquez ici pour créer votre compte et rejoindre l'équipe.</a></p>`
    );

    return { message: "Invitation envoyée." };
}

// 3. Rejoindre une organisation via Token
async function joinOrganizationByToken(userId, token) {
    const inviteRes = await db.query("SELECT * FROM organization_invitations WHERE token = $1 AND status = 'pending'", [token]);
    if (inviteRes.rows.length === 0) return null; 

    const invite = inviteRes.rows[0];

    await db.query("UPDATE users SET organization_id = $1 WHERE id = $2", [invite.organization_id, userId]);
    await db.query("UPDATE organization_invitations SET status = 'accepted' WHERE id = $1", [invite.id]);

    return invite.organization_id;
}

// 4. Obtenir les membres de mon équipe (CORRIGÉ POUR LE FRONTEND)
async function getTeamMembers(userId) {
    // A. Récupérer l'ID de l'organisation
    const userRes = await db.query("SELECT organization_id FROM users WHERE id = $1", [userId]);
    const orgId = userRes.rows[0]?.organization_id;

    if (!orgId) {
        // Retourne un objet vide structuré pour éviter que le frontend plante
        return { ownerId: null, members: [] };
    }

    // B. Récupérer le propriétaire (Chef) de cette organisation
    const orgRes = await db.query("SELECT owner_id FROM organizations WHERE id = $1", [orgId]);
    const ownerId = orgRes.rows[0]?.owner_id;

    // C. Récupérer la liste des membres
    const members = await db.query(
        "SELECT id, full_name, email, role, created_at FROM users WHERE organization_id = $1 ORDER BY created_at ASC", 
        [orgId]
    );

    // D. Retourner l'objet combiné { ownerId, members }
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
        throw new Error("Impossible de se retirer soi-même. Vous devez supprimer le cabinet.");
    }

    const result = await db.query(
        "UPDATE users SET organization_id = NULL WHERE id = $1 AND organization_id = $2",
        [memberIdToDelete, orgId]
    );

    if (result.rowCount === 0) {
        throw new Error("Utilisateur introuvable ou ne fait pas partie de votre cabinet.");
    }

    return { message: "Membre retiré du cabinet avec succès." };
}

module.exports = { 
    createOrganization, 
    inviteMember, 
    joinOrganizationByToken, 
    getTeamMembers, 
    removeMember 
};