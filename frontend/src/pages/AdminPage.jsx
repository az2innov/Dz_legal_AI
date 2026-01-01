import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Shield, ArrowUpCircle, Trash2, Ban, CheckCircle, Building2, User, X, Check, Briefcase } from 'lucide-react';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); 
    const [loading, setLoading] = useState(true);

    // --- ÉTATS MODALES ---
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState('');

    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [selectedOrgPlan, setSelectedOrgPlan] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, orgsData] = await Promise.all([
                adminService.getAllUsers(),
                adminService.getAllOrganizations().catch(() => []) 
            ]);
            setUsers(usersData || []);
            setOrgs(orgsData || []);
        } catch (error) {
            console.error("Erreur chargement admin:", error);
        } finally {
            setLoading(false);
        }
    };

    // ===========================
    // LOGIQUE UTILISATEURS
    // ===========================
    const openPlanModal = (user) => {
        setSelectedUser(user);
        // Par sécurité, on fallback sur 'free' si le plan est null
        setSelectedPlan((user.plan || 'free').toLowerCase()); 
        setIsPlanModalOpen(true);
    };

    const handleSavePlan = async () => {
        if (!selectedUser) return;
        
        // Confirmation UI
        if(!window.confirm(`Confirmez-vous le passage au plan ${selectedPlan.toUpperCase()} pour ${selectedUser.full_name} ?`)) return;

        try {
            await adminService.upgradeUser(selectedUser.id, selectedPlan);
            
            // Mise à jour locale immédiate
            setUsers(users.map(u => 
                u.id === selectedUser.id ? { ...u, plan: selectedPlan } : u
            ));
            setIsPlanModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Erreur technique lors de la mise à jour de l'utilisateur.");
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = !user.is_active;
        const actionName = newStatus ? "activer" : "bloquer";
        
        if(!window.confirm(`Voulez-vous vraiment ${actionName} cet utilisateur ?`)) return;

        try {
            await adminService.toggleUserStatus(user.id, newStatus);
            setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
        } catch (error) { 
            console.error(error);
            alert("Erreur lors du changement de statut."); 
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("ATTENTION : Cette action est irréversible. Supprimer définitivement cet utilisateur ?")) return;
        try {
            await adminService.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) { 
            console.error(error);
            alert("Erreur lors de la suppression."); 
        }
    };

    // ===========================
    // LOGIQUE ORGANISATIONS
    // ===========================
    
    const openOrgModal = (org) => {
        setSelectedOrg(org);
        setSelectedOrgPlan((org.plan || 'free').toLowerCase()); 
        setIsOrgModalOpen(true);
    };

    const handleSaveOrgPlan = async () => {
        if (!selectedOrg) return;
        const planLabel = selectedOrgPlan === 'pro' ? 'PRO' : 'STANDARD';
        
        if(!window.confirm(`Passer le cabinet "${selectedOrg.name}" en formule ${planLabel} ?`)) return;

        try {
            await adminService.upgradeOrganization(selectedOrg.id, selectedOrgPlan);
            
            // Mise à jour locale
            setOrgs(orgs.map(o => o.id === selectedOrg.id ? { ...o, plan: selectedOrgPlan } : o));
            setIsOrgModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour du cabinet. Vérifiez que la BDD est à jour.");
        }
    };

    const handleToggleOrgStatus = async (org) => {
        const newStatus = !org.is_active;
        const action = newStatus ? "activer" : "suspendre";
        
        if(!window.confirm(`Voulez-vous vraiment ${action} le cabinet "${org.name}" ?\n(Cela impactera l'accès de tous les membres)`)) return;

        try {
            await adminService.toggleOrgStatus(org.id, newStatus);
            setOrgs(orgs.map(o => o.id === org.id ? { ...o, is_active: newStatus } : o));
        } catch (error) {
            console.error(error);
            alert(`Impossible de ${action} l'organisation.`);
        }
    };

    const handleDeleteOrg = async (orgId) => {
        if (!window.confirm("ATTENTION CRITIQUE :\nVous êtes sur le point de supprimer un cabinet entier.\nCela supprimera tous les membres, documents et historiques associés.\n\nConfirmer la suppression ?")) return;
        
        try {
            await adminService.deleteOrganization(orgId);
            setOrgs(orgs.filter(o => o.id !== orgId));
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression de l'organisation.");
        }
    };

    // Helper Badges (Affichage joli des plans)
    const getBadge = (plan, type = 'user') => {
        const p = (plan || 'free').toLowerCase();
        
        if (type === 'org') {
            return p === 'pro' 
                ? <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-bold border border-indigo-200">PRO (ABONNÉ)</span>
                : <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">STANDARD</span>;
        }
        
        // Logique User
        switch(p) {
            case 'premium': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-200">PREMIUM</span>;
            case 'basic': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold border border-blue-200">BASIC</span>;
            default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold border border-gray-200">TEST (FREE)</span>;
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Chargement...</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 relative">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <Shield className="text-red-600 h-8 w-8" />
                Administration Système
            </h1>

            {/* ONGLETS */}
            <div className="flex gap-4 mb-6">
                <button 
                    onClick={() => setActiveTab('users')} 
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'users' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                >
                    <User size={18} /> Utilisateurs ({users.length})
                </button>
                <button 
                    onClick={() => setActiveTab('orgs')} 
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${activeTab === 'orgs' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                >
                    <Building2 size={18} /> Organisations ({orgs.length})
                </button>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                <div className="overflow-x-auto">
                    
                    {/* TABLEAU UTILISATEURS */}
                    {activeTab === 'users' && (
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Utilisateur</th>
                                    <th className="px-6 py-4">Rôle</th>
                                    <th className="px-6 py-4">État</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <div className="text-base font-semibold">{u.full_name}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{u.role}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.is_active 
                                                ? <span className="text-green-600 flex gap-1 items-center font-medium"><CheckCircle size={14}/> Actif</span> 
                                                : <span className="text-red-500 flex gap-1 items-center font-medium"><Ban size={14}/> Bloqué</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            {getBadge(u.plan, 'user')}
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => openPlanModal(u)} className="text-primary-600 hover:bg-primary-100 p-1.5 rounded border border-primary-200 transition-colors" title="Modifier Plan"><ArrowUpCircle size={18} /></button>
                                            <button onClick={() => handleToggleStatus(u)} className={`${u.is_active ? 'text-orange-500 hover:bg-orange-100' : 'text-green-500 hover:bg-green-100'} p-1.5 rounded transition-colors`} title={u.is_active ? "Bloquer" : "Activer"}>{u.is_active ? <Ban size={18} /> : <CheckCircle size={18} />}</button>
                                            <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors" title="Supprimer"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    
                    {/* TABLEAU ORGANISATIONS */}
                    {activeTab === 'orgs' && (
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Cabinet</th>
                                    <th className="px-6 py-4">Responsable</th>
                                    <th className="px-6 py-4">État</th>
                                    <th className="px-6 py-4">Formule</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orgs.map((org) => (
                                    <tr key={org.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={16} className="text-gray-400"/>
                                                {org.name}
                                            </div>
                                            <div className="text-xs font-normal text-gray-500 ml-6">{org.address || 'Adresse non renseignée'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {org.owner_name}
                                            <div className="text-xs text-gray-500">{org.owner_email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {org.is_active 
                                                ? <span className="text-green-600 flex items-center gap-1 text-xs font-bold uppercase"><CheckCircle size={14}/> Actif</span>
                                                : <span className="text-red-500 flex items-center gap-1 text-xs font-bold uppercase"><Ban size={14}/> Suspendu</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            {getBadge(org.plan, 'org')}
                                            <div className="text-xs text-gray-400 mt-1">{org.member_count || 0} membres</div>
                                        </td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => openOrgModal(org)} className="text-primary-600 hover:bg-primary-100 p-1.5 rounded border border-primary-200 transition-colors" title="Modifier l'abonnement"><ArrowUpCircle size={18} /></button>
                                            <button onClick={() => handleToggleOrgStatus(org)} className={`${org.is_active ? 'text-orange-500 hover:bg-orange-100' : 'text-green-500 hover:bg-green-100'} p-1.5 rounded transition-colors`} title={org.is_active ? "Suspendre" : "Activer"}>{org.is_active ? <Ban size={18} /> : <CheckCircle size={18} />}</button>
                                            <button onClick={() => handleDeleteOrg(org.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors" title="Supprimer"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* --- MODALE UTILISATEURS (Refaite PROPREMENT) --- */}
            {isPlanModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <User size={20}/> Abonnement Utilisateur
                            </h3>
                            <button onClick={() => setIsPlanModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        
                        <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.full_name}</p>
                            <p className="text-xs text-gray-500">{selectedUser.email}</p>
                        </div>

                        <div className="space-y-3 mb-6">
                            {['free', 'basic', 'premium'].map(plan => (
                                <div 
                                    key={plan} 
                                    onClick={() => setSelectedPlan(plan)} 
                                    className={`flex justify-between items-center p-4 rounded-lg border cursor-pointer transition-all ${
                                        selectedPlan === plan 
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === plan ? 'border-primary-600 bg-primary-600' : 'border-gray-400'}`}>
                                            {selectedPlan === plan && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="capitalize font-medium text-gray-700 dark:text-gray-200">
                                            {plan === 'free' ? 'Test (Gratuit)' : plan}
                                        </span>
                                    </div>
                                    <span className="text-xs uppercase font-bold text-gray-400">{plan}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setIsPlanModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">Annuler</button>
                            <button onClick={handleSavePlan} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex justify-center items-center gap-2 font-medium">
                                <Check size={18} /> Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODALE ORGANISATIONS --- */}
            {isOrgModalOpen && selectedOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Building2 size={20}/> Formule Cabinet
                            </h3>
                            <button onClick={() => setIsOrgModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>

                        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <p className="font-bold text-lg text-indigo-900 dark:text-indigo-100">{selectedOrg.name}</p>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">Responsable : {selectedOrg.owner_name}</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            {/* Option STANDARD */}
                            <div 
                                onClick={() => setSelectedOrgPlan('free')} 
                                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${selectedOrgPlan === 'free' ? 'border-gray-500 bg-gray-50 ring-1 ring-gray-400' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedOrgPlan === 'free' ? 'border-gray-600 bg-gray-600' : 'border-gray-400'}`}>
                                        {selectedOrgPlan === 'free' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-800 dark:text-gray-200 block">Standard</span>
                                        <span className="text-xs text-gray-500">Sans abonnement</span>
                                    </div>
                                </div>
                            </div>

                            {/* Option PRO */}
                            <div 
                                onClick={() => setSelectedOrgPlan('pro')} 
                                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${selectedOrgPlan === 'pro' ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedOrgPlan === 'pro' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}>
                                        {selectedOrgPlan === 'pro' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <div>
                                        <span className="font-bold text-indigo-900 dark:text-white block">Cabinet PRO</span>
                                        <span className="text-xs text-indigo-600">Fonctionnalités complètes</span>
                                    </div>
                                </div>
                                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">PRO</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setIsOrgModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Annuler</button>
                            <button onClick={handleSaveOrgPlan} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex justify-center items-center gap-2 font-medium">
                                <Check size={18} /> Valider
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;