import React from 'react';
import HeroSection from '../../../components/landing/HeroSection';
import { VisionContent } from '../../../components/landing/VisionContent';
import { PresentationCatalog } from '../../../components/landing/AssetCatalog'; 

export default function VisionPage() {
  return (
    // Заменили bg-brand-light на bg-[#0a0f1c] для идеального темного фона всей страницы
    <main className="w-full min-h-screen bg-[#0a0f1c] overflow-x-hidden">
      
      {/* 1. Стартовый экран: видеопрезентация и эффект печати текста */}
      <HeroSection />

      {/* 2. Интерактивная Bento-сетка: графики, 3D-глобус с городами и защищенный шлюз эскроу */}
      <VisionContent />
      
      {/* 3. Премиальный каталог: сетка ассетов по 8 штук с кнопкой "Показать еще" */}
      <PresentationCatalog />
      
    </main>
  );
}