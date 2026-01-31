import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, FileText, Loader2, PlusCircle, MessageSquare, Trash2, Menu, Target, Copy, Check } from 'lucide-react';
import chatService from '../services/chatService';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const isTextArabic = (text) => /[\u0600-\u06FF]/.test(text);

const STARTER_QUESTIONS = {
  fr: [
    { title: "Loi de Finance 2026", query: "Quelles sont les principales nouveautés de la loi de finance 2026 en Algérie ?" },
    { title: "Création de SARL", query: "Quelles sont les étapes pour créer une SARL en Algérie ?" },
    { title: "Droit du Travail", query: "Qu'est-ce que le code du travail dit sur les congés annuels ?" },
    { title: "Investissement", query: "Quels sont les avantages de la nouvelle loi sur l'investissement ?" }
  ],
  ar: [
    { title: "قانون المالية 2026", query: "ما هي أهم مستجدات قانون المالية 2026 في الجزائر؟" },
    { title: "إنشاء شركة ذات مسؤولية محدودة", query: "ما هي خطوات إنشاء شركة ذات مسؤولية محدودة (SARL) في الجزائر؟" },
    { title: "قانون العمل", query: "ماذا يقول قانون العمل عن العطل السنوية؟" },
    { title: "قانون الاستثمار", query: "ما هي مزايا قانون الاستثمار الجديد؟" }
  ]
};

