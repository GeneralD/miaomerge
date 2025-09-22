import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import ar from "./locales/ar.json"
import de from "./locales/de.json"
import en from "./locales/en.json"
import es from "./locales/es.json"
import fr from "./locales/fr.json"
import id from "./locales/id.json"
import ja from "./locales/ja.json"
import ko from "./locales/ko.json"
import pt from "./locales/pt.json"
import ru from "./locales/ru.json"
import th from "./locales/th.json"
import vi from "./locales/vi.json"
import zh from "./locales/zh.json"

i18n.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: "en",
		debug: false,
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["cookie", "navigator", "htmlTag"],
			lookupCookie: "language",
			caches: ["cookie"],
			cookieOptions: {
				path: "/",
				sameSite: "strict",
				maxAge: 365 * 24 * 60 * 60, // 1 year
			},
		},
		resources: {
			ar: {
				translation: ar,
			},
			de: {
				translation: de,
			},
			en: {
				translation: en,
			},
			es: {
				translation: es,
			},
			fr: {
				translation: fr,
			},
			id: {
				translation: id,
			},
			ja: {
				translation: ja,
			},
			ko: {
				translation: ko,
			},
			pt: {
				translation: pt,
			},
			ru: {
				translation: ru,
			},
			th: {
				translation: th,
			},
			vi: {
				translation: vi,
			},
			zh: {
				translation: zh,
			},
		},
	})

export default i18n
