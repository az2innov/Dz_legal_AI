import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import Traduction
import adminService from '../services/adminService';
import {
    LayoutDashboard, Users, Building2, TrendingUp, AlertTriangle,
    Clock, DollarSign, UserPlus, ArrowRight, Shield, ArrowUpCircle,
    Trash2, Ban, CheckCircle, Search, X, Check
} from 'lucide-react';
import Footer from '../components/Footer';

const AdminPage = () => {
    const { t, i18n } = useTranslation(); // Hook traduction
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);

    // États pour les Modales
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
            const [statsData, usersData, orgsData] = await Promise.all([
                adminService.getDashboardStats().catch(() => null),
                adminService.getAllUsers().catch(() => []),
                adminService.getAllOrganizations().catch(() => [])
            ]);
            setStats(statsData);
            setUsers(usersData);
            setOrgs(orgsData);
        } catch (error) {
            console.error("Erreur chargement admin:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS UTILISATEURS ---
    const openUserModal = (user) => {
        setSelectedUser(user);
        setSelectedPlan((user.plan || 'free').toLowerCase());
        setIsPlanModalOpen(true);
    };

    const handleSaveUserPlan = async () => {
        if (!selectedUser) return;
        try {
            await adminService.upgradeUser(selectedUser.id, selectedPlan);
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, plan: selectedPlan } : u));
            setIsPlanModalOpen(false);
        } catch (e) { alert("Erreur maj plan user"); }
    };

    const handleToggleUserStatus = async (user) => {
        if (!window.confirm(`Voulez-vous vraiment ${user.is_active ? 'bloquer' : 'activer'} cet utilisateur ?`)) return;
        try {
            await adminService.toggleUserStatus(user.id, !user.is_active);
            setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !user.is_active } : u));
        } catch (e) { alert("Erreur status"); }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Supprimer définitivement cet utilisateur ?")) return;
        try {
            await adminService.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (e) { alert("Erreur suppression"); }
    };

    // --- ACTIONS ORGANISATIONS ---
    const openOrgModal = (org) => {
        setSelectedOrg(org);
        setSelectedOrgPlan((org.plan || 'free').toLowerCase());
        setIsOrgModalOpen(true);
    };

    const handleSaveOrgPlan = async () => {
        if (!selectedOrg) return;
        try {
            await adminService.upgradeOrganization(selectedOrg.id, selectedOrgPlan);
            setOrgs(orgs.map(o => o.id === selectedOrg.id ? { ...o, plan: selectedOrgPlan } : o));
            setIsOrgModalOpen(false);
        } catch (e) { alert("Erreur maj plan org"); }
    };

    const handleToggleOrgStatus = async (org) => {
        if (!window.confirm(`Voulez-vous vraiment ${org.is_active ? 'suspendre' : 'activer'} ce cabinet ?`)) return;
        try {
            await adminService.toggleOrgStatus(org.id, !org.is_active);
            setOrgs(orgs.map(o => o.id === org.id ? { ...o, is_active: !org.is_active } : o));
        } catch (e) { alert("Erreur status org"); }
    };

    const handleDeleteOrg = async (orgId) => {
        if (!window.confirm("Supprimer définitivement ce cabinet et ses membres ?")) return;
        try {
            await adminService.deleteOrganization(orgId);
            setOrgs(orgs.filter(o => o.id !== orgId));
        } catch (e) { alert("Erreur suppression org"); }
    };

    // Helper Badge
    const getBadge = (plan) => {
        const p = (plan || 'free_trial').toLowerCase();
        if (['premium', 'pro'].includes(p)) return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-200">PRO/PREM</span>;
        if (p === 'basic') return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold border border-blue-200">BASIC</span>;
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold border border-gray-200">GRATUIT</span>;
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Chargement...</div>;

    return (
        <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-10rem)] p-6" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex-1">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Shield className="text-red-600" size={32} /> {t('admin.title')}
                    </h1>
                    <p className="text-gray-500 mt-2">{t('admin.subtitle')}</p>
                </header>

                {/* ONGLETS */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800">
                    {[
                        { id: 'dashboard', icon: LayoutDashboard, label: t('admin.tab_dashboard') },
                        { id: 'users', icon: Users, label: `${t('admin.tab_users')} (${users.length})` },
                        { id: 'orgs', icon: Building2, label: `${t('admin.tab_groups')} (${orgs.length})` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 px-4 font-medium capitalize flex items-center gap-2 transition-colors ${activeTab === tab.id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- CONTENU 1 : DASHBOARD STATS --- */}
                {activeTab === 'dashboard' && stats && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard title={t('admin.kpi_users')} value={stats.counts?.users_count} icon={Users} color="blue" />
                            <StatCard title={t('admin.kpi_groups')} value={stats.counts?.orgs_count} icon={Building2} color="purple" />
                            <StatCard title={t('admin.kpi_new')} value={`+${stats.counts?.new_users_count}`} icon={UserPlus} color="green" />
                            <StatCard title={t('admin.kpi_revenue')} value="--- DZD" icon={DollarSign} color="yellow" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* DERNIERS INSCRITS (FIXÉ POUR DARK MODE) */}
                            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                    <UserPlus size={20} className="text-green-500" /> {t('admin.latest_users')}
                                </h3>
                                <div className="space-y-3">
                                    {stats.recentUsers?.map(u => (
                                        <div
                                            key={u.id}
                                            className="flex justify-between items-center p-3 rounded-lg transition-colors bg-gray-50 border border-gray-100 dark:bg-gray-700/40 dark:border-gray-700"
                                        >
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{u.full_name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{u.email} {u.whatsapp_number && `• ${u.whatsapp_number}`}</p>
                                            </div>
                                            <span className="text-xs font-medium px-2 py-1 rounded border capitalize bg-white border-gray-200 text-gray-600 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200">
                                                {u.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ABONNEMENTS EXPIRANTS (FIXÉ POUR DARK MODE) */}
                            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-red-600">
                                    <Clock size={20} /> {t('admin.expiring_subs')}
                                </h3>
                                {stats.expiringSubs?.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('admin.nothing_to_report')}</p>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.expiringSubs?.map((sub, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between items-center p-3 rounded-lg transition-colors bg-red-50 border border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
                                            >
                                                <div className="overflow-hidden mr-3">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{sub.email}</p>
                                                    <p className="text-xs text-red-600 dark:text-red-400">Expire : {new Date(sub.start_date).toLocaleDateString()}</p>
                                                </div>
                                                <span className="text-xs font-bold uppercase px-2 py-1 rounded border whitespace-nowrap bg-white border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
                                                    {sub.plan}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- CONTENU 2 : TABLEAU UTILISATEURS --- */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4">{t('admin.col_user')}</th>
                                    <th className="px-6 py-4">{t('admin.col_role')}</th>
                                    <th className="px-6 py-4">{t('admin.col_status')}</th>
                                    <th className="px-6 py-4">{t('admin.col_plan')}</th>
                                    <th className="px-6 py-4">{t('admin.col_actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{u.full_name}</div>
                                            <div className="text-xs">{u.email}</div>
                                            {u.whatsapp_number && <div className="text-xs text-green-600 dark:text-green-400 font-medium">WA: {u.whatsapp_number}</div>}
                                        </td>
                                        <td className="px-6 py-4"><span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs">{u.role}</span></td>
                                        <td className="px-6 py-4">
                                            {u.is_active
                                                ? <span className="text-green-600 dark:text-green-400 flex gap-1 items-center"><CheckCircle size={14} /> {t('admin.user_active')}</span>
                                                : <span className="text-red-500 dark:text-red-400 flex gap-1 items-center"><Ban size={14} /> {t('admin.user_blocked')}</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 uppercase font-mono">{u.plan || 'FREE'}</td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => openUserModal(u)} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded"><ArrowUpCircle size={18} /></button>
                                            <button onClick={() => handleToggleUserStatus(u)} className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-1.5 rounded"><Ban size={18} /></button>
                                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- CONTENU 3 : TABLEAU ORGANISATIONS --- */}
                {activeTab === 'orgs' && (
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-800">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4">{t('admin.col_group')}</th>
                                    <th className="px-6 py-4">{t('admin.col_manager')}</th>
                                    <th className="px-6 py-4">{t('admin.col_members')}</th>
                                    <th className="px-6 py-4">{t('admin.col_plan')}</th>
                                    <th className="px-6 py-4">{t('admin.col_actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orgs.map(org => (
                                    <tr key={org.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{org.name}</td>
                                        <td className="px-6 py-4">
                                            <div>{org.owner_name}</div>
                                            <div className="text-xs text-gray-400">{org.owner_email}</div>
                                        </td>
                                        <td className="px-6 py-4">{org.member_count}</td>
                                        <td className="px-6 py-4">{getBadge(org.plan)}</td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => openOrgModal(org)} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 rounded"><ArrowUpCircle size={18} /></button>
                                            <button onClick={() => handleToggleOrgStatus(org)} className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-1.5 rounded"><Ban size={18} /></button>
                                            <button onClick={() => handleDeleteOrg(org.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- MODALE UTILISATEURS --- */}
                {isPlanModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xl font-bold dark:text-white">{t('admin.modal_edit_user')}</h3>
                                <button onClick={() => setIsPlanModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><X /></button>
                            </div>
                            <p className="mb-4 text-gray-600 dark:text-gray-400">{t('admin.col_user')} : <b>{selectedUser.full_name}</b></p>
                            <div className="space-y-3 mb-6">
                                {['free_trial', 'basic', 'premium'].map(p => (
                                    <div key={p} onClick={() => setSelectedPlan(p)} className={`flex justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedPlan === p ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                        <span className="capitalize dark:text-gray-200">{p === 'free_trial' ? 'GRATUIT (Test)' : p}</span>
                                        {selectedPlan === p && <Check className="text-primary-600" />}
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleSaveUserPlan} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium">{t('admin.btn_save')}</button>
                        </div>
                    </div>
                )}

                {/* --- MODALE ORGANISATIONS --- */}
                {isOrgModalOpen && selectedOrg && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xl font-bold dark:text-white">{t('admin.modal_edit_group')}</h3>
                                <button onClick={() => setIsOrgModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><X /></button>
                            </div>
                            <p className="mb-4 text-gray-600 dark:text-gray-400">{t('admin.col_group')} : <b>{selectedOrg.name}</b></p>
                            <div className="space-y-3 mb-6">
                                <div onClick={() => setSelectedOrgPlan('free')} className={`flex justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedOrgPlan === 'free' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                    <span className="dark:text-gray-200">Standard (Gratuit)</span>
                                    {selectedOrgPlan === 'free' && <Check className="text-primary-600" />}
                                </div>
                                <div onClick={() => setSelectedOrgPlan('pro')} className={`flex justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedOrgPlan === 'pro' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                    <span className="dark:text-gray-200">PRO (Payant)</span>
                                    {selectedOrgPlan === 'pro' && <Check className="text-primary-600" />}
                                </div>
                            </div>
                            <button onClick={handleSaveOrgPlan} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium">{t('admin.btn_save')}</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 opacity-80">
                <Footer />
            </div>
        </div>
    );
};

// Composant Helper pour les cartes KPI (Fixé Dark Mode)
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex justify-between items-start transition-colors">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <h4 className="text-3xl font-bold text-gray-900 dark:text-white">{value || 0}</h4>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400`}>
            <Icon size={24} />
        </div>
    </div>
);

export default AdminPage;