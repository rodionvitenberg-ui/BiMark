"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "../../i18n/routing"; // Или из твоего i18n/routing
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { apiClient } from "../../lib/api/client";
import { buildPageContext } from "../../lib/utils/ai-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantWidgetProps {
  currentPageData?: any; // Сюда можно прокинуть данные проекта/ассета со страницы
}

export function AIAssistantWidget({ currentPageData }: AIAssistantWidgetProps) {
  const locale = useLocale();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Загрузка истории из LocalStorage при монтировании
  useEffect(() => {
    const savedMessages = localStorage.getItem("bimark_ai_chat_history");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Ошибка парсинга истории чата", e);
      }
    } else {
      // Приветственное сообщение по умолчанию в зависимости от языка
      const greetings: Record<string, string> = {
        ru: "Привет! Я ИИ-ассистент BiMark. Готов помочь тебе разобраться в цифровых активах и долях проектов. Что тебя интересует?",
        en: "Hello! I am BiMark AI Assistant. Ready to help you understand digital assets and project shares. What are you looking for?",
        es: "¡Hola! Soy el Asistente de IA de BiMark. Listo para ayudarte a entender los activos digitales y las participaciones de proyectos. ¿Qué estás buscando?"
      };
      setMessages([{ role: "assistant", content: greetings[locale] || greetings.en }]);
    }
  }, [locale]);

  // 2. Сохранение истории в LocalStorage при обновлении сообщений
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("bimark_ai_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // 3. Автоскролл вниз при появлении новых сообщений
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // Собираем XML-контекст текущей страницы
    const pageContext = buildPageContext(locale, pathname, currentPageData);

    try {
      const response = await apiClient.post("/ai/chat/", {
        messages: updatedMessages,
        page_context: pageContext
      });

      if (response.data && response.data.content) {
        setMessages(prev => [...prev, { role: "assistant", content: response.data.content }]);
      }
    } catch (error) {
      console.error("Ошибка ИИ-ассистента:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: locale === 'ru' ? "Произошла ошибка связи с сервером." : "Error communicating with server." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("bimark_ai_chat_history");
    const savedGreeting = messages.slice(0, 1);
    setMessages(savedGreeting.length ? savedGreeting : []);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans text-white">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-[360px] sm:w-[400px] h-[520px] bg-[#0f172a]/95 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden mb-4"
          >
            {/* ШАПКА ЧАТА */}
            <div className="p-4 bg-[#1e293b] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-brand-blue shadow-[0_0_15px_rgba(0,124,189,0.2)]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">BiMark AI Advisor</h4>
                  <span className="text-[11px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={clearHistory} 
                  className="text-xs text-gray-500 hover:text-gray-300 bg-transparent border-none cursor-pointer px-2 py-1 transition-colors"
                  title="Очистить диалог"
                >
                  {locale === 'ru' ? 'Сброс' : 'Reset'}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ЗОНА СООБЩЕНИЙ */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0a0f1c]/50 scrollbar-thin">
              {messages.map((msg, index) => {
                const isAI = msg.role === "assistant";
                return (
                  <div key={index} className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${isAI ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20" : "bg-white/10 text-gray-300 border border-white/10"}`}>
                      {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isAI ? "bg-[#1e293b] text-gray-100 rounded-tl-none border border-gray-800" : "bg-brand-blue text-white rounded-tr-none shadow-md shadow-brand-blue/10"}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-[#1e293b] rounded-2xl rounded-tl-none border border-gray-800 text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                    <span className="text-xs">{locale === 'ru' ? 'Думает...' : 'Thinking...'}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ИНПУТ ОТПРАВКИ */}
            <form onSubmit={handleSend} className="p-3 bg-[#1e293b] border-t border-gray-800 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={locale === 'ru' ? 'Задать вопрос...' : locale === 'es' ? 'Preguntar...' : 'Ask a question...'}
                className="flex-1 bg-[#0a0f1c] border border-gray-700 focus:border-brand-blue rounded-xl px-4 py-2.5 text-sm outline-none text-white transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-brand-blue text-white rounded-xl hover:bg-[#007cbd] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ТРИГГЕР-КНОПКА КРУГЛЯШОК */}
      <motion.button
        // ИСПРАВЛЕНО: Заменили shadow на boxShadow
        whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0,124,189,0.5)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-blue rounded-full text-white flex items-center justify-center shadow-xl shadow-brand-blue/20 cursor-pointer border-none ml-auto relative group overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}