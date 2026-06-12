'use client';

import { useTranslations } from 'next-intl';
import { motion, Variants } from 'framer-motion'; // ИСПРАВЛЕНО: Импортировали тип Variants
import { CoinsIcon, ShieldCheck, GlobeHemisphereEastIcon, Medal } from '@phosphor-icons/react';

import BorderGlow from '../BorderGlow';
import GlobeWireframe from '../ui/GlobeWireframe';
import TiltShield from './TiltShield';

export function VisionContent() {
  const tVision = useTranslations('vision');

  const globeTourCities = ["dubai", "tallinn", "tbilisi", "kyiv", "chisinau", "bucharest", "london", "barcelona"];

  // Светлая версия glow-конфига для ПК-версии
  const glowConfig = {
    backgroundColor: '#ffffff',
    glowColor: '210 100% 50%',
    colors: ['#0096df', '#38bdf8', '#0ea5e9'],
    borderRadius: 24,
  };

  // ИСПРАВЛЕНО: Явно указали типы : Variants, чтобы TypeScript не ругался
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section className="relative w-full pt-12 pb-12 bg-[#f5f7fb] overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Интро-абзац (одинаков для всех разрешений) */}
        <div className="max-w-4xl mb-12">
          <p className="text-xl md:text-xl text-slate-600 leading-relaxed font-medium">
            {tVision('hero.intro')}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ: Адаптированная под чистый паттерн AboutUs (Светлая тема) */}
        {/* ========================================================================= */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="block md:hidden bg-[#f5f7fb] rounded-[24px] p-6 border border-slate-200/60 shadow-sm space-y-8"
        >
          {/* Строка 1: Доход пока вы спите */}
          <motion.div variants={itemVariants} className="flex gap-4 items-start">
            <CoinsIcon className="w-7 h-7 text-[#0096df] shrink-0 mt-1" weight="duotone" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {tVision('features.item2.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {tVision('features.item2.desc')}
              </p>
            </div>
          </motion.div>

          {/* Строка 2: Безопасность и легальность */}
          <motion.div variants={itemVariants} className="flex gap-4 items-start">
            <ShieldCheck className="w-7 h-7 text-[#0096df] shrink-0 mt-1" weight="duotone" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {tVision('features.item3.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {tVision('features.item3.desc')}
              </p>
            </div>
          </motion.div>

          {/* Строка 3: Зарабатывайте из любой точки (С иконкой глобуса) */}
          <motion.div variants={itemVariants} className="flex gap-4 items-start">
            <GlobeHemisphereEastIcon className="w-7 h-7 text-[#0096df] shrink-0 mt-1" weight="duotone" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {tVision('features.item1.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {tVision('features.item1.desc')}
              </p>
            </div>
          </motion.div>

          {/* Строка 4: Гарантия (С разделительной линией и вотермарком 2Y) */}
          <motion.div variants={itemVariants} className="flex gap-4 items-start pt-6 border-t border-slate-100 relative overflow-hidden">
            <Medal className="w-7 h-7 text-[#0096df] shrink-0 mt-1" weight="duotone" />
            <div className="relative z-10 pr-16">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {tVision('features.item4.title')}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {tVision('features.item4.desc')}
              </p>
            </div>
            {/* Вотермарк сохранен в правом углу */}
            <div className="absolute right-0 bottom-0 text-6xl font-black text-slate-100 leading-none pointer-events-none select-none">
              2Y
            </div>
          </motion.div>
        </motion.div>


        {/* ========================================================================= */}
        {/* 💻 ДЕСКТОПНАЯ ВЕРСИЯ: Интерактивная 3D-сетка (Оставлена без изменений) */}
        {/* ========================================================================= */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-6 auto-rows-[minmax(280px,_auto)]">
          
          {/* БЛОК 1: Доход пока вы спите */}
          <BorderGlow className="md:col-span-2 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 h-full overflow-hidden group flex flex-col justify-between bg-[#f5f7fb]">
              <div className="relative z-10 max-w-sm">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {tVision('features.item2.title')}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {tVision('features.item2.desc')}
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-3/4 h-2/3 pointer-events-none flex items-end justify-end p-6">
                <svg
                  className="absolute bottom-0 right-0 left-10 w-full h-full text-[#007bff]/15 transform translate-y-6 group-hover:translate-y-2 transition-transform duration-700 ease-out"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 100C30 100 40 60 70 50C100 40 120 70 150 40C180 10 190 20 200 0L200 100H0Z"
                    fill="currentColor"
                  />
                  <path
                    d="M0 100C30 100 40 60 70 50C100 40 120 70 150 40C180 10 190 20 200 0"
                    stroke="#0096df"
                    strokeWidth="2"
                    className="opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </svg>
              </div>
            </div>
          </BorderGlow>

          {/* БЛОК 2: Безопасность и легальность — Щит на месте глобуса справа */}
          <BorderGlow className="md:col-span-2 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 h-full overflow-hidden group flex flex-col justify-start md:justify-between bg-white">
              <div className="relative z-10 w-full md:max-w-[55%] pointer-events-none mb-4 md:mb-2">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {tVision('features.item3.title')}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {tVision('features.item3.desc')}
                </p>
              </div>
              <div className="absolute right-12 bottom-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:right-20 z-0 pointer-events-none">
                <TiltShield className="w-44 h-44 md:w-50 md:h-50" />
              </div>
            </div>
          </BorderGlow>

          {/* БЛОК 3: Зарабатывайте из любой точки — Глобус на месте щита справа от текста */}
          <BorderGlow className="md:col-span-3 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 h-full overflow-hidden group flex flex-col justify-between bg-white">
              <div className="relative z-10 max-w-md md:max-w-xl pointer-events-none">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                  {tVision('features.item1.title')}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {tVision('features.item1.desc')}
                </p>
              </div>

              <div className="absolute -right-[15%] -bottom-[35%] w-[95%] aspect-square md:-right-[10%] md:-top-[20%] md:w-[48%] md:h-[140%] z-0 cursor-grab active:cursor-grabbing opacity-85 group-hover:opacity-100 transition-opacity duration-700">
                <GlobeWireframe 
                  variant="wireframesolid"
                  strokeColor="#0096df"
                  sphereOutlineColor="#0096df"
                  autoRotate={false}
                  rotateCities={globeTourCities}
                  rotationSpeed={4000}
                  scale={1.1} 
                  enableInteraction={true}
                  className="w-full h-full"
                />
              </div>
            </div>
          </BorderGlow>

          {/* БЛОК 4: Гарантия */}
          <BorderGlow className="md:col-span-1 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 h-full overflow-hidden flex flex-col justify-center group bg-white">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-slate-900 mb-3">
                  {tVision('features.item4.title')}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  {tVision('features.item4.desc')}
                </p>
              </div>
              <div className="absolute -bottom-6 -right-4 text-[120px] font-black text-slate-200 leading-none group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 pointer-events-none">
                2Y
              </div>
            </div>
          </BorderGlow>

        </div>

      </div>
    </section>
  );
}