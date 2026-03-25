"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, MapPin, Send, MessageCircle } from "lucide-react";

export function ContactUs() {
  const t = useTranslations("Contacts");

  return (
    <section className="w-full py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        
        <div className="max-w-4xl mx-auto bg-brand-light rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Левая часть: Текст и адреса */}
            <div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-extrabold text-brand-black mb-4 tracking-tight"
              >
                {t("title")}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-gray-500 mb-8 leading-relaxed"
              >
                {t("subtitle")}
              </motion.p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-400 mb-0.5">{t("emailLabel")}</div>
                    <a href="mailto:contact@bimark.shop" className="text-lg font-bold text-brand-black hover:text-brand-blue transition-colors">
                      support@bimark.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-400 mb-0.5">{t("addressLabel")}</div>
                    <div className="text-lg font-bold text-brand-black">
                      {t("address")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая часть: Кнопки мессенджеров */}
            <div className="flex flex-col gap-4">
              <motion.a 
                href="@bimark_shop" // Сюда потом вставишь реальную ссылку на Telegram
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#2AABEE] text-white py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#2AABEE]/20 hover:bg-[#2298D6] transition-colors"
              >
                <Send className="w-6 h-6" />
                {t("telegram")}
              </motion.a>

              <motion.a 
                href="+995568822491" // Сюда потом вставишь реальную ссылку на WhatsApp
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#25D366] text-white py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#25D366]/20 hover:bg-[#1EBE5C] transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
                {t("whatsapp")}
              </motion.a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}