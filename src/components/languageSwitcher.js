import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../CSS/languageSwitcher.css';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [initialized, setInitialized] = useState(false);
  const [language, setLanguage] = useState('');
  const [showLanguages, setShowLanguages] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      setLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    } else {
      setLanguage(i18n.language);
    }
    setInitialized(true);
  }, [i18n]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setLanguage(lng);
    setShowLanguages(false);
  };

  if (!initialized) return null;

  return (
    <div className="language-switcher-container bg-dark" style={{ padding: '5px' }}>
      <button className="language-switcher-button" onClick={() => setShowLanguages(!showLanguages)}>{t('button.language')}</button>
      {showLanguages && (
        <div className="language-switcher-dropdown">
          <button onClick={() => changeLanguage('en')} disabled={language === 'en'}>
            {t('button.english')}
          </button>
          <button onClick={() => changeLanguage('es')} disabled={language === 'es'}>
            {t('button.spanish')}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;