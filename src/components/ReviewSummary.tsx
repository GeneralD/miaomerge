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
	return (
		<div>
			<h2 className="mb-6 text-gray-800 text-2xl font-semibold">
				Review Configuration
			</h2>

			<div className="py-6">
				<LEDPreview
					config={concatenatedConfigs?.[5] || baseConfig}
					selectedPage={
						concatenatedConfigs?.[5]?.page_data[0]?.page_index || 5
					}
					displayName="LED 1 Preview"
				/>
				<LEDPreview
					config={concatenatedConfigs?.[6] || baseConfig}
					selectedPage={
						concatenatedConfigs?.[6]?.page_data[0]?.page_index || 6
					}
					displayName="LED 2 Preview"
				/>
				<LEDPreview
					config={concatenatedConfigs?.[7] || baseConfig}
					selectedPage={
						concatenatedConfigs?.[7]?.page_data[0]?.page_index || 7
					}
					displayName="LED 3 Preview"
				/>
			</div>

			<div className="flex justify-between gap-4 mt-8">
				<input
					type="button"
					onClick={onBack}
					className="bg-gray-100 text-gray-600 border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-200"
					value="Back to Mapping"
				/>
				<input
					type="button"
					onClick={onConfirm}
					className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					value="Save Configuration"
				/>
			</div>
		</div>
	)
}
