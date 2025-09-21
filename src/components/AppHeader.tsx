import { useTranslation } from "react-i18next"

export function AppHeader() {
	const { t } = useTranslation()

	return (
		<header className="text-center mb-8 text-white relative">
			<h1
				className="text-4xl font-bold mb-2 mt-6 text-white animate-pulse"
				style={{
					textShadow:
						"0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00, 0 0 20px #00ff00",
				}}
			>
				{t("app.title")}
			</h1>
			<p className="text-lg opacity-95">{t("app.subtitle")}</p>
		</header>
	)
}
