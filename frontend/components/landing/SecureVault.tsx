'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Handshake, Lock, CurrencyDollar } from '@phosphor-icons/react';

export default function SecureVault() {
  const t = useTranslations('vision');

  return (
    <section className="relative w-full py-24 bg-[#0d0021] overflow-hidden flex flex-col items-center">
      
      {/* Luminous Vault Pulse — Фоновое атмосферное свечение из DESIGN.md */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(180deg, rgb(18,0,54) 0%, rgb(37,1,96) 51%, rgb(18,0,54) 100%)'
        }}
      />

      <div className="max-w-[1200px] w-full mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* Заголовок секции безопасности — Монолитный белый шрифт */}
        <div className="text-center mb-16 max-w-3xl">
          <span className="text-[11px] font-bold text-[#f7be00] font-mono tracking-[2px] uppercase">
            // SECURE_REGISTRY_PROTOCOL
          </span>
          <h2 className="font-sans text-[36px] md:text-[56px] font-bold text-[#ffffff] tracking-[-1.4px] leading-[1.00] mt-3 antialiased">
            System Integrity & Compliance
          </h2>
        </div>

        {/* Production Integrity Grid — Плоские плитки без теней согласно спецификации */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-16">
          
          {/* Блок 1: Безопасность и легальность (item3) */}
          <div className="bg-[#05010d] rounded-[16px] p-8 border border-white/8 flex flex-col justify-between transition-colors duration-200 hover:border-white/15">
            <div>
              <div className="w-10 h-10 rounded-[999px] bg-white/5 border border-white/10 flex items-center justify-center text-[#007bff] mb-6">
                <ShieldCheck className="w-5 h-5" weight="bold" />
              </div>
              <h3 className="font-sans text-[22px] font-bold text-[#ffffff] tracking-[-0.55px] leading-[1.38] mb-4 antialiased">
                {t('features.item3.title')}
              </h3>
              <p className="font-sans text-[15px] font-normal leading-[1.50] text-[#cfcfcf] antialiased">
                {t('features.item3.desc')}
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[12px] font-mono text-[#595959]">
              <span>STATUS: VERIFIED</span>
              <span>LOC: GLOBAL_NODES</span>
            </div>
          </div>

          {/* Блок 2: Гарантия и поддержка (item4) */}
          <div className="bg-[#05010d] rounded-[16px] p-8 border border-white/8 flex flex-col justify-between transition-colors duration-200 hover:border-white/15">
            <div>
              <div className="w-10 h-10 rounded-[999px] bg-white/5 border border-white/10 flex items-center justify-center text-[#f7be00] mb-6">
                <Handshake className="w-5 h-5" weight="bold" />
              </div>
              <h3 className="font-sans text-[22px] font-bold text-[#ffffff] tracking-[-0.55px] leading-[1.38] mb-4 antialiased">
                {t('features.item4.title')}
              </h3>
              <p className="font-sans text-[15px] font-normal leading-[1.50] text-[#cfcfcf] antialiased">
                {t('features.item4.desc')}
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[12px] font-mono text-[#595959]">
              <span>WARRANTY: 24_MONTHS</span>
              <span>INSURANCE: FULL_BACKUP</span>
            </div>
          </div>

        </div>

        {/* Дополнительная техническая строка-разделитель (Sleek Grid Metrics) */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-white/5 mb-16 text-center md:text-left">
          <div>
            <div className="text-[12px] font-mono text-[#737373] uppercase">// Ownership Model</div>
            <div className="text-[15px] font-bold text-[#ffffff] mt-1">100% Direct Asset</div>
          </div>
          <div>
            <div className="text-[12px] font-mono text-[#737373] uppercase">// Audit Framework</div>
            <div className="text-[15px] font-bold text-[#ffffff] mt-1">Pre-vetted Revenue</div>
          </div>
          <div>
            <div className="text-[12px] font-mono text-[#737373] uppercase">// Escrow Support</div>
            <div className="text-[15px] font-bold text-[#ffffff] mt-1">Contractual Lock</div>
          </div>
          <div>
            <div className="text-[12px] font-mono text-[#737373] uppercase">// Deployment</div>
            <div className="text-[15px] font-bold text-[#ffffff] mt-1">Immediate Transfer</div>
          </div>
        </div>

        {/* Final Conversion Area & Amber Acquisition Button */}
        <div className="flex flex-col items-center text-center max-w-xl">
          <h3 className="font-sans text-[22px] font-bold text-[#ffffff] tracking-[-0.55px] leading-[1.38] mb-6 antialiased">
            Ready to secure your wholesale digital media infrastructure?
          </h3>
          
          {/* Amber Acquisition Button — High contrast signal light on dark surface */}
          <button className="bg-[#f7be00] text-[#000000] text-[15px] font-bold tracking-normal rounded-[999px] py-3.5 px-8 flex items-center gap-2 hover:bg-[#e0ad00] active:bg-[#c99b00] transition-all duration-150 ease-in-out cursor-pointer group">
            <Lock className="w-4 h-4 transition-transform group-hover:scale-110" weight="bold" />
            Initialize Acquisition Terminal
          </button>
        </div>

      </div>
    </section>
  );
}