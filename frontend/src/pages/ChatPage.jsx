import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, FileText, Loader2, PlusCircle, MessageSquare, Trash2, Menu } from 'lucide-react';
import chatService from '../services/chatService';
import Footer from '../components/Footer';

const isTextArabic = (text) => /[\u0600-\u06FF]/.test(text);

const ChatPage = () => {
  const { t, i18n } = useTranslation();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Update welcome message when language changes
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
    // Shortcut to focus input
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative">
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR HISTORIQUE - Amélioration visuelle */}
        <div className={`
        absolute inset-y-0 left-0 z-20 w-72 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-700 shadow-xl transform transition-all duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : (i18n.language === 'ar' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')}
      `}>
          <div className="p-4 flex flex-col h-full">
            {/* Bouton Nouvelle conversation avec meilleur design */}
            <button
              onClick={handleNewChat}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 px-4 rounded-xl mb-6 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle size={20} strokeWidth={2.5} />
              {t('pages.chat.new_chat')}
            </button>

            {/* Titre de la section historique */}
            <div className="mb-3 px-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {i18n.language === 'ar' ? 'المحادثات السابقة' : 'Historique'}
              </h3>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mt-2"></div>
            </div>

            {/* Liste historique avec meilleur design */}
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
                      title={i18n.language === 'ar' ? 'حذف' : 'Supprimer'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ZONE PRINCIPALE CHAT - Centrée et limitée en largeur */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent">

          {/* Header mobile */}
          <div className="md:hidden p-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Menu size={24} />
            </button>
            <span className="font-bold text-gray-800 dark:text-gray-100 text-center flex-1">Dz Legal Chat</span>
            <div className="w-10"></div>
          </div>

          {/* Zone de messages - Centrée avec largeur maximale */}
          <div className="flex-1 overflow-y-auto px-2 md:px-3 custom-scrollbar">
            {/* Container avec largeur max */}
            <div className="max-w-4xl py-6 space-y-4">
              {messages.map((msg, idx) => {
                const isAr = isTextArabic(msg.content);
                const isUser = msg.role === 'user';
                return (
                  <div key={idx} className={`flex gap-3 ${isUser ? (i18n.language === 'ar' ? 'flex-row' : 'flex-row-reverse') : (i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row')}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${isUser
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white'
                      : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-primary-600 dark:text-primary-400'
                      }`}>
                      {isUser ? <User size={16} strokeWidth={2.5} /> : <Bot size={16} strokeWidth={2.5} />}
                    </div>

                    {/* Message container */}
                    <div className={`flex flex-col flex-1 max-w-[80%] ${isUser ? (i18n.language === 'ar' ? 'items-start' : 'items-end') : (i18n.language === 'ar' ? 'items-end' : 'items-start')}`}>
                      {/* Bulle de message */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${isUser
                          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-primary-600/20'
                          : msg.isError
                            ? 'bg-red-50 text-red-900 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                          }`}
                        style={{ direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}
                      >
                        {msg.content}
                      </div>

                      {/* Sources - Alignement et design améliorés */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 w-full max-w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                            <FileText size={13} />
                            {i18n.language === 'ar' ? 'المصادر' : 'Sources'}
                          </p>
                          <div className="space-y-1.5">
                            {msg.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-sm transition-all text-xs group"
                                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                              >
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-[10px]">
                                  {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold text-primary-700 dark:text-primary-400 group-hover:underline block truncate">
                                    {src.title}
                                  </span>
                                  {src.contentPreview && (
                                    <span className="text-gray-500 dark:text-gray-400 block truncate mt-0.5 text-[11px]">
                                      {src.contentPreview}
                                    </span>
                                  )}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading indicator */}
              {isLoading && (
                <div className={`flex gap-3 ${i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-md">
                    <Bot size={16} strokeWidth={2.5} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <Loader2 className="animate-spin text-primary-600" size={18} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input zone - Centrée avec largeur max */}
          <div className="px-2 md:px-3 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 sticky bottom-0">
            <form onSubmit={handleSend} className="flex gap-3 max-w-4xl">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder={i18n.language === 'ar' ? "اطرح سؤالك هنا..." : "Posez votre question ici..."}
                className={`flex-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white rounded-xl py-3 px-5 focus:border-primary-500 dark:focus:border-primary-600 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm ${isTextArabic(input) ? 'text-right' : 'text-left'
                  }`}
                dir={isTextArabic(input) ? 'rtl' : 'ltr'}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl px-6 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                <Send size={20} className={i18n.language === 'ar' ? 'rotate-180' : ''} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <Footer />
      </div>
    </div>
  );
};

export default ChatPage;