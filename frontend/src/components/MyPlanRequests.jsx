/**
 * Composant : Liste des demandes de changement de plan de l'utilisateur
 * Affiche l'historique et le statut des demandes
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import planChangeService from '../services/planChangeService';
import './MyPlanRequests.css';

const MyPlanRequests = () => {
    const { t, i18n } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isArabic = i18n.language === 'ar';

    // Charger les demandes
    const loadRequests = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await planChangeService.getMyRequests();
            setRequests(data);
        } catch (err) {
            console.error('Erreur chargement demandes:', err);
            setError(err.message || 'Impossible de charger vos demandes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // Annuler une demande
    const handleCancel = async (requestId) => {
        if (!window.confirm(t('pricing.confirmCancel') || 'Voulez-vous vraiment annuler cette demande ?')) {
            return;
        }

        try {
            await planChangeService.cancelRequest(requestId);
            alert(t('pricing.requestCancelled') || 'Demande annulée avec succès');
            loadRequests(); // Recharger la liste
        } catch (err) {
            console.error('Erreur annulation:', err);
            alert(err.message || 'Erreur lors de l\'annulation');
        }
    };

    // Badge de statut
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            pending: {
                label: t('pricing.statusPending') || 'En attente',
                labelAr: 'قيد الانتظار',
                className: 'status-pending',
                icon: '⏳'
            },
            approved: {
                label: t('pricing.statusApproved') || 'Approuvé',
                labelAr: 'موافق عليه',
                className: 'status-approved',
                icon: '✅'
            },
            rejected: {
                label: t('pricing.statusRejected') || 'Rejeté',
                labelAr: 'مرفوض',
                className: 'status-rejected',
                icon: '❌'
            },
            cancelled: {
                label: t('pricing.statusCancelled') || 'Annulé',
                labelAr: 'ملغى',
                className: 'status-cancelled',
                icon: '🚫'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span className={`status-badge ${config.className}`}>
                {config.icon} {isArabic ? config.labelAr : config.label}
            </span>
        );
    };

    // Formater la date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return isArabic
            ? date.toLocaleDateString('ar-DZ')
            : date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
    };

    if (loading) {
        return (
            <div className="my-requests-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>{t('common.loading') || 'Chargement...'}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-requests-container">
                <div className="error-message">
                    ❌ {error}
                </div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="my-requests-container">
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>{t('pricing.noRequests') || 'Aucune demande'}</h3>
                    <p>{t('pricing.noRequestsDescription') || 'Vous n\'avez pas encore fait de demande de changement de plan'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-requests-container">
            <h3 className="requests-title">
                📋 {t('pricing.myRequests') || 'Mes demandes de changement de plan'}
            </h3>

            <div className="requests-list">
                {requests.map((request) => (
                    <div key={request.id} className="request-card">
                        <div className="request-header">
                            <div className="request-info">
                                <div className="plan-change">
                                    <span className="plan-from">
                                        {isArabic
                                            ? request.currentPlanDetails?.labelAr
                                            : request.currentPlanDetails?.label
                                        }
                                    </span>
                                    <span className="arrow">→</span>
                                    <span className="plan-to">
                                        {isArabic
                                            ? request.requestedPlanDetails?.labelAr
                                            : request.requestedPlanDetails?.label
                                        }
                                    </span>
                                </div>
                                <div className="request-date">
                                    {formatDate(request.created_at)}
                                </div>
                            </div>
                            <StatusBadge status={request.status} />
                        </div>

                        <div className="request-details">
                            <div className="detail-item">
                                <span className="detail-label">
                                    {t('pricing.amount') || 'Montant'} :
                                </span>
                                <span className="detail-value amount">
                                    {parseFloat(request.amount).toLocaleString('fr-FR')} {isArabic ? 'د.ج' : 'DZD'}
                                </span>
                            </div>

                            {request.payment_method && (
                                <div className="detail-item">
                                    <span className="detail-label">
                                        {t('pricing.paymentMethod') || 'Méthode'} :
                                    </span>
                                    <span className="detail-value">
                                        {request.payment_method}
                                    </span>
                                </div>
                            )}

                            {request.user_notes && (
                                <div className="detail-item full-width">
                                    <span className="detail-label">
                                        {t('pricing.yourNotes') || 'Vos notes'} :
                                    </span>
                                    <p className="detail-value notes">
                                        {request.user_notes}
                                    </p>
                                </div>
                            )}

                            {request.admin_notes && (
                                <div className={`detail-item full-width admin-note ${request.status}`}>
                                    <span className="detail-label">
                                        {t('pricing.adminNotes') || 'Réponse admin'} :
                                    </span>
                                    <p className="detail-value notes">
                                        {request.admin_notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {request.status === 'pending' && (
                            <div className="request-actions">
                                <button
                                    className="btn btn-cancel"
                                    onClick={() => handleCancel(request.id)}
                                >
                                    🚫 {t('common.cancel') || 'Annuler'}
                                </button>
                            </div>
                        )}

                        {request.status === 'pending' && (
                            <div className="pending-notice">
                                ⏳ {t('pricing.pendingNotice') || 'En attente de validation. Si vous avez effectué le paiement, envoyez votre justificatif à'} : <strong>admin@dz-legal-ai.com</strong>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyPlanRequests;
