import React, { useState } from 'react';
import { X, Mail, User, MessageSquare, Send, CheckCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/apiConfig';

const ContactSupportModal = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await axios.post(API_ENDPOINTS.contactSupport, formData);

            setStatus({
                type: 'success',
                message: isAr
                    ? 'تم إرسال رسالتك بنجاح! سنرد عليك في أقرب وقت.'
                    : 'Votre message a été envoyé avec succès ! Nous vous répondrons rapidement.'
            });

            // Réinitialiser le formulaire après 2 secondes
            setTimeout(() => {
                setFormData({ name: '', email: '', subject: '', message: '' });
                onClose();
            }, 2000);

        } catch (error) {
            setStatus({
                type: 'error',
                message: isAr
                    ? 'حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.'
                    : 'Une erreur s\'est produite. Veuillez réessayer.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="relative w-full max-w-lg bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-gray-700 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <HelpCircle className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {isAr ? 'اتصل بنا' : 'Contactez-nous'}
                            </h2>
                            <p className="text-sm text-gray-400">
                                {isAr ? 'نحن هنا لمساعدتك' : 'Nous sommes là pour vous aider'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Nom */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            {isAr ? 'الاسم' : 'Nom'} *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                            placeholder={isAr ? 'أدخل اسمك' : 'Entrez votre nom'}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            {isAr ? 'البريد الإلكتروني' : 'Email'} *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                            placeholder={isAr ? 'email@exemple.com' : 'email@exemple.com'}
                        />
                    </div>

                    {/* Sujet */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <MessageSquare className="w-4 h-4 inline mr-2" />
                            {isAr ? 'الموضوع' : 'Sujet'} *
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                            placeholder={isAr ? 'موضوع رسالتك' : 'Le sujet de votre message'}
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            {isAr ? 'رسالتك' : 'Votre message'} *
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 resize-none"
                            placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Écrivez votre message ici...'}
                        />
                    </div>

                    {/* Status Message */}
                    {status.message && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success'
                                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                : 'bg-red-500/10 border border-red-500/30 text-red-400'
                            }`}>
                            {status.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            <span>{status.message}</span>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                        >
                            {isAr ? 'إلغاء' : 'Annuler'}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isAr ? 'جاري الإرسال...' : 'Envoi...'}
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    {isAr ? 'إرسال' : 'Envoyer'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactSupportModal;
