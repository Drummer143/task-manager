export const settings = {
    defaultLocale: "en",
    locales: ["en", "ru"]
} as const;

const defaultNS = "translation";

export function getOptions (lng: I18NLocale = settings.defaultLocale, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: settings.locales,
    fallbackLng: settings.defaultLocale,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns
  };
}