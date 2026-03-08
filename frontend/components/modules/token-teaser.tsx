"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Coins, Gift, TrendingUp } from "lucide-react";
import { Link } from "../../i18n/routing";

export default function TokenTeaser() {
  const t = useTranslations("Token");

  return (
    // Секция растянута на всю ширину, цвет фона совпадает с Hero
    <section className="relative w-full py-24 bg-[#0a0f1c] text-white overflow-hidden border-b border-gray-800">
      
      {/* Декоративные блюр-пятна вынесены на фон самой секции */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Ограничитель ширины (container mx-auto) держит контент в одной линии с остальным сайтом */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8"
        >
          
          {/* Левая часть: Основной текст */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-bold text-sm uppercase tracking-wider mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-blue"></span>
              </span>
              {t("livePresale")}
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
              {t("teaserTitle")}
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed max-w-xl">
              {t("teaserDesc")}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/token"
                className="w-full sm:w-auto px-8 py-4 bg-brand-blue hover:bg-[#007cbd] text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 group"
              >
                {t("participateBtn")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Правая часть: Карточка реферальной системы (глассморфизм) */}
          <div className="w-full lg:w-auto bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shrink-0 shadow-2xl relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Gift className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-white">{t("referEarn")}</h3>
                <p className="text-brand-blue font-semibold">{t("optionActive")}</p>
              </div>
            </div>
            <p className="text-md text-gray-300 max-w-sm mb-6 leading-relaxed">
              {t("referralBonus")}
            </p>
            <ul className="space-y-3 text-md font-medium text-gray-400">
              <li className="flex items-center gap-3">
                <Coins className="w-5 h-5 text-yellow-400" /> {t("payoutInBMK")}
              </li>
              <li className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-400" /> {t("instantAccrual")}
              </li>
            </ul>
          </div>

        </motion.div>
      </div>
    </section>
  );
}