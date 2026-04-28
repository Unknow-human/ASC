import React, { createContext, useContext, useState, useEffect } from 'react';
import { config } from './content';

type ConfigContextType = {
  logo: string;
  setLogo: (logo: string) => void;
  images: typeof config.images;
  setImages: React.Dispatch<React.SetStateAction<typeof config.images>>;
  dynamicSections: any[];
  setDynamicSections: React.Dispatch<React.SetStateAction<any[]>>;
  openingHours: Record<string, { open: string, close: string, isClosed: boolean }>;
  setOpeningHours: React.Dispatch<React.SetStateAction<Record<string, { open: string, close: string, isClosed: boolean }>>>;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [logo, setLogoState] = useState(config.logo);
  const [images, setImagesState] = useState(config.images);
  const [dynamicSections, setDynamicSectionsState] = useState<any[]>([]);
  const [openingHours, setOpeningHoursState] = useState<Record<string, { open: string, close: string, isClosed: boolean }>>({
    monday: { open: '08:00', close: '20:00', isClosed: false },
    tuesday: { open: '08:00', close: '20:00', isClosed: false },
    wednesday: { open: '08:00', close: '20:00', isClosed: false },
    thursday: { open: '08:00', close: '20:00', isClosed: false },
    friday: { open: '08:00', close: '20:00', isClosed: false },
    saturday: { open: '08:00', close: '20:00', isClosed: false },
    sunday: { open: '10:00', close: '20:00', isClosed: false },
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const resp = await fetch('/api/config');
        if (resp.ok) {
          const serverConfig = await resp.json();
          if (serverConfig.logo) setLogoState(serverConfig.logo);
          if (serverConfig.images) setImagesState(prev => ({ ...prev, ...serverConfig.images }));
          if (serverConfig.dynamicSections) setDynamicSectionsState(serverConfig.dynamicSections);
          if (serverConfig.openingHours) setOpeningHoursState(serverConfig.openingHours);
          return; // Skip local storage if server works
        }
      } catch (e) {
        console.error('Failed to fetch config from server, falling back to localStorage', e);
      }

      // Fallback to localStorage
      const storedLogo = localStorage.getItem('asc_logo');
      if (storedLogo) setLogoState(storedLogo);

      const storedImages = localStorage.getItem('asc_images');
      if (storedImages) {
        try {
          setImagesState({ ...config.images, ...JSON.parse(storedImages) });
        } catch (e) {}
      }

      const storedSections = localStorage.getItem('asc_sections');
      if (storedSections) {
        try {
          setDynamicSectionsState(JSON.parse(storedSections));
        } catch (e) {}
      }

      const storedHours = localStorage.getItem('asc_hours');
      if (storedHours) {
        try {
          setOpeningHoursState(JSON.parse(storedHours));
        } catch (e) {}
      }
    };
    
    fetchConfig();
  }, []);

  const setLogo = (newLogo: string) => {
    setLogoState(newLogo);
    localStorage.setItem('asc_logo', newLogo);
  };

  const setImages: React.Dispatch<React.SetStateAction<typeof config.images>> = (value) => {
    setImagesState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('asc_images', JSON.stringify(next));
      return next;
    });
  };

  const setDynamicSections: React.Dispatch<React.SetStateAction<any[]>> = (value) => {
    setDynamicSectionsState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('asc_sections', JSON.stringify(next));
      return next;
    });
  };

  const setOpeningHours: React.Dispatch<React.SetStateAction<Record<string, { open: string, close: string, isClosed: boolean }>>> = (value) => {
    setOpeningHoursState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem('asc_hours', JSON.stringify(next));
      return next;
    });
  };

  return (
    <ConfigContext.Provider value={{ logo, setLogo, images, setImages, dynamicSections, setDynamicSections, openingHours, setOpeningHours }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
