import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, FileText, Loader2, PlusCircle, MessageSquare, Trash2, Menu } from 'lucide-react';
import chatService from '../services/chatService';

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
      content: i18n.language === 'ar' 
        ? "مرحبًا بك. أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك اليوم؟"
        : "Bonjour. Je suis votre assistant juridique intelligent. Comment puis-je vous aider aujourd'hui ?",
      sources: []
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

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
      content: i18n.language === 'ar' 
        ? "مرحبًا بك. أنا مساعدك القانوني الذكي. كيف يمكنني مساعدتك اليوم؟"
        : "Bonjour. Je suis votre assistant juridique intelligent. Comment puis-je vous aider aujourd'hui ?",
      sources: []
    }]);
    setIsSidebarOpen(false);
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
      
      // --- GESTION ERREUR QUOTA (403) ---
      if (error.response && error.response.status === 403) {
          errorMsg = i18n.language === 'ar' 
            ? "⛔ لقد تجاوزت حد الاستخدام المجاني اليومي. يرجى الانتظار للغد أو الترقية."
            : "⛔ Quota gratuit dépassé. Veuillez attendre demain ou passer à l'offre Pro.";
      }
      // ----------------------------------

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
    if (window.confirm("Supprimer cette conversation ?")) {
        await chatService.deleteSession(sessionId);
        loadHistory();
        if (currentSessionId === sessionId) handleNewChat();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-white dark:bg-dark-bg overflow-hidden relative">
      
      {/* SIDEBAR HISTORIQUE */}
      <div className={`
        absolute inset-y-0 left-0 z-20 w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : (i18n.language === 'ar' ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')}
      `}>
        <div className="p-4 flex flex-col h-full">
            <button 
                onClick={handleNewChat}
                className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors font-medium shadow-sm"
            >
                <PlusCircle size={18} />
                {i18n.language === 'ar' ? 'محادثة جديدة' : 'Nouvelle conversation'}
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {sessions.map((session) => (
                    <div 
                        key={session.id}
                        onClick={() => handleSelectSession(session.id)}
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                            currentSessionId === session.id 
                            ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-primary-600' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MessageSquare size={16} className="flex-shrink-0" />
                            <span className="truncate">{session.title}</span>
                        </div>
                        <button 
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* ZONE PRINCIPALE CHAT */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-dark-bg">
        
        <div className="md:hidden p-2 border-b border-gray-100 dark:border-gray-800 flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
                <Menu size={24} />
            </button>
            <span className="ml-2 font-bold text-gray-700 dark:text-gray-200">Lexya Chat</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => {
                const isAr = isTextArabic(msg.content);
                const isUser = msg.role === 'user';
                return (
                    <div key={idx} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                         <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isUser ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-primary-600'
                        }`}>
                            {isUser ? <User size={18} /> : <Bot size={18} />}
                        </div>

                        <div className={`flex flex-col max-w-[85%] lg:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                            <div 
                                className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                                    isUser
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : msg.isError 
                                        ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                                        : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                }`}
                                style={{ direction: isAr ? 'rtl' : 'ltr', textAlign: isAr ? 'right' : 'left' }}
                            >
                                {msg.content}
                            </div>
                            
                            {!isUser && msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                    <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                                        <FileText size={14} /> Sources:
                                    </p>
                                    <div className="grid gap-2">
                                        {msg.sources.map((src, i) => (
                                            <a key={i} href={src.link} target="_blank" rel="noopener noreferrer"
                                               className="block p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 hover:border-primary-300 transition-colors text-xs text-right group">
                                                <span className="font-semibold text-primary-700 dark:text-primary-400 group-hover:underline block truncate">
                                                    {i+1}. {src.title}
                                                </span>
                                                {src.contentPreview && (
                                                    <span className="text-gray-500 block truncate mt-0.5">{src.contentPreview}</span>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            
            {isLoading && (
                <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><Bot size={18} /></div>
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700">
                        <Loader2 className="animate-spin text-primary-600" size={20} />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-dark-bg border-t border-gray-100 dark:border-gray-800">
            <form onSubmit={handleSend} className="flex gap-3 relative max-w-4xl mx-auto">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    placeholder={t('search_placeholder')}
                    className={`flex-1 bg-gray-100 dark:bg-gray-800 border-none outline-none text-gray-900 dark:text-white rounded-xl py-3.5 px-5 focus:ring-2 focus:ring-primary-500/20 transition-all ${
                        isTextArabic(input) ? 'text-right' : 'text-left'
                    }`}
                    dir={isTextArabic(input) ? 'rtl' : 'ltr'}
                />
                <button type="submit" disabled={!input.trim() || isLoading}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-5 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <Send size={20} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                </button>
            </form>
        </div>

      </div>
    </div>
  );
};

export default ChatPage;