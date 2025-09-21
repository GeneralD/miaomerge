import { useTranslation } from "react-i18next"

export function LanguageSelector() {
	const { i18n } = useTranslation()

	const languages = [
		{ code: "en", label: "🇺🇸 English" },
		{ code: "ja", label: "🇯🇵 日本語" },
		{ code: "zh", label: "🇨🇳 中文" },
	]

	const handleLanguageChange = (languageCode: string) => {
		i18n.changeLanguage(languageCode)
	}

	return (
		<div className="relative z-50">
			<select
				value={i18n.language}
				onChange={(e) => handleLanguageChange(e.target.value)}
				className="backdrop-blur-sm bg-white/10 text-white border border-white/30 rounded-lg px-3 py-2 text-sm cursor-pointer backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
				style={{ minWidth: "150px" }}
			>
				{languages.map((language) => (
					<option key={language.code} value={language.code}>
						{language.label}
					</option>
				))}
			</select>
		</div>
	)
}
