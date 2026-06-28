import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const localeLoaders = {
  en: () => import("./en.json"),
  ar: () => import("./ar.json"),
};

const normalizeLanguage = (language) =>
  (language || "en").toLowerCase().split("-")[0];

const dynamicLocaleBackend = {
  type: "backend",
  init: () => {},
  read(language, namespace, callback) {
    const normalizedLanguage = normalizeLanguage(language);
    const loader = localeLoaders[normalizedLanguage] || localeLoaders.en;

    loader()
      .then((module) => {
        callback(null, module.default || module);
      })
      .catch((error) => {
        callback(error, false);
      });
  },
};

let initPromise;

export const initI18n = () => {
  if (i18n.isInitialized) {
    return Promise.resolve(i18n);
  }

  if (!initPromise) {
    initPromise = i18n
      .use(LanguageDetector)
      .use(dynamicLocaleBackend)
      .use(initReactI18next)
      .init({
        fallbackLng: "en",
        supportedLngs: ["en", "ar"],
        load: "languageOnly",
        ns: ["translation"],
        defaultNS: "translation",
        partialBundledLanguages: true,
        detection: {
          order: ["querystring", "localStorage", "navigator", "htmlTag"],
          lookupQuerystring: "lang",
          caches: ["localStorage"],
        },
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: true,
        },
      })
      .then(() => i18n);
  }

  return initPromise;
};

export default i18n;
