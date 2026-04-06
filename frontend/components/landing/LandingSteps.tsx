"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useSpring } from "framer-motion";
import { UserPlus, FolderSearch, Wallet } from "lucide-react";

export function LandingSteps() {
  const t = useTranslations("Landing.Steps");
  const containerRef = useRef<HTMLDivElement>(null);

  // Отслеживаем прогресс скролла внутри этого компонента
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Делаем прогресс более плавным, чтобы линия не "дергалась"
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const steps = [
    {
      id: 1,
      title: "step1Title",
      text: "step1Text",
      icon: UserPlus,
    },
    {
      id: 2,
      title: "step2Title",
      text: "step2Text",
      icon: FolderSearch,
    },
    {
      id: 3,
      title: "step3Title",
      text: "step3Text",
      icon: Wallet,
    }
  ];

  return (
    <section className="relative w-full py-24 md:py-32 bg-[#0a0f1c] text-white overflow-hidden border-t border-white/5">
      
      {/* Декоративный свет */}
      <div className="absolute left-0 top-1/3 w-[600px] h-[600px] bg-brand-blue/10 blur-[150px] rounded-full pointer-events-none -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {t("title")}
          </h2>
        </motion.div>

        {/* Контейнер таймлайна */}
        <div ref={containerRef} className="max-w-4xl mx-auto relative">
          
          {/* Базовая (тусклая) вертикальная линия */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2 rounded-full" />
          
          {/* Анимированная (синяя) вертикальная линия */}
          <motion.div 
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-brand-blue -translate-x-1/2 rounded-full origin-top shadow-[0_0_15px_rgba(0,124,189,0.8)]"
            style={{ scaleY: smoothProgress }}
          />

          <div className="space-y-16 md:space-y-24 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              // Чередуем: четные шаги слева, нечетные справа (на десктопе)
              const isEven = index % 2 === 0;

              return (
                <div key={step.id} className="relative flex items-center flex-col md:flex-row w-full">
                  
                  {/* Иконка в центре на таймлайне */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                    className="absolute left-8 md:left-1/2 w-16 h-16 rounded-2xl bg-[#0a0f1c] border-2 border-brand-blue flex items-center justify-center -translate-x-1/2 z-20 shadow-[0_0_20px_rgba(0,124,189,0.3)]"
                  >
                    <Icon className="w-8 h-8 text-brand-blue" />
                  </motion.div>

                  {/* Карточка контента */}
                  <motion.div 
                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    // На десктопе раскидываем карточки вправо/влево, на мобилке - все справа от линии
                    className={`w-full md:w-[45%] pl-24 md:pl-0 ${isEven ? 'md:mr-auto md:text-right md:pr-12' : 'md:ml-auto md:pl-12'}`}
                  >
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:border-brand-blue/30 transition-colors duration-500 group">
                      <div className={`text-6xl font-black text-white/5 absolute top-4 ${isEven ? 'md:left-4 right-4' : 'right-4 md:right-4'} pointer-events-none group-hover:text-brand-blue/10 transition-colors`}>
                        0{step.id}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                        {t(step.title as any)}
                      </h3>
                      <p className="text-gray-400 text-lg leading-relaxed relative z-10">
                        {t(step.text as any)}
                      </p>
                    </div>
                  </motion.div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}