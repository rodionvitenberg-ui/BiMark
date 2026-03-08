import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "../../i18n/routing";

export function Footer() {
  const t = useTranslations("Footer");
  // Вытягиваем переводы из хедера, чтобы не дублировать логику
  const h = useTranslations("Header"); 

  return (
    <footer className="bg-[#0a0f1c] text-white pt-20 pb-10 border-t border-gray-800">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Логотип и описание (Занимает 2 колонки) */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-6 inline-flex">
              <Image 
                src="/logo.png"
                alt="Bimark Logo" 
                width={140}
                height={40}
                className="transition-opacity duration-300 hover:opacity-80"
              />
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              {t("description")}
            </p>
          </div>

          {/* Инвесторам */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">{t("investors")}</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/category" className="hover:text-brand-blue transition-colors">{h("assetsCatalog")}</Link></li>
              <li><Link href="/token" className="hover:text-brand-blue transition-colors">{h("presales")}</Link></li>
              <li><Link href="/how-it-works" className="hover:text-brand-blue transition-colors">{h("howItWorks")}</Link></li>
            </ul>
          </div>

          {/* Партнерам */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">{t("partners")}</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/raise-capital" className="hover:text-brand-blue transition-colors">{h("raiseCapital")}</Link></li>
              <li><Link href="/referral" className="hover:text-brand-blue transition-colors">{h("referralSystem")}</Link></li>
            </ul>
          </div>

          {/* Юридическая информация */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">{t("legal")}</h4>
            <ul className="space-y-4 text-gray-400">
              {/* Прописали правильные ссылки на страницы */}
              <li><Link href="/privacy" className="hover:text-brand-blue transition-colors text-sm">{t("privacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-brand-blue transition-colors text-sm">{t("terms")}</Link></li>
              <li><Link href="/aml" className="hover:text-brand-blue transition-colors text-sm">{t("aml")}</Link></li>
            </ul>
          </div>

        </div>

        {/* Копирайт */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <div>{t("rights")}</div>
          <div className="flex gap-6">
            <a href="mailto:contact@bimark.shop" className="hover:text-white transition-colors">contact@bimark.shop</a>
            <span>Georgia, Tbilisi</span>
          </div>
        </div>

      </div>
    </footer>
  );
}