const ChatPage = () => {
  const { t, i18n } = useTranslation();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingLink, setIsRefreshingLink] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Gestion du Copier-Coller (Aide Navigation) ---
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('pages.chat.welcome'),
      sources: []
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{
        role: 'assistant',
        content: t('pages.chat.welcome'),
        sources: []
      }]);
    }
  }, [i18n.language]);

  const loadHistory = async () => {
    try {
      const data = await chatService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error("Erreur chargement historique", error);
    }
  };

  const handleSelectSession = async (sessionId) => {
    setIsLoading(true);
    setCurrentSessionId(sessionId);
    setIsSidebarOpen(false);
    try {
      const msgs = await chatService.getSessionMessages(sessionId);
      const formattedMessages = msgs.map(m => ({
        role: m.role,
        content: m.content,
        sources: m.sources ? m.sources : []
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Erreur chargement messages", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([{
      role: 'assistant',
      content: t('pages.chat.welcome'),
      sources: []
    }]);
    setInput('');
    setIsSidebarOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input;
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);

    try {
      const response = await chatService.sendMessage(userQuestion, currentSessionId);
      const data = response.data;

      if (data.isNewSession) {
        setCurrentSessionId(data.sessionId);
        loadHistory();
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || []
      }]);

    } catch (error) {
      console.error("Erreur Chat:", error);
      let errorMsg = i18n.language === 'ar' ? "عذراً، حدث خطأ." : "Désolé, une erreur est survenue.";
      if (error.response && error.response.status === 403) {
        errorMsg = i18n.language === 'ar'
          ? "⛔ لقد تجاوزت حد الاستخدام المجاني اليومي. يرجى الانتظار للغد أو الترقية."
          : "⛔ Quota gratuit dépassé. Veuillez attendre demain ou passer à l'offre Pro.";
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm(i18n.language === 'ar' ? "هل تريد حذف هذه المحادثة؟" : "Supprimer cette conversation ?")) {
      await chatService.deleteSession(sessionId);
      loadHistory();
      if (currentSessionId === sessionId) handleNewChat();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const [expandedSources, setExpandedSources] = useState({});
  const [selectedArticle, setSelectedArticle] = useState(null);

  const toggleSource = (msgIdx) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgIdx]: !prev[msgIdx]
    }));
  };

  const openArticle = async (e, src, msgIdx) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedArticle({ ...src, msgIdx });

    if (currentSessionId && !isLoading) {
      setIsRefreshingLink(true);
      try {
        const msgs = await chatService.getSessionMessages(currentSessionId);
        const formattedMessages = msgs.map(m => ({
          role: m.role,
          content: m.content,
          sources: m.sources ? m.sources : []
        }));
        setMessages(formattedMessages);

        const freshMsg = formattedMessages[msgIdx];
        if (freshMsg && freshMsg.sources) {
          const freshSrc = freshMsg.sources.find(s => s.title === src.title);
          if (freshSrc) {
            setSelectedArticle({ ...freshSrc, msgIdx });
          }
        }
      } catch (error) {
        console.error("Erreur refresh sources:", error);
      } finally {
        setIsRefreshingLink(false);
      }
    }
  };

  // --- HARMONISEUR DE CITATIONS ---
  const renderMessageContent = (content, sources) => {
    if (!content) return null;
    if (!sources || sources.length === 0) return content.replace(/\[\d+\]/g, '');

    // On s'assure que les citations [n] correspondent aux sources réelles
    return content.replace(/\[(\d+)\]/g, (match, num) => {
      const n = parseInt(num);
      if (n > 0 && n <= sources.length) {
        return `[${n}]`;
      }
      return ''; // On retire les références fantômes
    });
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/5 shadow-2xl shadow-black/20 bg-white/50 dark:bg-[#0a0a0b]/50 backdrop-blur-xl">

        {/* SIDEBAR HISTORIQUE */}
        <div className={`
          absolute inset-y-0 z-20 w-72 bg-gray-50/90 dark:bg-[#0d0d0e]/90 backdrop-blur-md border-r border-gray-200 dark:border-white/5 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0
          ${i18n.language === 'ar' ? 'right-0 border-l border-r-0' : 'left-0'}
          ${isSidebarOpen ? 'translate-x-0' : (i18n.language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
        `}>
          <div className="p-4 flex flex-col h-full">
            <button
              onClick={handleNewChat}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl mb-6 transition-all font-semibold shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              <PlusCircle size={18} />
              <span className="text-sm">{t('pages.chat.new_chat')}</span>
            </button>

            <div className="mb-3 px-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {i18n.language === 'ar' ? 'المحادثات السابقة' : 'Historique'}
              </h3>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mt-2"></div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {sessions.length === 0 ? (
                <div className="text-center py-8 px-4 text-gray-400 dark:text-gray-600 text-sm">
                  {i18n.language === 'ar' ? 'لا توجد محادثات' : 'Aucune conversation'}
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session.id)}
                    className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer text-sm transition-all duration-200 ${currentSessionId === session.id
                      ? 'bg-white dark:bg-gray-800 shadow-md border-2 border-primary-500 dark:border-primary-600 text-primary-700 dark:text-primary-400 scale-[1.02]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-sm border-2 border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1" dir={isTextArabic(session.title) ? 'rtl' : 'ltr'}>
                      <MessageSquare size={16} className="flex-shrink-0" strokeWidth={2} />
                      <span className="truncate font-medium text-xs">{session.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ZONE PRINCIPALE CHAT */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">

          <div className="md:hidden p-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <div className="flex flex-col items-center flex-1 min-w-0 px-2">
              <span className="font-bold text-gray-800 dark:text-gray-100 truncate w-full text-center text-sm">
                {currentSessionId ? (sessions.find(s => s.id === currentSessionId)?.title || t('pages.chat.title')) : t('pages.chat.title')}
              </span>
            </div>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 md:px-3 custom-scrollbar">
            <div className="max-w-4xl mx-auto py-6 space-y-4">

              {/* SUGGESTIONS */}
              {messages.length === 1 && !isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {STARTER_QUESTIONS[i18n.language === 'ar' ? 'ar' : 'fr'].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(q.query)}
                      className="text-start p-4 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/5 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-lg group shadow-sm"
                    >
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase tracking-wider">{q.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white line-clamp-2">{q.query}</p>
                    </button>
                  ))}
                </div>
              )}

              {messages.map((msg, idx) => {
                const isArText = isTextArabic(msg.content);
                const isUser = msg.role === 'user';
                return (
                  <div key={idx} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${isUser
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-blue-500/10'
                      }`}>
                      {isUser ? <User size={16} strokeWidth={2.5} /> : <Bot size={16} strokeWidth={2.5} />}
                    </div>

                    <div className={`flex flex-col flex-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                          ? 'bg-blue-600 text-white shadow-blue-600/10'
                          : msg.isError
                            ? 'bg-red-50 text-red-900 border border-red-200 dark:bg-red-900/20'
                            : 'bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/5'
                          }`}
                        style={{ direction: isArText ? 'rtl' : 'ltr', textAlign: isArText ? 'right' : 'left' }}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        ) : (
                          <div className={`prose prose-sm max-w-none dark:prose-invert ${isArText ? 'prose-rtl text-right' : 'text-left'} prose-p:leading-relaxed`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {renderMessageContent(msg.content, msg.sources)}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 w-full bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                          {/* Header Expandable */}
                          <button
                            onClick={() => toggleSource(idx)}
                            className="w-full flex items-center justify-between p-3 hover:bg-blue-100/50 dark:hover:bg-blue-800/20 transition-colors"
                          >
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                              <FileText size={12} /> {i18n.language === 'ar' ? 'المصادر المرجعية' : 'Références & Articles'}
                            </span>
                            <span className={`text-[10px] font-bold text-blue-500 transition-transform duration-300 ${expandedSources[idx] ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </button>

                          {/* Liste des sources (Expandable) */}
                          {expandedSources[idx] && (
                            <div className="p-3 pt-0 grid grid-cols-1 gap-2 animate-in slide-in-from-top-2 duration-300">
                              {msg.sources.map((src, i) => (
                                <div
                                  key={i}
                                  onClick={(e) => openArticle(e, src, idx)}
                                  className="flex items-start gap-3 p-3 bg-white dark:bg-[#0d1117] rounded-xl border border-gray-100 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-xs group shadow-sm cursor-pointer"
                                >
                                  <span className="flex-shrink-0 w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                                    {i + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 overflow-hidden">
                                      {src.articleNum && (
                                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-md text-[10px] font-black whitespace-nowrap">
                                          {i18n.language === 'ar' ? 'المادة' : 'Art.'} {src.articleNum}
                                        </span>
                                      )}
                                      <span className="font-bold text-gray-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                        {src.title}
                                      </span>
                                    </div>
                                    {src.contentPreview && (
                                      <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-[11px] font-medium bg-gray-50 dark:bg-gray-800/40 p-2 rounded-lg border border-gray-100 dark:border-white/5 mt-1 border-dashed line-clamp-2">
                                        {src.contentPreview}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className={`flex gap-3 ${i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Bot size={16} className="text-blue-600 animate-pulse" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <Loader2 className="animate-spin text-blue-600" size={18} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="px-2 md:px-3 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-white/5 sticky bottom-0">
            <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder={i18n.language === 'ar' ? "اطرح سؤالك هنا..." : "Posez votre question ici..."}
                className={`flex-1 bg-white dark:bg-[#111827] border-2 border-gray-200 dark:border-white/10 outline-none text-gray-900 dark:text-white rounded-xl py-3 px-5 focus:border-blue-500 transition-all ${isTextArabic(input) ? 'text-right' : 'text-left'}`}
                dir={isTextArabic(input) ? 'rtl' : 'ltr'}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-blue-600/20"
              >
                <Send size={20} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* Footer discrete */}
      <div className="mt-2 opacity-60 hover:opacity-100 transition-opacity">
        <Footer />
      </div>

      {/* --- MODAL VISIONNEUSE D'ARTICLE --- */}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div
            className="modal-content animate-in zoom-in-95 duration-300 max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-blue-600 text-white flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedArticle.articleNum && (
                      <span className="bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        {i18n.language === 'ar' ? 'المادة' : 'Art.'} {selectedArticle.articleNum}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight truncate">
                      {selectedArticle.title}
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mt-1">
                    {i18n.language === 'ar' ? 'تفاصيل المرجع' : 'Détail de la référence'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500"
              >
                <PlusCircle size={24} className="rotate-45" />
              </button>
            </div>

            {/* Contenu Article */}
            <div className="p-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className={`
                text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-medium
                ${isTextArabic(selectedArticle.contentPreview) ? 'text-right font-ar' : 'text-left'}
              `} style={{ direction: isTextArabic(selectedArticle.contentPreview) ? 'rtl' : 'ltr' }}>
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 border-dashed">
                  {selectedArticle.contentPreview || (i18n.language === 'ar' ? 'لا يوجد نص متاح' : 'Aucun contenu disponible')}
                </div>
              </div>

              {/* Note sur les liens */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Bot size={14} className="text-blue-600" />
                  {i18n.language === 'ar'
                    ? 'هذا مقتطف دقيق من مستنداتنا الرسمية.'
                    : 'Ceci est un extrait précis issu de nos documents officiels.'}
                </p>

                {/* Zone de navigation intelligente */}
                <div className="flex flex-col items-end gap-2">
                  {(selectedArticle.page || selectedArticle.articleNum) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(selectedArticle.searchArt || `Art. ${selectedArticle.articleNum}`)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider ${copied
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                          }`}
                        title={i18n.language === 'ar' ? 'نسخ للبحث' : 'Copier pour recherche'}
                      >
                        {copied ? <Check size={12} /> : <Target size={12} className="animate-pulse" />}
                        <span>
                          {i18n.language === 'ar' ? 'الوجهة: ' : 'Navigation : '}
                          {selectedArticle.page && `Page ${selectedArticle.page}`}
                          {selectedArticle.page && selectedArticle.articleNum && ' | '}
                          {selectedArticle.articleNum && `Art. ${selectedArticle.articleNum}`}
                        </span>
                        {!copied && <Copy size={10} className="ml-1 opacity-50" />}
                      </button>
                    </div>
                  )}

                  {selectedArticle.link && (
                    <div className="flex flex-col items-end gap-1">
                      {isRefreshingLink ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                          <Loader2 size={14} className="animate-spin" />
                          <span>{i18n.language === 'ar' ? 'جاري التحديث...' : 'Mise à jour du lien...'}</span>
                        </div>
                      ) : (
                        <>
                          <a
                            href={selectedArticle.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            <span>{i18n.language === 'ar' ? 'فتح المستند الكامل' : 'Ouvrir le document complet'}</span>
                            <Send size={14} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                          </a>
                          <span className="text-[10px] text-gray-400 italic mt-1 leading-tight text-center sm:text-right">
                            {i18n.language === 'ar'
                              ? 'تلميح: البحث الآن محسّن لسطر واحد. استخدم (Ctrl+F) ثم (Ctrl+V) للعثور على المرجع فوراً.'
                              : 'Astuce : La recherche est optimisée sur une seule ligne. Faites (Ctrl+F) puis (Ctrl+V) pour trouver l\'article immédiatement.'}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                {i18n.language === 'ar' ? 'إغلاق' : 'Fermer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;