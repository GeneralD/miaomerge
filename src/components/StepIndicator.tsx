import { useTranslation } from "react-i18next"
import type { MergeStep } from "../types"

interface StepIndicatorProps {
	currentStep: MergeStep
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
	const { t } = useTranslation()

	const steps: MergeStep[] = [
		"selectBase",
		"configureMappings",
		"review",
		"complete",
	]

	return (
		<div className="flex justify-center gap-4 mb-8 flex-wrap">
			{steps.map((step) => (
				<div
					key={step}
					className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md ${
						currentStep === step
							? "bg-gradient-to-br from-green-500 to-emerald-600 text-white transform scale-105 shadow-lg"
							: "bg-white bg-opacity-20 text-white"
					}`}
				>
					{t(`steps.${step}`)}
				</div>
			))}
		</div>
	)
}
