"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "../../i18n/routing"; 
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { buildPageContext } from "../../lib/utils/ai-context";
import { useAiPageContext } from "../providers/ai-context-provider";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export function AIAssistantWidget() {
  const locale = useLocale();
  const pathname = usePathname();
  const { pageData } = useAiPageContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Загрузка истории из LocalStorage
  useEffect(() => {
    if (!isMounted) return;

    const savedMessages = localStorage.getItem("bimark_ai_chat_history");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Ошибка парсинга истории чата", e);
      }
    } else {
      const greetings: Record<string, string> = {
        ru: "Привет! Я ИИ-агент BiMark. Я имею прямой доступ к актуальной базе данных активов и юридическим правилам платформы. Чем могу помочь?",
        en: "Hello! I am the BiMark AI Agent. I have direct access to the live asset database and official legal guidelines. How can I assist you today?",
        es: "¡Hola! Soy el Agente de IA de BiMark. Tengo acceso directo a la base de datos de activos y directrices legales. ¿Cómo puedo ayudarte hoy?"
      };
      setMessages([{ role: "assistant", content: greetings[locale] || greetings.en }]);
    }
  }, [locale, isMounted]);

  // 2. Сохранение истории в LocalStorage
  useEffect(() => {
    if (isMounted && messages.length > 0) {
      localStorage.setItem("bimark_ai_chat_history", JSON.stringify(messages));
    }
  }, [messages, isMounted]);

  // 3. Автоскролл
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // ДИНАМИЧЕСКИЕ ПОДСКАЗКИ (Quick Reply Chips)
  const quickReplies = useMemo(() => {
    if (pathname === "/" || pathname === "") {
      return locale === "ru" 
        ? ["Как устроены выплаты?", "Покажи новинки каталога", "Связаться с владельцем"]
        : ["How do payouts work?", "Show catalog updates", "Contact platform owner"];
    }
    if (pathname.includes("/token")) {
      return locale === "ru"
        ? ["Какая аллокация на раунде?", "Расскажи про токеномику BMK", "Где купить токен?"]
        : ["What is the token allocation?", "About BMK Tokenomics", "Where to buy BMK?"];
    }
    return locale === "ru"
      ? ["Какая минимальная гарантия выплат?", "Связаться с менеджером"]
      : ["What is the minimum payout guarantee?", "Contact official manager"];
  }, [pathname, locale]);

  // СТРИМИНГ И ОБРАБОТКА ФУНКЦИЙ АГЕНТА
  // СТРИМИНГ И ОБРАБОТКА ФУНКЦИЙ АГЕНТА
  const handleProcessStream = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // 1. СТРОГИЙ КЛИЕНТСКИЙ ПЕРЕХВАТ ПЕРЕМЕННОЙ ОКРУЖЕНИЯ
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!rawApiUrl) {
      console.error("❌ [BiMark Env Error]: NEXT_PUBLIC_API_URL is missing in your .env.local file!");
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: locale === 'ru' 
            ? "Ошибка конфигурации: На фронтенде не задан адрес API бэкенда в файле .env.local." 
            : "Configuration error: NEXT_PUBLIC_API_URL is undefined in .env.local." 
        }
      ]);
      return;
    }

    // Автоматически убираем завершающий слэш из .env, если он там есть, предотвращая баг двойного слэша //
    const baseUrl = rawApiUrl.replace(/\/$/, "");

    const userMessage: Message = { role: "user", content: textToSend.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const pageContext = buildPageContext(locale, pathname, pageData);

    try {
      // Стучимся строго по очищенному адресу из конфига
      console.log(`🚀 Sending stream request to: ${baseUrl}/api/ai/chat/`);
      
      const response = await fetch(`${baseUrl}/api/ai/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          page_context: pageContext,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Network stream failure. Status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = "";
      let accumulatedToolArgs = "";
      let pendingToolCall: any = null;

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const rawData = JSON.parse(line.slice(6));
              
              if (rawData.content) {
                assistantMessageContent += rawData.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg && lastMsg.role === "assistant") {
                    lastMsg.content = assistantMessageContent;
                  }
                  return updated;
                });
              }

              if (rawData.tool_call) {
                const call = rawData.tool_call;
                if (call.function) {
                  pendingToolCall = call.function;
                  if (call.function.arguments) {
                    accumulatedToolArgs += call.function.arguments;
                  }
                }
              }
            } catch (e) {
              // Пропускаем битые чанки
            }
          }
        }
      }

      if (pendingToolCall && pendingToolCall.name === "add_item_to_cart") {
        try {
          const args = JSON.parse(accumulatedToolArgs);
          setMessages((prev) => [
            ...prev,
            { 
              role: "system", 
              content: locale === 'ru' 
                ? `⚙️ [Система Агента]: Инвестиционный лот "${args.project_slug}" (Кол-во: ${args.shares_amount} шт.) успешно добавлен в вашу корзину!`
                : `⚙️ [Agent System]: Asset "${args.project_slug}" (${args.shares_amount} pcs) has been successfully injected into your shopping cart!`
            }
          ]);
        } catch (err) {
          console.error("Ошибка парсинга аргументов вызова функции инструмента ИИ", err);
        }
      }

    } catch (error) {
      console.error("Критическая ошибка стрима ассистента:", error);
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.content === "") {
          updated.pop();
        }
        return [
          ...updated,
          { 
            role: "assistant", 
            content: locale === 'ru' 
              ? `Сбой потока данных. Убедитесь, что бэкенд запущен по адресу ${baseUrl}` 
              : `Data stream interrupted. Target endpoint: ${baseUrl}` 
          }
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem("bimark_ai_chat_history");
    const savedGreeting = messages.slice(0, 1);
    setMessages(savedGreeting.length ? savedGreeting : []);
  };

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans text-white">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-[360px] sm:w-[420px] h-[580px] bg-[#0f172a]/95 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden mb-4"
          >
            {/* ШАПКА ЧАТА */}
            <div className="p-4 bg-[#1e293b] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-brand-blue shadow-[0_0_15px_rgba(0,124,189,0.2)]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm">BiMark Agent v2</h4>
                    <Sparkles className="w-3 h-3 text-brand-blue animate-pulse" />
                  </div>
                  <span className="text-[11px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Stream Active
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={clearHistory} 
                  className="text-xs text-gray-400 hover:text-gray-200 bg-transparent border-none cursor-pointer px-2 py-1 transition-colors"
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

            {/* ЗОНА СООБЩЕНИЙ (ИСПРАВЛЕНО: Полностью скрыт скроллбар) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0a0f1c]/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
              {messages.map((msg, index) => {
                const isAI = msg.role === "assistant";
                const isSystem = msg.role === "system";
                
                if (isSystem) {
                  return (
                    <div key={index} className="w-full text-center my-2">
                      <span className="inline-block bg-brand-blue/10 border border-brand-blue/30 text-brand-blue text-[11px] px-3 py-1.5 rounded-xl font-mono">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={index} className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${isAI ? "bg-brand-blue/10 text-brand-blue border border-brand-blue/20" : "bg-white/10 text-gray-300 border border-white/10"}`}>
                      {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${isAI ? "bg-[#1e293b] text-gray-100 rounded-tl-none border border-gray-800" : "bg-brand-blue text-white rounded-tr-none shadow-md shadow-brand-blue/10"}`}>
                      {isAI ? (
                        <div className="space-y-2 text-gray-100 break-words 
                          [&_strong]:font-extrabold [&_strong]:text-white 
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
                          [&_li]:mb-1 [&_li]:text-gray-200"
                        >
                          <ReactMarkdown>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-[#1e293b] rounded-2xl rounded-tl-none border border-gray-800 text-gray-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                    <span className="text-xs">{locale === 'ru' ? 'Поиск в БД...' : 'Querying DB...'}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* БЛОК БЫСТРЫХ ВОПРОСОВ (ИСПРАВЛЕНО: Теперь они аккуратно переносятся плиткой, без горизонтального скролла) */}
            {quickReplies.length > 0 && !isLoading && (
              <div className="p-3 bg-[#0a0f1c]/90 border-t border-gray-900 flex flex-wrap gap-1.5 justify-start">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleProcessStream(reply)}
                    className="text-[11px] bg-[#1e293b] hover:bg-brand-blue/10 text-gray-300 hover:text-brand-blue border border-gray-800 hover:border-brand-blue/30 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all duration-200 text-left whitespace-normal max-w-full"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* ИНПУТ ОТПРАВКИ */}
            <form onSubmit={(e) => { e.preventDefault(); handleProcessStream(input); }} className="p-3 bg-[#1e293b] border-t border-gray-800 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={locale === 'ru' ? 'Задать вопрос агенту...' : locale === 'es' ? 'Preguntar...' : 'Ask agent anything...'}
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

      {/* ТРИГГЕР-КНОПКА */}
      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(0,124,189,0.5)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-blue rounded-full text-white flex items-center justify-center shadow-xl shadow-brand-blue/20 cursor-pointer border-none ml-auto relative group overflow-hidden z-[9999]"
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