import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import Traduction
import adminService from '../services/adminService';
import {
    LayoutDashboard, Users, Building2, TrendingUp, AlertTriangle,
    Clock, DollarSign, UserPlus, ArrowRight, Shield, ArrowUpCircle,
    Trash2, Ban, CheckCircle, Search, X, Check, FileText, CheckSquare, XSquare, Image
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

    // États pour les demandes de plan
    const [planRequests, setPlanRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [requestStatus, setRequestStatus] = useState('pending');

    // États pour le Carrousel
    const [slides, setSlides] = useState([]);
    const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(null);
    const [slideForm, setSlideForm] = useState({ title: '', description: '', image_url: '', link_url: '', is_active: true, display_order: 0, language: 'fr' });

    useEffect(() => {
        loadData();
        loadPlanRequests(); // ✅ Charger les demandes au montage initial
    }, []);

    useEffect(() => {
        if (activeTab === 'requests') {
            loadPlanRequests();
        }
    }, [activeTab, requestStatus]);

    const loadData = async () => {
        try {
            console.log('[ADMIN] 📊 Chargement des données...');

            const [statsData, usersData, orgsData, slidesData] = await Promise.all([
                adminService.getDashboardStats().catch((e) => {
                    console.error('[ADMIN] ❌ Erreur stats:', e);
                    return null;
                }),
                adminService.getAllUsers().catch((e) => {
                    console.error('[ADMIN] ❌ Erreur users:', e);
                    return [];
                }),
                adminService.getAllOrganizations().catch((e) => {
                    console.error('[ADMIN] ❌ Erreur orgs:', e);
                    return [];
                }),
                adminService.getNewsSlides().catch((e) => { // [NEW] News
                    console.error('[ADMIN] ❌ Erreur slides:', e);
                    return [];
                })
            ]);

            console.log('[ADMIN] ✅ Stats:', statsData);
            console.log('[ADMIN] ✅ Users chargés:', usersData?.length || 0);
            console.log('[ADMIN] ✅ Orgs chargés:', orgsData?.length || 0);
            console.log('[ADMIN] ✅ Slides chargés:', slidesData?.length || 0);

            setStats(statsData);
            setUsers(usersData);
            setOrgs(orgsData);
            setSlides(slidesData);
        } catch (error) {
            console.error("[ADMIN] ❌ Erreur chargement admin:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadPlanRequests = async () => {
        try {
            console.log('[ADMIN] 📋 Chargement des demandes de plan...');
            const requests = await adminService.getPlanRequests(requestStatus);
            console.log('[ADMIN] ✅ Demandes chargées:', requests?.length || 0);
            setPlanRequests(requests || []);
        } catch (error) {
            console.error('[ADMIN] ❌ Erreur chargement demandes:', error);
            setPlanRequests([]);
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
            console.log(`[ADMIN] 💾 Sauvegarde du plan ${selectedPlan} pour user ${selectedUser.id}...`);

            // 1. Envoyer la mise à jour au serveur
            await adminService.upgradeUser(selectedUser.id, selectedPlan);
            console.log(`[ADMIN] ✅ Plan sauvegardé sur le serveur`);

            // 2. ✅ CORRECTION: Mise à jour immédiate de l'état local pour feedback instantané
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, plan: selectedPlan } : u));
            setIsPlanModalOpen(false);

            // 3. ✅ Recharger les données après un délai pour s'assurer de la persistance
            setTimeout(async () => {
                console.log(`[ADMIN] 🔄 Vérification de la persistance...`);
                await loadData();
                console.log(`[ADMIN] ✅ Données actualisées depuis le serveur`);
            }, 500); // 500ms pour laisser le temps à la DB de commiter

        } catch (e) {
            console.error('[ADMIN] ❌ Erreur lors de la sauvegarde du plan:', e);
            alert("Erreur maj plan user");
        }
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
            console.log(`[ADMIN] 💾 Sauvegarde du plan ${selectedOrgPlan} pour org ${selectedOrg.id}...`);

            // 1. Envoyer la mise à jour au serveur
            await adminService.upgradeOrganization(selectedOrg.id, selectedOrgPlan);
            console.log(`[ADMIN] ✅ Plan org sauvegardé sur le serveur`);

            // 2. ✅ CORRECTION: Mise à jour immédiate de l'état local pour feedback instantané
            setOrgs(orgs.map(o => o.id === selectedOrg.id ? { ...o, plan: selectedOrgPlan } : o));
            setIsOrgModalOpen(false);

            // 3. ✅ Recharger les données après un délai pour s'assurer de la persistance
            setTimeout(async () => {
                console.log(`[ADMIN] 🔄 Vérification de la persistance org...`);
                await loadData();
                console.log(`[ADMIN] ✅ Données org actualisées depuis le serveur`);
            }, 500);

        } catch (e) {
            console.error('[ADMIN] ❌ Erreur lors de la sauvegarde du plan org:', e);
            alert("Erreur maj plan org");
        }
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

    // --- ACTIONS DEMANDES PLANS ---
    const openApproveModal = (request) => {
        setSelectedRequest(request);
        setAdminNotes('');
        setIsApproveModalOpen(true);
    };

    const openRejectModal = (request) => {
        setSelectedRequest(request);
        setAdminNotes('');
        setIsRejectModalOpen(true);
    };

    const handleApproveRequest = async () => {
        if (!selectedRequest) return;
        try {
            console.log(`[ADMIN] ✅ Approbation demande ${selectedRequest.id}...`);
            await adminService.approvePlanRequest(selectedRequest.id, adminNotes);
            setIsApproveModalOpen(false);
            await loadPlanRequests(); // Recharger la liste
            alert(t('admin.approve_success'));
        } catch (e) {
            console.error('[ADMIN] ❌ Erreur approbation:', e);
            alert('Erreur lors de l\'approbation');
        }
    };

    const handleRejectRequest = async () => {
        if (!selectedRequest || !adminNotes.trim()) {
            alert(t('admin.reject_reason_required'));
            return;
        }
        try {
            console.log(`[ADMIN] ❌ Rejet demande ${selectedRequest.id}...`);
            await adminService.rejectPlanRequest(selectedRequest.id, adminNotes);
            setIsRejectModalOpen(false);
            await loadPlanRequests(); // Recharger la liste
            alert(t('admin.reject_success'));
        } catch (e) {
            console.error('[ADMIN] ❌ Erreur rejet:', e);
            alert('Erreur lors du rejet');
        }
    };


    // --- ACTIONS SLIDES (CAROUSEL) ---
    const openSlideModal = (slide = null) => {
        if (slide) {
            setCurrentSlide(slide);
            setSlideForm({ ...slide });
        } else {
            setCurrentSlide(null);
            setSlideForm({ title: '', description: '', image_url: '', link_url: '', is_active: true, display_order: 0, language: 'fr' });
        }
        setIsSlideModalOpen(true);
    };

    const handleSaveSlide = async (e) => {
        e.preventDefault();
        try {
            if (currentSlide) {
                await adminService.updateNewsSlide(currentSlide.id, slideForm);
                setSlides(slides.map(s => s.id === currentSlide.id ? { ...slideForm, id: s.id } : s));
            } else {
                const res = await adminService.createNewsSlide(slideForm);
                setSlides([...slides, { ...slideForm, id: res.id }]);
            }
            setIsSlideModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Erreur sauvegarde slide");
        }
    };

    const handleDeleteSlide = async (id) => {
        if (!window.confirm("Supprimer ce slide ?")) return;
        try {
            await adminService.deleteNewsSlide(id);
            setSlides(slides.filter(s => s.id !== id));
        } catch (error) {
            console.error(error);
            alert("Erreur suppression slide");
        }
    };

    const handleToggleSlide = async (slide) => {
        try {
            const updated = { ...slide, is_active: !slide.is_active };
            await adminService.updateNewsSlide(slide.id, updated);
            setSlides(slides.map(s => s.id === slide.id ? updated : s));
        } catch (error) {
            console.error(error);
        }
    };

    // Helper Badge
    const getBadge = (plan) => {
        const p = (plan || 'free_trial').toLowerCase();
        if (['premium', 'pro'].includes(p)) return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-200">PRO/PREM</span>;
        if (p === 'basic') return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold border border-blue-200">BASIC</span>;
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold border border-gray-200">GRATUIT</span>;
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: `⏳ ${t('admin.filter_pending')}` },
            approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: `✅ ${t('pricing.statusApproved')}` },
            rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: `❌ ${t('pricing.statusRejected')}` },
            cancelled: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: `🚫 ${t('pricing.statusCancelled')}` }
        };
        const { bg, text, label } = styles[status] || styles.pending;
        return <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-medium`}>{label}</span>;
    };

    if (loading) return <div className="p-10 text-center text-gray-500">{t('common.loading')}</div>;

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
                        { id: 'orgs', icon: Building2, label: `${t('admin.tab_groups')} (${orgs.length})` },
                        { id: 'requests', icon: FileText, label: `${t('admin.tab_plan_requests')} (${planRequests.length})` },
                        { id: 'news', icon: Image, label: `Actualités (${slides.length})` }
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
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="uppercase font-mono text-gray-900 dark:text-white">{u.plan || 'FREE'}</span>
                                                {u.organization_id && (
                                                    <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                                        <Building2 size={12} />
                                                        via {u.organization_name || 'Organisation'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
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

                {/* --- CONTENU 4 : DEMANDES PLANS --- */}
                {activeTab === 'requests' && (
                    <div className="space-y-6">
                        {/* Filtres */}
                        <div className="flex gap-2 mb-4">
                            {['pending', 'approved', 'rejected', 'all'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setRequestStatus(s)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${requestStatus === s
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {s === 'all' ? t('admin.filter_all') : s === 'pending' ? t('admin.filter_pending') : s === 'approved' ? t('admin.filter_approved') : t('admin.filter_rejected')}
                                </button>
                            ))}
                        </div>

                        {/* Tableau */}
                        {planRequests.length === 0 ? (
                            <div className="bg-white dark:bg-dark-card rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
                                <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                                <p className="text-gray-500 dark:text-gray-400">{t('admin.no_requests')}</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-dark-card rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-800">
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="px-6 py-4">{t('admin.col_id')}</th>
                                            <th className="px-6 py-4">{t('admin.col_user')}</th>
                                            <th className="px-6 py-4">{t('admin.col_change')}</th>
                                            <th className="px-6 py-4">{t('admin.col_amount')}</th>
                                            <th className="px-6 py-4">{t('admin.col_method')}</th>
                                            <th className="px-6 py-4">{t('admin.col_status')}</th>
                                            <th className="px-6 py-4">{t('admin.col_date')}</th>
                                            <th className="px-6 py-4">{t('admin.col_actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {planRequests.map(req => (
                                            <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">#{req.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">{req.full_name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{req.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono uppercase">{req.current_plan}</span>
                                                        <ArrowRight size={14} className="text-gray-400" />
                                                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded text-xs font-mono uppercase font-bold">{req.requested_plan}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{req.amount} DZD</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium">{req.payment_method || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                                                <td className="px-6 py-4 text-xs">{new Date(req.created_at).toLocaleDateString('fr-FR')}</td>
                                                <td className="px-6 py-4">
                                                    {req.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => openApproveModal(req)}
                                                                className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 p-1.5 rounded"
                                                                title={t('admin.btn_approve')}
                                                            >
                                                                <CheckSquare size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(req)}
                                                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded"
                                                                title={t('admin.btn_reject')}
                                                            >
                                                                <XSquare size={18} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {req.status !== 'pending' && (
                                                        <span className="text-xs text-gray-400">{t('admin.status_processed')}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* --- CONTENU 5 : SLIDES D'ACTUALITÉ --- */}
                {activeTab === 'news' && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <button
                                onClick={() => openSlideModal()}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Image size={18} />
                                {i18n.language === 'ar' ? 'إضافة شريحة' : 'Ajouter une actualité'}
                            </button>
                        </div>

                        <div className="bg-white dark:bg-dark-card rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-800">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                                    <tr>
                                        <th className="px-6 py-4">Langue</th>
                                        <th className="px-6 py-4">Image</th>
                                        <th className="px-6 py-4">Titre</th>
                                        <th className="px-6 py-4">Ordre</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {slides.map(slide => (
                                        <tr key={slide.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${slide.language === 'ar' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {slide.language === 'ar' ? 'AR' : 'FR'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <img src={slide.image_url} alt="" className="h-12 w-20 object-cover rounded" />
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{slide.title}</td>
                                            <td className="px-6 py-4">{slide.display_order}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleSlide(slide)}
                                                    className={`px-2 py-1 rounded text-xs font-bold ${slide.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                                >
                                                    {slide.is_active ? 'ACTIF' : 'INACTIF'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 flex gap-2">
                                                <button onClick={() => openSlideModal(slide)} className="text-blue-600 p-1.5"><ArrowUpCircle size={18} /></button>
                                                <button onClick={() => handleDeleteSlide(slide.id)} className="text-red-500 p-1.5"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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

                {/* --- MODALE APPROBATION --- */}
                {isApproveModalOpen && selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                                    <CheckSquare size={24} />
                                    {t('admin.modal_approve_title')}
                                </h3>
                                <button onClick={() => setIsApproveModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                                    <X />
                                </button>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('admin.user_name')} : <b className="text-gray-900 dark:text-white">{selectedRequest.full_name}</b></p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded font-mono">{selectedRequest.current_plan}</span>
                                    <ArrowRight size={14} />
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded font-mono font-bold">{selectedRequest.requested_plan}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('admin.amount')} : <b>{selectedRequest.amount} DZD</b></p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('admin.admin_notes_label')}
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    rows="3"
                                    placeholder="Virement vérifié, RIB correspond..."
                                ></textarea>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                                <p className="text-sm text-green-800 dark:text-green-300">
                                    ✅ {t('admin.approve_notice')} <b>{selectedRequest.requested_plan}</b>
                                </p>

                            </div>

                            <button
                                onClick={handleApproveRequest}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium"
                            >
                                {t('admin.confirm_approve')}
                            </button>
                        </div>
                    </div>
                )}

                {/* --- MODALE REJET --- */}
                {isRejectModalOpen && selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <XSquare size={24} />
                                    {t('admin.modal_reject_title')}
                                </h3>
                                <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                                    <X />
                                </button>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('admin.user_name')} : <b className="text-gray-900 dark:text-white">{selectedRequest.full_name}</b></p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded font-mono">{selectedRequest.current_plan}</span>
                                    <ArrowRight size={14} />
                                    <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded font-mono">{selectedRequest.requested_plan}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('admin.reject_reason_label')} <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                                    rows="3"
                                    placeholder="Justificatif de paiement invalide, montant incorrect, etc."
                                    required
                                ></textarea>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                                <p className="text-sm text-red-800 dark:text-red-300">
                                    ⚠️ {t('admin.reject_notice')}
                                </p>
                            </div>

                            <button
                                onClick={handleRejectRequest}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium"
                            >
                                {t('admin.confirm_reject')}
                            </button>
                        </div>
                    </div>
                )}
                {/* --- MODALE SLIDE (CAROUSEL) --- */}
                {isSlideModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xl font-bold dark:text-white">
                                    {currentSlide ? 'Modifier Slide' : 'Nouveau Slide'}
                                </h3>
                                <button onClick={() => setIsSlideModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"><X /></button>
                            </div>

                            <form onSubmit={handleSaveSlide} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Langue du Slide</label>
                                    <select
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={slideForm.language || 'fr'}
                                        onChange={e => setSlideForm({ ...slideForm, language: e.target.value })}
                                    >
                                        <option value="fr">🇫🇷 Français</option>
                                        <option value="ar">🇩🇿 Arabe</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Titre</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={slideForm.title}
                                        onChange={e => setSlideForm({ ...slideForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">URL Image</label>
                                    <input
                                        type="url"
                                        required
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={slideForm.image_url}
                                        onChange={e => setSlideForm({ ...slideForm, image_url: e.target.value })}
                                        placeholder="https://exemple.com/image.jpg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description (Optionnel)</label>
                                    <textarea
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={slideForm.description || ''}
                                        onChange={e => setSlideForm({ ...slideForm, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Lien (Optionnel)</label>
                                    <input
                                        type="url"
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={slideForm.link_url || ''}
                                        onChange={e => setSlideForm({ ...slideForm, link_url: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Ordre</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={slideForm.display_order}
                                            onChange={e => setSlideForm({ ...slideForm, display_order: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={slideForm.is_active}
                                                onChange={e => setSlideForm({ ...slideForm, is_active: e.target.checked })}
                                                className="w-4 h-4"
                                            />
                                            <span className="dark:text-white">Actif</span>
                                        </label>
                                    </div>
                                </div>

                                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-bold">
                                    Enregistrer
                                </button>
                            </form>
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