import type { LEDConfiguration, MergeMapping } from "../types";
import { LEDPreview } from "./LEDPreview";

interface ReviewSummaryProps {
    baseConfig: LEDConfiguration;
    mappings: MergeMapping[];
    onConfirm: () => void;
    onBack: () => void;
}

export function ReviewSummary({
    baseConfig,
    mappings,
    onConfirm,
    onBack,
}: ReviewSummaryProps) {
    return (
        <div className="review-summary">
            <h2>Review Configuration</h2>

            <div className="preview-section">
                <LEDPreview
                    config={baseConfig}
                    selectedPage={5}
                    displayName="LED 1 Preview"
                />
                <LEDPreview
                    config={baseConfig}
                    selectedPage={6}
                    displayName="LED 2 Preview"
                />
                <LEDPreview
                    config={baseConfig}
                    selectedPage={7}
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
    );
}
