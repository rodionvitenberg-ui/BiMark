import { PresentationHero } from "@/components/presentation/presentation-hero";
import { PresentationContacts } from "@/components/presentation/presentation-contacts";
import { PresentationCatalog } from "@/components/presentation/presentation-catalog";
import { PresentationHeroFullscreen } from "@/components/presentation/presentation-hero-fullscreen"; 

export default function PresentationPage() {
  return (
    // Убрали 'dark', чтобы карточки в каталоге отрендерились в светлом стиле
    <main className="flex flex-col w-full">
      <PresentationHeroFullscreen />
      <PresentationHero />
      <PresentationContacts />
      <PresentationCatalog />
    </main>
  );
}