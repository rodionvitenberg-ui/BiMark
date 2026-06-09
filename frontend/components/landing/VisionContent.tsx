'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import BorderGlow from '../BorderGlow';
import GlobeWireframe from '../ui/GlobeWireframe';

export function VisionContent() {
  const tVision = useTranslations('vision');

  const globeTourCities = ["dubai", "tallinn", "tbilisi", "kyiv", "chisinau", "bucharest", "london", "barcelona"];

  const glowConfig = {
    backgroundColor: '#0a0f1c',
    glowColor: '210 100% 50%',
    colors: ['#007bff', '#38bdf8', '#0ea5e9'],
    borderRadius: 24,
  };

  return (
    <section className="relative w-full pt-12 pb-24 bg-[#0a0f1c] overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="max-w-4xl mb-12">
          <p className="text-xl md:text-xl text-gray-400 leading-relaxed font-medium">
            {tVision('hero.intro')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-6 auto-rows-[minmax(280px,_auto)]">
          
          {/* БЛОК 1: Доход пока вы спите */}
          <BorderGlow className="md:col-span-2 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 h-full overflow-hidden group flex flex-col justify-between">
              <div className="relative z-10 max-w-sm">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {tVision('features.item2.title')}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  {tVision('features.item2.desc')}
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-3/4 h-2/3 pointer-events-none flex items-end justify-end p-6">
                <svg className="absolute bottom-0 right-0 left-10 w-full h-full text-[#007bff]/10 transform translate-y-6 group-hover:translate-y-2 transition-transform duration-700 ease-out" viewBox="0 0 200 100" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 100C30 100 40 60 70 50C100 40 120 70 150 40C180 10 190 20 200 0L200 100H0Z" fill="currentColor"/>
                  <path d="M0 100C30 100 40 60 70 50C100 40 120 70 150 40C180 10 190 20 200 0" stroke="#007bff" strokeWidth="2" className="opacity-50 group-hover:opacity-100 transition-opacity duration-500"/>
                </svg>
              </div>
            </div>
          </BorderGlow>

          {/* БЛОК 2: Зарабатывайте из любой точки */}
          <BorderGlow className="md:col-span-2 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 min-h-[480px] md:min-h-full overflow-hidden group flex flex-col justify-start md:justify-between">
              <div className="relative z-10 w-full md:max-w-[50%] pointer-events-none mb-4 md:mb-2">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {tVision('features.item1.title')}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed drop-shadow-md">
                  {tVision('features.item1.desc')}
                </p>
              </div>
              <div className="absolute -bottom-[25%] -right-[15%] w-[100%] aspect-square md:right-[-20%] md:top-[-10%] md:w-[70%] md:h-[120%] z-0 cursor-grab active:cursor-grabbing opacity-70 group-hover:opacity-100 transition-opacity duration-700">
                <GlobeWireframe 
                  variant="wireframesolid"
                  strokeColor="#007bff"
                  sphereOutlineColor="#007bff"
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

          {/* БЛОК 3: Безопасность и легальность (СИНХРОНИЗИРОВАННЫЙ ШЛЮЗ) */}
          <BorderGlow className="md:col-span-3 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 h-full overflow-hidden flex flex-col justify-between group">
              <div className="relative z-10 max-w-2xl mb-16 md:mb-12">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {tVision('features.item3.title')}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  {tVision('features.item3.desc')}
                </p>
              </div>

              <div className="relative w-full max-w-lg mt-auto pb-4 h-16 flex items-center justify-center">
                
                {/* Единый скрытый трек для идеального позиционирования */}
                <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-0 z-10">
                  
                  {/* Фоновая линия передачи */}
                  <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#007bff]/30 to-transparent top-1/2 -translate-y-1/2" />

                  {/* ТОЧКА 1: Движение от 0% до 50% за 1.2 секунды */}
                  <motion.div
                    animate={{ 
                      left: ["0%", "50%"],
                      opacity: [0, 1, 0] 
                    }}
                    transition={{
                      duration: 1.2,
                      times: [0, 0.15, 1], 
                      repeat: Infinity,
                      repeatDelay: 1.8,   
                      ease: "easeIn"
                    }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[#007bff] rounded-full shadow-[0_0_15px_rgba(0,123,255,1)]"
                  />

                  {/* ТОЧКА 2: Движение от 50% до 100% за 1.2 секунды (с задержкой 1.8с) */}
                  <motion.div
                    animate={{ 
                      left: ["50%", "100%"],
                      opacity: [0, 1, 0] 
                    }}
                    transition={{
                      duration: 1.2,
                      times: [0, 0.85, 1], 
                      repeat: Infinity,
                      repeatDelay: 1.8,
                      delay: 1.8,         
                      ease: "easeOut"
                    }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-[#007bff] rounded-full shadow-[0_0_15px_rgba(0,123,255,1)]"
                  />
                </div>

                {/* Нода А (Продавец) - С синхронным угасанием сияния */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0a0f1c] border border-white/10 flex items-center justify-center z-20">
                  {/* Мягкий синий неоновый бэкграунд-пульс */}
                  <motion.div
                    animate={{ 
                      opacity: [0.8, 0.05, 0.05], 
                      scale: [1.4, 0.95, 0.95] 
                    }}
                    transition={{ 
                      duration: 3, 
                      times: [0, 0.4, 1], // Угасает ровно от 0 до 1.2с (1.2 / 3.0 = 0.4)
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-0 bg-[#007bff]/40 blur-[8px] rounded-full"
                  />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20 relative z-10" />
                </div>

                {/* Центральный терминал (Гарант / Escrow) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                  <motion.div 
                    animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.95, 1.15, 0.95] }}
                    transition={{ duration: 3, times: [0, 0.5, 1], repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#007bff]/40 blur-[20px] rounded-full" 
                  />
                  <div className="w-16 h-16 rounded-[18px] bg-[#0a0f1c] border border-[#007bff]/40 flex items-center justify-center relative z-20 shadow-[0_0_24px_rgba(0,123,255,0.15)] group-hover:border-[#007bff] transition-colors duration-500">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="text-[#007bff]">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.5" className="opacity-40" />
                      <path d="M12 8v8" strokeWidth="1.5" className="opacity-80" />
                      <path d="M8.5 12h7" strokeWidth="1.5" className="opacity-80" />
                      <circle cx="12" cy="12" r="2.5" fill="currentColor" strokeWidth="0" />
                    </svg>
                  </div>
                </div>

                {/* Нода B (Покупатель) - С синхронным зажиганием сияния */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0a0f1c] border border-white/10 flex items-center justify-center z-20">
                  {/* Мягкий синий неоновый бэкграунд-пульс */}
                  <motion.div
                    animate={{ 
                      opacity: [0.05, 0.05, 0.8], 
                      scale: [0.95, 0.95, 1.4] 
                    }}
                    transition={{ 
                      duration: 3, 
                      times: [0, 0.6, 1], // Начинает разгораться ровно с 1.8с до 3.0с (1.8 / 3.0 = 0.6)
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-0 bg-[#007bff]/40 blur-[8px] rounded-full"
                  />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20 relative z-10" />
                </div>

              </div>
            </div>
          </BorderGlow>

          {/* БЛОК 4: Гарантия */}
          <BorderGlow className="md:col-span-1 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 h-full overflow-hidden flex flex-col justify-center group">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-3">
                  {tVision('features.item4.title')}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                  {tVision('features.item4.desc')}
                </p>
              </div>
              <div className="absolute -bottom-6 -right-4 text-[120px] font-black text-white/5 leading-none group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 pointer-events-none">
                2Y
              </div>
            </div>
          </BorderGlow>

        </div>
      </div>
    </section>
  );
}