"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "../../i18n/routing";

interface AiContextType {
  pageData: any;
  setPageData: (data: any) => void;
}

const AiPageContext = createContext<AiContextType>({
  pageData: null,
  setPageData: () => {},
});

export function AiContextProvider({ children }: { children: ReactNode }) {
  const [pageData, setPageData] = useState<any>(null);
  const pathname = usePathname();

  // При каждом переходе на новую страницу автоматически сбрасываем старый контекст лота
  useEffect(() => {
    setPageData(null);
  }, [pathname]);

  return (
    <AiPageContext.Provider value={{ pageData, setPageData }}>
      {children}
    </AiPageContext.Provider>
  );
}

export const useAiPageContext = () => useContext(AiPageContext);