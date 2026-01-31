import React from 'react';
import { MessageSquare, ShieldCheck, FileSearch, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const agents = [
    {
        id: 'chat',
        icon: <MessageSquare className="text-blue-500" size={24} />,
        titleKey: 'assistant.agents.chat.title',
        descKey: 'assistant.agents.chat.desc',
        color: 'blue',
        badge: 'Standard'
    },
    {
        id: 'expert',
        icon: <ShieldCheck className="text-emerald-500" size={24} />,
        titleKey: 'assistant.agents.expert.title',
        descKey: 'assistant.agents.expert.desc',
        color: 'emerald',
        badge: 'Expert SGG'
    },
    {
        id: 'analyzer',
        icon: <FileSearch className="text-purple-500" size={24} />,
        titleKey: 'assistant.agents.analyzer.title',
        descKey: 'assistant.agents.analyzer.desc',
        color: 'purple',
        badge: 'Audit'
    }
];

const AgentSelector = ({ onSelect, selectedAgentId }) => {
    const { t, i18n } = useTranslation();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">
                    {i18n.language === 'ar' ? 'اختر خبيرك القانوني' : 'Choisissez votre expert juridique'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-lg mx-auto">
                    {i18n.language === 'ar'
                        ? 'احصل على إجابات مخصصة بناءً على احتياجاتك الدقيقة.'
                        : 'Obtenez des réponses sur mesure adaptées à vos besoins spécifiques.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {agents.map((agent) => {
                    const isSelected = selectedAgentId === agent.id;
                    return (
                        <div
                            key={agent.id}
                            onClick={() => onSelect(agent.id)}
                            className={`
                relative group p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                ${isSelected
                                    ? `bg-white dark:bg-gray-800 border-${agent.color}-500 shadow-xl shadow-${agent.color}-500/10 scale-[1.05]`
                                    : 'bg-white/50 dark:bg-[#111827]/50 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:shadow-lg backdrop-blur-sm'
                                }
              `}
                        >
                            {/* Background Glow */}
                            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${agent.color}-500/5 rounded-full blur-3xl group-hover:bg-${agent.color}-500/10 transition-all duration-500`}></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl bg-${agent.color}-50 dark:bg-${agent.color}-500/10 shadow-sm`}>
                                        {agent.icon}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border bg-white dark:bg-gray-900 border-gray-100 dark:border-white/10 text-${agent.color}-600 dark:text-${agent.color}-400`}>
                                        {agent.badge}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                    {i18n.language === 'ar' ? t(agent.titleKey).replace('Assistant', 'مساعد').replace('Conseiller', 'مستشار').replace('Analyseur', 'محلل') : t(agent.titleKey)}
                                </h3>

                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 block min-h-[3rem]">
                                    {t(agent.descKey)}
                                </p>

                                <div className={`
                  flex items-center gap-2 text-xs font-bold transition-all
                  ${isSelected ? `text-${agent.color}-600 dark:text-${agent.color}-400` : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'}
                `}>
                                    <span>{i18n.language === 'ar' ? 'ابدأ الآن' : 'Sélectionner'}</span>
                                    <ArrowRight size={14} className={`transition-transform duration-300 ${isSelected ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                                </div>
                            </div>

                            {/* Selection indicator dots */}
                            {isSelected && (
                                <div className={`absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-${agent.color}-500 animate-pulse`}></div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 text-center text-[10px] text-gray-400 uppercase tracking-widest font-black flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-200 dark:to-white/10"></div>
                <span>Intelligence Juridique Certifiée</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-200 dark:to-white/10"></div>
            </div>
        </div>
    );
};

export default AgentSelector;
