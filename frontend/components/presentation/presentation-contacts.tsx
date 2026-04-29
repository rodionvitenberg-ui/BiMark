"use client";

import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion";
import { Mail, MapPin, Send, MessageCircle } from "lucide-react";

export function PresentationContacts() {
  const t = useTranslations("Contacts");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  };

  return (
    // Задаем темный фон, чтобы он сливался с Hero
    <section id="presentation-contacts" className="w-full py-24 bg-[#0a0f1c] relative overflow-hidden">
      
      {/* Легкое свечение на фоне для связи с общим стилем */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          // Применяем стиль "стекла" (glassmorphism) как в заглушке видео
          className="max-w-4xl mx-auto bg-[#121827]/60 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.3)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Левая часть: Текст и адреса */}
            <div>
              <motion.h2 
                variants={itemVariants}
                className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight"
              >
                {t("title")}
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-gray-400 mb-8 leading-relaxed text-lg"
              >
                {t("subtitle")}
              </motion.p>

              <div className="space-y-6">
                <motion.div variants={itemVariants} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0 shadow-inner">
                    <Mail className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div className="pt-1">
                    <div className="text-sm font-medium text-gray-500 mb-0.5">{t("emailLabel")}</div>
                    <a href="mailto:support@bimark.org" className="text-xl font-bold text-white hover:text-brand-blue transition-colors">
                      support@bimark.org
                    </a>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shrink-0 shadow-inner">
                    <MapPin className="w-6 h-6 text-brand-blue" />
                  </div>
                  <div className="pt-1">
                    <div className="text-sm font-medium text-gray-500 mb-0.5">{t("addressLabel")}</div>
                    <div className="text-xl font-bold text-white">
                      {t("address")}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Правая часть: Кнопки мессенджеров */}
            <motion.div variants={itemVariants} className="flex flex-col gap-5">
              <motion.a 
                href="https://t.me/bimark_shop" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#2AABEE] text-white py-5 px-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-[#2AABEE]/20 hover:bg-[#2298D6] transition-all border border-[#2AABEE]/50"
              >
                <Send className="w-6 h-6" />
                {t("telegram")}
              </motion.a>

              <motion.a 
                href="https://wa.me/995568822491" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#25D366] text-white py-5 px-6 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/20 hover:bg-[#1EBE5C] transition-all border border-[#25D366]/50"
              >
                <MessageCircle className="w-6 h-6" />
                {t("whatsapp")}
              </motion.a>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}