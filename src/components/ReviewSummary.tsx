import { useTranslation } from "react-i18next"
import type { LEDConfiguration } from "../types"
import type { ConcatenatedLEDConfig } from "../utils/frameUtils"
import { LEDPreview } from "./LEDPreview"

interface ReviewSummaryProps {
	baseConfig: LEDConfiguration
	concatenatedConfigs: { [key: number]: ConcatenatedLEDConfig } | null
	onConfirm: () => void
	onBack: () => void
}

export function ReviewSummary({
	baseConfig,
	concatenatedConfigs,
	onConfirm,
	onBack,
}: ReviewSummaryProps) {
	const { t } = useTranslation()

	return (
		<div>
			<h2 className="mb-6 text-white text-2xl font-semibold">
				{t("review.title")}
			</h2>

			<div className="py-6">
				<LEDPreview
					config={concatenatedConfigs?.[5] || baseConfig}
					selectedPage={
						concatenatedConfigs?.[5]?.page_data[0]?.page_index || 5
					}
					slot={1}
				/>
				<LEDPreview
					config={concatenatedConfigs?.[6] || baseConfig}
					selectedPage={
						concatenatedConfigs?.[6]?.page_data[0]?.page_index || 6
					}
					slot={2}
				/>
				<LEDPreview
					config={concatenatedConfigs?.[7] || baseConfig}
					selectedPage={
						concatenatedConfigs?.[7]?.page_data[0]?.page_index || 7
					}
					slot={3}
				/>
			</div>

			<div className="flex justify-between gap-4 mt-8">
				<input
					type="button"
					onClick={onBack}
					className="backdrop-blur-sm bg-white/10 text-white border border-white/30 px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/20"
					value={t("buttons.backToMapping")}
				/>
				<input
					type="button"
					onClick={onConfirm}
					className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					value={t("buttons.saveConfiguration")}
				/>
			</div>
		</div>
	)
}
