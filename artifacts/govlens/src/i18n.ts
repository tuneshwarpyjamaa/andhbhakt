import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

const saved = typeof localStorage !== 'undefined'
  ? (localStorage.getItem('govlens-lang') ?? 'en')
  : 'en';

let hiLoad: Promise<void> | null = null;

export function ensureHiLanguage(): Promise<void> {
  if (i18n.hasResourceBundle('hi', 'translation')) return Promise.resolve();
  if (!hiLoad) {
    hiLoad = import('./locales/hi.json').then((mod) => {
      i18n.addResourceBundle('hi', 'translation', mod.default, true, true);
    });
  }
  return hiLoad;
}

export async function setAppLanguage(lng: string): Promise<void> {
  if (lng === 'hi') await ensureHiLanguage();
  await i18n.changeLanguage(lng);
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
    },
    lng: saved === 'hi' ? 'en' : saved,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

if (saved === 'hi') {
  ensureHiLanguage().then(() => i18n.changeLanguage('hi'));
}

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('govlens-lang', lng);
});

export default i18n;
