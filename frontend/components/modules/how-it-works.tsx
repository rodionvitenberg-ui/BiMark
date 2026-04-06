"use client";

import { useTranslations } from "next-intl";
import { motion, Variants } from "framer-motion";
import { GlobeHemisphereEastIcon, KanbanIcon, TrendUpIcon, ArrowRight } from "@phosphor-icons/react";
import { Link } from "../../i18n/routing"; // Убедись, что путь к роутеру верный

export function HowItWorks() {
  const t = useTranslations("HowItWorks");

  const goals = [
    {
      icon: <GlobeHemisphereEastIcon className="w-6 h-6 text-brand-blue" />,
      text: t("goal1"),
    },
    {
      icon: <KanbanIcon className="w-6 h-6 text-brand-blue" />,
      text: t("goal2"),
    },
    {
      icon: <TrendUpIcon className="w-6 h-6 text-brand-blue" />,
      text: t("goal3"),
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="w-full py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-32">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-brand-black mb-6 leading-tight tracking-tight"
            >
              {t("title")}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-500 leading-relaxed border-l-4 border-brand-blue pl-4 max-w-xl mb-8"
            >
              {t("subtitle")}
            </motion.p>

            {/* НОВАЯ КНОПКА-ПЕРЕХОД */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link 
                href="/vision" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-brand-blue text-brand-blue font-bold text-lg hover:bg-brand-blue hover:text-white transition-all group w-fit"
              >
                {t("learnMoreBtn", { fallback: "Узнать больше о проекте" })}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" weight="bold" />
              </Link>
            </motion.div>
          </div>

          {/* ПРАВАЯ КОЛОНКА */}
          <div className="lg:col-span-7 w-full">
            <motion.h3 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl font-bold text-brand-black mb-8"
            >
              {t("goalsTitle")}
            </motion.h3>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="flex flex-col gap-6" 
            >
              {goals.map((goal, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="flex items-start gap-5 p-6 md:p-8 bg-brand-light rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="shrink-0 min-w-[3.5rem] h-14 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
                    {goal.icon}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-base font-medium pt-1">
                    {goal.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}