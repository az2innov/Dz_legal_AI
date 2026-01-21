/**
 * Modal : Demande de changement de plan
 * Permet à l'utilisateur de demander un upgrade ou downgrade
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import planChangeService from '../services/planChangeService';
import './PlanChangeRequestModal.css';

const PlanChangeRequestModal = ({ isOpen, onClose, currentPlan, requestedPlan, onSuccess }) => {
    const { t, i18n } = useTranslation();
    const [paymentMethod, setPaymentMethod] = useState('virement');
    const [userNotes, setUserNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Calculer les détails
    const amount = planChangeService.calculateAmount(currentPlan, requestedPlan);
    const changeType = planChangeService.getChangeType(currentPlan, requestedPlan);
    const currentPlanDetails = planChangeService.getPlanDetails(currentPlan);
    const requestedPlanDetails = planChangeService.getPlanDetails(requestedPlan);

    const isArabic = i18n.language === 'ar';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const result = await planChangeService.requestPlanChange(
                requestedPlan,
                paymentMethod,
                userNotes
            );

            // Succès
            console.log('Demande créée:', result);

            // Notifier le parent
            if (onSuccess) {
                onSuccess(result.data);
            }

            // Fermer le modal
            onClose();

            // Afficher message de succès
            alert(t('pricing.requestSuccess') || 'Demande créée avec succès ! Vous recevrez les instructions de paiement par email.');

        } catch (err) {
            console.error('Erreur création demande:', err);
            setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content plan-change-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {changeType === 'upgrade' ? '⬆️' : '⬇️'}
                        {' '}
                        {changeType === 'upgrade'
                            ? (t('pricing.upgradePlan') || 'Passer au plan supérieur')
                            : (t('pricing.changePlan') || 'Changer de plan')
                        }
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Récapitulatif */}
                    <div className="change-summary">
                        <h3>{t('pricing.summary') || 'Récapitulatif'}</h3>
                        <div className="plan-change-display">
                            <div className="plan-badge current">
                                <span className="plan-label">
                                    {isArabic ? currentPlanDetails?.labelAr : currentPlanDetails?.label}
                                </span>
                            </div>
                            <div className="arrow">→</div>
                            <div className="plan-badge requested">
                                <span className="plan-label">
                                    {isArabic ? requestedPlanDetails?.labelAr : requestedPlanDetails?.label}
                                </span>
                            </div>
                        </div>

                        <div className="amount-display">
                            <span className="amount-label">{t('pricing.amountToPay') || 'Montant à régler'} :</span>
                            <span className="amount-value">
                                {amount.toLocaleString('fr-FR')} {isArabic ? 'د.ج' : 'DZD'}
                            </span>
                        </div>

                        {amount === 0 && (
                            <div className="info-box success">
                                ✅ {t('pricing.noPaymentRequired') || 'Aucun paiement requis pour ce changement'}
                            </div>
                        )}
                    </div>

                    {/* Méthode de paiement */}
                    {amount > 0 && (
                        <div className="form-group">
                            <label>{t('pricing.paymentMethod') || 'Méthode de paiement'}</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                required
                            >
                                <option value="virement">{t('pricing.bankTransfer') || '🏦 Virement bancaire'}</option>
                                <option value="cpa">{t('pricing.cpaDeposit') || '🏧 Versement CPA'}</option>
                                <option value="especes">{t('pricing.cash') || '💵 Espèces'}</option>
                                <option value="cheque">{t('pricing.check') || '📝 Chèque bancaire'}</option>
                                <option value="autre">{t('pricing.other') || '💳 Autre'}</option>
                            </select>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="form-group">
                        <label>{t('pricing.yourNotes') || 'Vos notes (optionnel)'}</label>
                        <textarea
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                            placeholder={t('pricing.notesPlaceholder') || 'Des précisions sur votre demande ?'}
                            rows="3"
                        />
                    </div>

                    {/* Instructions de paiement */}
                    {amount > 0 && (
                        <div className="payment-instructions">
                            <h4>💳 {t('pricing.paymentInstructions') || 'Instructions de paiement'}</h4>
                            <div className="info-box warning">
                                <p>
                                    <strong>{t('pricing.afterSubmit') || 'Après avoir soumis cette demande'} :</strong>
                                </p>
                                <ol>
                                    <li>{t('pricing.step1') || 'Vous recevrez un email avec les instructions détaillées'}</li>
                                    <li>{t('pricing.step2') || 'Effectuez le paiement selon la méthode choisie'}</li>
                                    <li>{t('pricing.step3') || 'Envoyez votre justificatif à'} : <strong>admin@dz-legal-ai.com</strong></li>
                                    <li>{t('pricing.step4') || 'Votre plan sera activé sous 24-48h après vérification'}</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {/* Erreur */}
                    {error && (
                        <div className="error-box">
                            ❌ {error}
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            {t('common.cancel') || 'Annuler'}
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? (t('common.loading') || 'Envoi...')
                                : (t('pricing.confirmRequest') || 'Confirmer la demande')
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanChangeRequestModal;
