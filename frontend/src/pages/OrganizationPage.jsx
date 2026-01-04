import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import orgService from '../services/orgService';
import { Building2, Users, Plus, Mail, Loader2, Trash2, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import authService from '../services/authService';
import Footer from '../components/Footer';

const OrganizationPage = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();

    const [orgData, setOrgData] = useState({ name: '', taxId: '', address: '' });

    const [team, setTeam] = useState([]);
    const [ownerId, setOwnerId] = useState(null); // NOUVEAU : ID du propriétaire

    const [inviteEmail, setInviteEmail] = useState('');
    const [hasOrg, setHasOrg] = useState(!!user?.organization_id);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (hasOrg) {
            loadTeam();
        }
    }, [hasOrg]);

    const loadTeam = async () => {
        try {
            // Le service renvoie maintenant { ownerId, members }
            const data = await orgService.getTeam();
            setTeam(data.members || []);
            setOwnerId(data.ownerId); // On stocke l'ID du chef
        } catch (e) {
            console.error("Erreur chargement équipe", e);
        }
    };

    // Est-ce que JE suis le propriétaire ?
    const isCurrentUserOwner = user && ownerId && user.id === ownerId;

    const refreshUserProfile = async () => {
        // ... (Code inchangé) ...
        try {
            const API_URL = 'http://192.168.1.117:3001/api/auth';
            const token = authService.getToken();
            const response = await axios.get(`${API_URL}/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.reload();
        } catch (e) { console.error(e); }
    };

    const handleCreateOrg = async (e) => {
        // ... (Code inchangé) ...
        e.preventDefault();
        setLoading(true);
        try {
            await orgService.createOrganization(orgData);
            alert(i18n.language === 'ar' ? "تم إنشاء المكتب بنجاح!" : "Cabinet créé avec succès !");
            await refreshUserProfile();
        } catch (e) {
            alert("Erreur lors de la création.");
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await orgService.inviteMember(inviteEmail);
            alert(i18n.language === 'ar' ? `تم إرسال الدعوة إلى ${inviteEmail}` : `Invitation envoyée à ${inviteEmail}`);
            setInviteEmail('');
        } catch (e) {
            alert("Erreur lors de l'invitation.");
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir retirer ce membre du cabinet ?")) return;
        try {
            await orgService.removeMember(memberId);
            setTeam(team.filter(m => m.id !== memberId));
        } catch (error) {
            alert(error.response?.data?.error || "Impossible de supprimer ce membre.");
        }
    };

    if (!hasOrg) {
        return (
            <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-10rem)]">
                <div className="flex-1 mt-10 max-w-2xl mx-auto w-full">
                    {/* Formulaire Création (Inchangé) */}
                    <div className="bg-white dark:bg-dark-card p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 text-primary-600"><Building2 size={32} /></div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{i18n.language === 'ar' ? 'إنشاء مكتبك (مؤسسة)' : 'Créer votre Cabinet'}</h2>
                        </div>
                        <form onSubmit={handleCreateOrg} className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1">Nom du Cabinet</label><input type="text" className="w-full p-2.5 rounded-lg border outline-none" value={orgData.name} onChange={e => setOrgData({ ...orgData, name: e.target.value })} required /></div>
                            <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2.5 rounded-lg">{loading ? <Loader2 className="animate-spin mx-auto" /> : 'Créer'}</button>
                        </form>
                    </div>
                </div>
                <div className="mt-12 opacity-80">
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-10rem)]">
            <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Building2 className="text-primary-600" />
                        {i18n.language === 'ar' ? 'مكتبي (مؤسسة)' : 'Mon Cabinet (Organisation)'}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LISTE DES MEMBRES */}
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white border-b pb-4">
                            <Users size={20} className="text-primary-500" />
                            {i18n.language === 'ar' ? 'فريق العمل' : 'Membres de l\'équipe'}
                        </h3>

                        <ul className="space-y-3">
                            {team.length === 0 && <p className="text-gray-500 text-sm">Aucun membre.</p>}

                            {team.map(member => {
                                const isMemberOwner = member.id === ownerId;
                                const isMe = user && user.id === member.id;
                                return (
                                    <li key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${isMemberOwner ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                                {member.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{member.full_name}</p>
                                                    {isMemberOwner && <Crown size={12} className="text-yellow-500" title="Propriétaire" />}
                                                </div>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md border bg-primary-50 text-primary-700 border-primary-100">{member.role}</span>
                                            {isCurrentUserOwner && !isMe && (
                                                <button onClick={() => handleRemoveMember(member.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" title="Retirer du cabinet"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* FORMULAIRE INVITATION */}
                    {isCurrentUserOwner && (
                        <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 h-fit">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                <Plus size={20} className="text-green-500" />
                                {i18n.language === 'ar' ? 'دعوة زميل' : 'Inviter un collaborateur'}
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                                <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">Le collaborateur invité aura accès à tous les documents.</p>
                            </div>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">{i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email du collaborateur'}</label>
                                    <div className="flex gap-2">
                                        <input type="email" className="flex-1 p-2.5 rounded-lg border outline-none dark:bg-gray-800 dark:text-white" placeholder="collegue@cabinet.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-lg flex items-center gap-2 font-medium"><Mail size={18} /> Inviter</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 opacity-80">
                <Footer />
            </div>
        </div>
    );
};

export default OrganizationPage;