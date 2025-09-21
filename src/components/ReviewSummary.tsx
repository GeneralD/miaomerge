import type { LEDConfiguration, MergeMapping } from "../types"
import { LEDPreview } from "./LEDPreview"
import type { ConcatenatedLEDConfig } from "../utils/frameUtils"

interface ReviewSummaryProps {
	baseConfig: LEDConfiguration
	mappings: MergeMapping[]
	concatenatedConfigs: { [key: number]: ConcatenatedLEDConfig } | null
	onConfirm: () => void
	onBack: () => void
}

export function ReviewSummary({
	baseConfig,
	mappings,
	concatenatedConfigs,
	onConfirm,
	onBack,
}: ReviewSummaryProps) {
	return (
		<div className="review-summary">
			<h2>Review Configuration</h2>

			<div className="preview-section">
				<LEDPreview
					config={concatenatedConfigs?.[5] || baseConfig}
					selectedPage={concatenatedConfigs?.[5]?.page_data[0]?.page_index || 5}
					displayName="LED 1 Preview"
				/>
				<LEDPreview
					config={concatenatedConfigs?.[6] || baseConfig}
					selectedPage={concatenatedConfigs?.[6]?.page_data[0]?.page_index || 6}
					displayName="LED 2 Preview"
				/>
				<LEDPreview
					config={concatenatedConfigs?.[7] || baseConfig}
					selectedPage={concatenatedConfigs?.[7]?.page_data[0]?.page_index || 7}
					displayName="LED 3 Preview"
				/>
			</div>

			<div className="actions">
				<input
					type="button"
					onClick={onBack}
					className="back-button"
					value="Back to Mapping"
				/>
				<input
					type="button"
					onClick={onConfirm}
					className="confirm-button"
					value="Save Configuration"
				/>
			</div>
		</div>
	)
}
