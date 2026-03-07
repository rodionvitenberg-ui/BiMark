"use client";

import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion";
import { Target, Users, Globe, Mail } from "lucide-react";

export function AboutUs() {
  const t = useTranslations("AboutUs");

  // Явно указываем тип Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  // Явно указываем тип Variants
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="w-full py-24 bg-[#0a0f1c] text-white overflow-hidden relative">
      {/* Декоративный фоновый градиент */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-brand-blue/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Левая часть: Заголовок */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
                {t("title")}
              </h2>
              <div className="w-20 h-2 bg-brand-blue rounded-full mb-8" />
            </motion.div>
          </div>

          {/* Правая часть: Текст манифеста */}
          <div className="lg:col-span-7">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 text-lg md:text-xl text-gray-300 font-light leading-relaxed"
            >
              <motion.div variants={itemVariants} className="flex gap-4 items-start">
                <Globe className="w-8 h-8 text-brand-blue shrink-0 mt-1" />
                <p>{t("p1")}</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex gap-4 items-start">
                <Target className="w-8 h-8 text-brand-blue shrink-0 mt-1" />
                <p className="text-white font-medium">{t("p2")}</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex gap-4 items-start">
                <Users className="w-8 h-8 text-brand-blue shrink-0 mt-1" />
                <p>{t("p3")}</p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-4 items-start pt-6 border-t border-gray-800">
                <Mail className="w-6 h-6 text-gray-400 shrink-0 mt-1" />
                <p className="text-base text-gray-400">{t("p4")}</p>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}