'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

import BorderGlow from '../BorderGlow';
import GlobeWireframe from '../ui/GlobeWireframe';

export function VisionContent() {
  const tVision = useTranslations('vision');

  const globeTourCities = ["dubai", "tallinn", "tbilisi", "kyiv", "chisinau", "bucharest", "london", "barcelona"];

  // Светлая версия glow-конфига, но с цветами HeroSection
  const glowConfig = {
    backgroundColor: '#ffffff',
    glowColor: '210 100% 50%',
    colors: ['#007bff', '#38bdf8', '#0ea5e9'],
    borderRadius: 24,
  };

  // Идеально сбалансированный цикл под твои тайминги (в секундах)
  const LOOP_DURATION = 4.8;

  return (
    <section className="relative w-full pt-12 pb-24 bg-[#f5f7fb] overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        <div className="max-w-4xl mb-12">
          <p className="text-xl md:text-xl text-slate-600 leading-relaxed font-medium">
            {tVision('hero.intro')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-6 auto-rows-[minmax(280px,_auto)]">
          
          {/* БЛОК 1: Доход пока вы спите */}
          <BorderGlow className="md:col-span-2 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 h-full overflow-hidden group flex flex-col justify-between bg-white">
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
                    stroke="#007bff"
                    strokeWidth="2"
                    className="opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </svg>
              </div>
            </div>
          </BorderGlow>

          {/* БЛОК 2: Зарабатывайте из любой точки */}
          <BorderGlow className="md:col-span-2 h-full" {...glowConfig}>
            <div className="relative rounded-[24px] p-8 md:p-10 min-h-[480px] md:min-h-full overflow-hidden group flex flex-col justify-start md:justify-between bg-white">
              <div className="relative z-10 w-full md:max-w-[50%] pointer-events-none mb-4 md:mb-2">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {tVision('features.item1.title')}
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed drop-shadow-md">
                  {tVision('features.item1.desc')}
                </p>
              </div>
              <div className="absolute -bottom-[25%] -right-[15%] w-[100%] aspect-square md:right-[-20%] md:top-[-10%] md:w-[70%] md:h-[120%] z-0 cursor-grab active:cursor-grabbing opacity-80 group-hover:opacity-100 transition-opacity duration-700">
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

          {/* БЛОК 3: Безопасность и легальность */}
<BorderGlow className="md:col-span-3 h-full" {...glowConfig}>
  <div className="relative rounded-[24px] p-8 md:p-10 h-full overflow-hidden 
                  flex flex-col md:flex-row justify-between items-center bg-white">

    {/* Текст */}
    <div className="relative z-10 max-w-2xl md:w-1/2">
      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
        {tVision('features.item3.title')}
      </h3>
      <p className="text-slate-600 text-lg leading-relaxed">
        {tVision('features.item3.desc')}
      </p>
    </div>

    {/* Большой чистый щит */}
    <div className="relative md:w-1/2 flex items-center justify-center mt-10 md:mt-0">
      <svg
        viewBox="0 0 24 24"
        className="w-40 h-40 md:w-64 md:h-64 drop-shadow-[0_20px_40px_rgba(0,123,255,0.25)]"
      >
        <defs>
          <linearGradient id="shield3d" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4da3ff" />
            <stop offset="50%" stopColor="#007bff" />
            <stop offset="100%" stopColor="#005fcc" />
          </linearGradient>
        </defs>

        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          fill="url(#shield3d)"
          stroke="#005fcc"
          strokeWidth="1.5"
        />
      </svg>
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
