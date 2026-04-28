import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Lang, getContent } from './content';
import { useConfig } from './ConfigContext';

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  // This will dynamically change when config changes, but typescript type is easiest using fr directly
  t: ReturnType<typeof getContent>['fr'];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>('fr');
  const { images } = useConfig();
  const content = getContent(images);
  const t = content[lang];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
