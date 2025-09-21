import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import ja from "./locales/ja.json"
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
			en: {
				translation: en,
			},
			ja: {
				translation: ja,
			},
			zh: {
				translation: zh,
			},
		},
	})

export default i18n
