export type TranslationLocale = "fr" | "en" | "ar";

/** One feature area's strings, keyed by locale then translation key. */
export type TranslationModule = Record<TranslationLocale, Record<string, string>>;
