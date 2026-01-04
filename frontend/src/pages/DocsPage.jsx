import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UploadCloud, FileText, Trash2, ArrowLeft, Loader2, Copy, Send, Bot, User, MessageSquare, ExternalLink, Calendar } from 'lucide-react';
import docService from '../services/docService';
import Footer from '../components/Footer';

// Fonction utilitaire pour détecter l'Arabe
const isTextArabic = (text) => /[\u0600-\u06FF]/.test(text);

const DocsPage = () => {
    const { t, i18n } = useTranslation();

    // États Globaux
    const [documents, setDocuments] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(true);

    // États du Chat Document
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Charger la liste au démarrage
    useEffect(() => {
        loadDocuments();
    }, []);

    // Scroll auto du chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, selectedDoc]);

    const loadDocuments = async () => {
        try {
            const docs = await docService.getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error("Erreur chargement:", error);
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleSelectDoc = async (docSummary) => {
        // Affichage immédiat avec loader implicite si ai_summary est vide
        setSelectedDoc({ ...docSummary });
        setChatMessages([]);
        setChatInput('');

        try {
            const fullDoc = await docService.getDocumentById(docSummary.id);
            setSelectedDoc(fullDoc);
        } catch (error) {
            console.error("Erreur chargement détails:", error);
            setSelectedDoc(docSummary);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const prompt = i18n.language === 'ar' ? 'حلل هذه الوثيقة' : 'Analyse ce document';
            const newDoc = await docService.uploadDocument(file, prompt);

            setDocuments([newDoc, ...documents]);
            setSelectedDoc(newDoc);
        } catch (error) {
            alert("Erreur lors de l'analyse.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Supprimer ce document ?")) {
            await docService.deleteDocument(id);
            setDocuments(documents.filter(d => d.id !== id));
            if (selectedDoc?.id === id) setSelectedDoc(null);
        }
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const question = chatInput;
        setChatInput('');
        setIsChatLoading(true);

        const newMessages = [...chatMessages, { role: 'user', content: question }];
        setChatMessages(newMessages);

        try {
            const response = await docService.askDocument(selectedDoc.id, question, newMessages);
            setChatMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
        } catch (error) {
            let errorMsg = i18n.language === 'ar' ? "عذراً، حدث خطأ." : "Désolé, une erreur est survenue.";
            if (error.response && error.response.status === 403) {
                errorMsg = i18n.language === 'ar'
                    ? "⛔ لقد تجاوزت حد الاستخدام. يرجى الانتظار للغد."
                    : "⛔ Quota dépassé. Veuillez attendre demain.";
            }
            setChatMessages(prev => [...prev, { role: 'assistant', content: errorMsg, isError: true }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    // --- VUE DÉTAIL (Analyse + Chat) ---
    if (selectedDoc) {
        const filename = selectedDoc.gcs_path ? selectedDoc.gcs_path.split(/[\\/]/).pop() : null;
        const fileUrl = filename ? `http://192.168.1.117:3001/files/${filename}` : null;

        return (
            <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-10rem)] animate-in fade-in slide-in-from-bottom-4">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => setSelectedDoc(null)}
                            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-medium"
                        >
                            <ArrowLeft size={20} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                            {i18n.language === 'ar' ? 'العودة إلى القائمة' : 'Retour à la liste'}
                        </button>

                        {fileUrl && (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 transition-colors shadow-sm"
                            >
                                <ExternalLink size={16} />
                                {i18n.language === 'ar' ? 'عرض الملف الأصلي' : 'Voir le document original'}
                            </a>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-20rem)]">
                        {/* ... existing columns ... */}
                        <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4" dir="ltr">
                                    {selectedDoc.file_name}
                                </h1>
                                <button onClick={(e) => handleDelete(e, selectedDoc.id)} className="text-red-400 hover:text-red-600 p-1">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {!selectedDoc.ai_summary ? (
                                    <div className="flex justify-center items-center h-40">
                                        <Loader2 className="animate-spin text-primary-600" />
                                    </div>
                                ) : (
                                    <div className={`prose prose-sm dark:prose-invert max-w-none ${isTextArabic(selectedDoc.ai_summary) ? 'text-right' : 'text-left'}`}
                                        style={{ direction: isTextArabic(selectedDoc.ai_summary) ? 'rtl' : 'ltr' }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {selectedDoc.ai_summary}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg border border-primary-100 dark:border-gray-700 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-primary-50 dark:bg-primary-900/20 flex items-center gap-2">
                                <MessageSquare size={18} className="text-primary-600" />
                                <span className="font-bold text-primary-700 dark:text-primary-400">
                                    {i18n.language === 'ar' ? 'مناقشة المستند' : 'Discussion avec le document'}
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50 custom-scrollbar">
                                {chatMessages.length === 0 && (
                                    <div className="text-center text-gray-400 mt-10 text-sm">
                                        <p>{i18n.language === 'ar' ? 'اطرح سؤالاً حول هذا الملف...' : 'Posez une question sur ce fichier...'}</p>
                                    </div>
                                )}

                                {chatMessages.map((msg, idx) => {
                                    const isUser = msg.role === 'user';
                                    const isMsgAr = isTextArabic(msg.content);
                                    return (
                                        <div key={idx} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-primary-600 text-white' : 'bg-white border dark:bg-gray-700 dark:border-gray-600 text-primary-600'}`}>
                                                {isUser ? <User size={16} /> : <Bot size={16} />}
                                            </div>
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] ${isUser ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}
                                                style={{ direction: isMsgAr ? 'rtl' : 'ltr', textAlign: isMsgAr ? 'right' : 'left' }}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                {isChatLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center"><Bot size={16} /></div>
                                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border">
                                            <Loader2 className="animate-spin w-4 h-4 text-primary-600" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card">
                                <form onSubmit={handleSendChat} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder={i18n.language === 'ar' ? 'اكتب سؤالك هنا...' : 'Posez une question sur ce document...'}
                                        className={`flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white ${isTextArabic(chatInput) ? 'text-right' : 'text-left'}`}
                                        dir={isTextArabic(chatInput) ? 'rtl' : 'ltr'}
                                        disabled={isChatLoading}
                                    />
                                    <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50">
                                        <Send size={18} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 opacity-80">
                    <Footer />
                </div>
            </div>
        );
    }

    // --- VUE LISTE ---
    return (
        <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-10rem)]">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('pages.docs.title')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {t('pages.docs.desc')}
                        </p>
                    </div>
                </div>

                <div className="mb-8">
                    <label className={`flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:border-primary-400 transition-all group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex flex-col items-center">
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                            ) : (
                                <>
                                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-primary-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {i18n.language === 'ar' ? 'انقر لتحليل مستند جديد (PDF)' : 'Cliquez pour analyser un nouveau document (PDF)'}
                                    </span>
                                </>
                            )}
                        </div>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" />
                    </label>
                </div>

                {isLoadingList ? (
                    <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 border border-gray-100 dark:border-gray-800 rounded-xl">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{i18n.language === 'ar' ? 'لا توجد مستندات محفوظة.' : 'Aucun document sauvegardé.'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                onClick={() => handleSelectDoc(doc)}
                                className="bg-white dark:bg-dark-card p-5 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group relative"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary-600">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate" dir="ltr">
                                            {doc.file_name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed h-14">
                                    {doc.ai_summary ? doc.ai_summary.replace(/[#*`]/g, '').substring(0, 100) : ''}...
                                </p>

                                <button
                                    onClick={(e) => handleDelete(e, doc.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-12 opacity-80">
                <Footer />
            </div>
        </div>
    );
};

export default DocsPage;