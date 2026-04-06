"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

interface LegalConsentProps {
  onConsentChange: (isAgreed: boolean) => void;
}

export function LegalConsent({ onConsentChange }: LegalConsentProps) {
  const tAuth = useTranslations("Auth");
  const tTerms = useTranslations("TermsOfService");
  const tAml = useTranslations("AmlPolicy");
  
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [amlAgreed, setAmlAgreed] = useState(false);
  
  const [expandedSection, setExpandedSection] = useState<"terms" | "aml" | null>(null);

  useEffect(() => {
    onConsentChange(termsAgreed && amlAgreed);
  }, [termsAgreed, amlAgreed, onConsentChange]);

  const toggleExpand = (section: "terms" | "aml") => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderItem = (
    id: "terms" | "aml",
    isAgreed: boolean,
    setAgreed: (val: boolean) => void,
    checkboxLabel: string,
    contentNode: React.ReactNode
  ) => {
    const isExpanded = expandedSection === id;

    return (
      <div className="flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white/30 dark:bg-[#0a0f1c]/50 backdrop-blur-sm transition-colors">
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setAgreed(!isAgreed);
            }}
            className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all shrink-0 ${
              isAgreed 
                ? "bg-brand-blue border-brand-blue text-white" 
                : "border-zinc-300 dark:border-zinc-600 hover:border-brand-blue dark:hover:border-brand-blue bg-transparent"
            }`}
          >
            {isAgreed && <Check className="w-4 h-4 stroke-[3]" />}
          </button>
          
          <div 
            className="flex-1 flex items-center justify-between cursor-pointer select-none group"
            onClick={() => toggleExpand(id)}
          >
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-brand-blue transition-colors">
              {checkboxLabel}
            </span>
            <ChevronDown 
              className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isExpanded ? "rotate-180 text-brand-blue" : ""}`} 
            />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-4 pb-5 pt-1 max-h-60 overflow-y-auto custom-scrollbar">
                {contentNode}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ОБНОВЛЕННЫЙ КОНТЕНТ: 8 секций Условий использования
  const termsContent = (
    <div className="space-y-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
      <p className="italic text-zinc-400 dark:text-zinc-500">{tTerms("lastUpdated")}</p>
      
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tTerms("introTitle")}</h4>
        <p>{tTerms("introText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tTerms("subjectTitle")}</h4>
        <p>{tTerms("subjectText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tTerms("registrationTitle")}</h4>
        <p>{tTerms("registrationText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tTerms("rulesTitle")}</h4>
        <p>{tTerms("rulesText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tTerms("escrowTitle")}</h4>
        <p>{tTerms("escrowText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tTerms("risksTitle")}</h4>
        <p>{tTerms("risksText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tTerms("liabilityTitle")}</h4>
        <p>{tTerms("liabilityText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tTerms("disputesTitle")}</h4>
        <p>{tTerms("disputesText")}</p>
      </div>
    </div>
  );

  const amlContent = (
    <div className="space-y-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
      <p className="italic text-zinc-400 dark:text-zinc-500">{tAml("lastUpdated")}</p>
      
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tAml("introTitle")}</h4>
        <p>{tAml("introText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tAml("kycTitle")}</h4>
        <p>{tAml("kycText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tAml("monitoringTitle")}</h4>
        <p>{tAml("monitoringText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tAml("sanctionsTitle")}</h4>
        <p>{tAml("sanctionsText")}</p>
      </div>
      <div>
        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{tAml("reportingTitle")}</h4>
        <p>{tAml("reportingText")}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 mt-4 mb-6">
      {renderItem("terms", termsAgreed, setTermsAgreed, tAuth("agreeTerms"), termsContent)}
      {renderItem("aml", amlAgreed, setAmlAgreed, tAuth("agreeAml"), amlContent)}
    </div>
  );
}