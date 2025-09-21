import { useTranslation } from "react-i18next"
import { useMergeWorkflow } from "../contexts/MergeWorkflowContext"
import { FileSelector } from "./FileSelector"
import { LEDPreview } from "./LEDPreview"
import { ReviewSummary } from "./ReviewSummary"
import { SlotMapper } from "./SlotMapper"

export function MergeWorkflow() {
	const { t } = useTranslation()
	const {
		currentStep,
		setCurrentStep,
		baseConfig,
		baseFileName,
		concatenatedConfigs,
		savedSlotFiles,
		handleBaseFileSelect,
		handleProceedToMapping,
		handleReselectBase,
		handleMappingComplete,
		handleSaveConfiguration,
		resetApp,
	} = useMergeWorkflow()

	const handleNavigateBack = () => {
		if (currentStep === "configureMappings") {
			setCurrentStep("selectBase")
		} else if (currentStep === "review") {
			setCurrentStep("configureMappings")
		}
	}

	return (
		<div className="backdrop-blur-md bg-white/20 rounded-2xl p-8">
			{currentStep === "selectBase" && (
				<>
					<FileSelector
						title={t("fileSelector.selectBaseTitle")}
						onFileSelect={handleBaseFileSelect}
						selectedFile={baseFileName}
					/>
					{baseConfig && (
						<>
							<LEDPreview
								config={baseConfig}
								selectedPage={5}
								slot={1}
							/>
							<LEDPreview
								config={baseConfig}
								selectedPage={6}
								slot={2}
							/>
							<LEDPreview
								config={baseConfig}
								selectedPage={7}
								slot={3}
							/>
							<div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6 gap-4">
								<input
									type="button"
									onClick={handleReselectBase}
									className="backdrop-blur-sm bg-white/10 text-white border border-white/30 px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/20 hover:-translate-y-0.5"
									value={t("buttons.reselectFile")}
								/>
								<input
									type="button"
									onClick={handleProceedToMapping}
									className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
									value={t("buttons.proceed")}
								/>
							</div>
						</>
					)}
				</>
			)}

			{currentStep === "configureMappings" &&
				baseConfig &&
				baseFileName && (
					<SlotMapper
						baseConfig={baseConfig}
						baseFileName={baseFileName}
						savedSlotFiles={savedSlotFiles}
						onMappingComplete={handleMappingComplete}
						onBack={handleNavigateBack}
					/>
				)}

			{currentStep === "review" && baseConfig && (
				<ReviewSummary
					baseConfig={baseConfig}
					concatenatedConfigs={concatenatedConfigs}
					onConfirm={handleSaveConfiguration}
					onBack={handleNavigateBack}
				/>
			)}

			{currentStep === "complete" && (
				<div className="text-center py-12">
					<h2 className="text-green-400 mb-4 text-3xl font-bold">
						{t("complete.success")}
					</h2>
					<p className="text-white mb-8 text-lg">
						{t("complete.message")}
					</p>
					<input
						type="button"
						onClick={resetApp}
						className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
						value={t("buttons.createAnother")}
					/>
				</div>
			)}
		</div>
	)
}
