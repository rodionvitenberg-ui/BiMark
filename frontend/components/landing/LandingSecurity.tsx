"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Scale, Clock, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingSecurity() {
  const t = useTranslations("Landing.Security");
  const [activeTab, setActiveTab] = useState(0);

  // Конфигурация вкладок
  const tabs = [
    {
      id: 0,
      titleKey: "tab1Title",
      textKey: "tab1Text",
      icon: Clock,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/20"
    },
    {
      id: 1,
      titleKey: "tab2Title",
      textKey: "tab2Text",
      icon: LockKeyhole,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/20"
    },
    {
      id: 2,
      titleKey: "tab3Title",
      textKey: "tab3Text",
      icon: Scale,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/20"
    }
  ];

  return (
    <section className="relative w-full py-24 md:py-32 bg-[#0a0f1c] text-white overflow-hidden">
      {/* Строгий фоновый элемент */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Заголовок секции */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-6 border border-white/10 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-gray-400 font-light leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Блок с вкладками */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* ЛЕВАЯ КОЛОНКА: Навигация (Список) */}
          <div className="lg:col-span-5 space-y-4">
            {tabs.map((tab, index) => {
              const isActive = activeTab === index;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={cn(
                    "w-full text-left px-6 py-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group",
                    isActive 
                      ? "bg-white/10 border-white/20 shadow-lg" 
                      : "bg-transparent border-transparent hover:bg-white/5"
                  )}
                >
                  <span className={cn(
                    "text-lg md:text-xl font-bold transition-colors duration-300",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                  )}>
                    {t(tab.titleKey as any)}
                  </span>
                  
                  {/* Индикатор активной вкладки */}
                  <motion.div 
                    animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
                    className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  />
                </button>
              );
            })}
          </div>

          {/* ПРАВАЯ КОЛОНКА: Меняющийся контент */}
          <div className="lg:col-span-7 relative h-[300px] md:h-[250px] w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 w-full h-full p-8 md:p-10 rounded-3xl bg-[#121827] border border-white/5 shadow-2xl flex flex-col justify-center"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border",
                  tabs[activeTab].bgColor,
                  tabs[activeTab].borderColor
                )}>
                  {(() => {
                    const IconComponent = tabs[activeTab].icon;
                    return <IconComponent className={cn("w-8 h-8", tabs[activeTab].color)} />;
                  })()}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {t(tabs[activeTab].titleKey as any)}
                </h3>
                
                <p className="text-lg text-gray-400 leading-relaxed">
                  {t(tabs[activeTab].textKey as any)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}