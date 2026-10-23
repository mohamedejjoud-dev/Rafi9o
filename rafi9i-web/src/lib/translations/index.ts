/**
 * Rafi9i — Translation modules, one file per feature area so that areas can
 * be translated independently. Merged into `translations` in lib/i18n.tsx.
 */
import assessment from "./assessment";
import content from "./content";
import dashboard from "./dashboard";
import publicPages from "./public";
import type { TranslationModule } from "./types";

export const translationModules: TranslationModule[] = [dashboard, assessment, publicPages, content];
