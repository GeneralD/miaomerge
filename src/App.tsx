import { invoke } from "@tauri-apps/api/core"
import { save } from "@tauri-apps/plugin-dialog"
import { writeTextFile } from "@tauri-apps/plugin-fs"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import "./App.scss"
import "./i18n"
import { FileSelector } from "./components/FileSelector"
import { LanguageSelector } from "./components/LanguageSelector"
import { LEDPreview } from "./components/LEDPreview"
import { MatrixBackground } from "./components/MatrixBackground"
import { ReviewSummary } from "./components/ReviewSummary"
import { SlotMapper } from "./components/SlotMapper"
import type {
	FileInfo,
	LEDConfiguration,
	MergeMapping,
	MergeStep,
	SlotFile,
} from "./types"
import type { ConcatenatedLEDConfig } from "./utils/frameUtils"
import { isTauri } from "./utils/platform"

function App() {
	const { t } = useTranslation()
	const [currentStep, setCurrentStep] = useState<MergeStep>("selectBase")
	const [baseConfig, setBaseConfig] = useState<LEDConfiguration | null>(null)
	const [baseFileName, setBaseFileName] = useState<string | null>(null)
	const [mappings, setMappings] = useState<MergeMapping[]>([])
	const [concatenatedConfigs, setConcatenatedConfigs] = useState<{
		[key: number]: ConcatenatedLEDConfig
	} | null>(null)
	const [savedSlotFiles, setSavedSlotFiles] = useState<{
		[key: number]: SlotFile[]
	} | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleBaseFileSelect = async (file: FileInfo, content?: string) => {
		try {
			setIsLoading(true)
			setError(null)

			let config: LEDConfiguration

			if (isTauri()) {
				// Load the configuration from the backend (Tauri)
				config = await invoke<LEDConfiguration>("load_config", {
					path: file.path,
				})
			} else {
				// Parse the JSON content directly (Web)
				if (!content) {
					throw new Error("No file content provided for web version")
				}
				config = JSON.parse(content)
			}

			setBaseConfig(config)
			setBaseFileName(file.name)
		} catch (err) {
			console.error("App - Error loading config:", err)
			setError(t("errors.failedToLoad", { error: err }))
		} finally {
			setIsLoading(false)
		}
	}

	const handleProceedToMapping = () => {
		setCurrentStep("configureMappings")
	}

	const handleReselectBase = () => {
		setBaseConfig(null)
		setBaseFileName(null)
	}

	const handleMappingComplete = (
		newMappings: MergeMapping[],
		newConcatenatedConfigs: { [key: number]: ConcatenatedLEDConfig },
		slotFiles: { [key: number]: SlotFile[] }
	) => {
		// Create mappings for all pages, but only edit custom pages (5, 6, 7)
		const allMappings =
			baseConfig?.page_data.map((page) => {
				const editMapping = newMappings.find(
					(m) => m.slot === page.page_index
				)
				return (
					editMapping || {
						slot: page.page_index,
						action: "keep" as const,
					}
				)
			}) || []

		setMappings(allMappings)
		setConcatenatedConfigs(newConcatenatedConfigs)
		setSavedSlotFiles(slotFiles)
		setCurrentStep("review")
	}

	const handleSaveConfiguration = async () => {
		try {
			setIsLoading(true)
			setError(null)

			let mergedConfig: LEDConfiguration

			// Create filename with base name and timestamp
			const timestamp = new Date()
				.toISOString()
				.replace(/:/g, "-")
				.replace(/\..+/, "")
				.replace("T", "_")
			const baseNameWithoutExt =
				baseFileName?.replace(/\.json$/i, "") || "config"
			const fileName = `${baseNameWithoutExt}_${timestamp}.json`

			if (isTauri()) {
				// Merge configurations on the backend (Tauri)
				mergedConfig = await invoke<LEDConfiguration>("merge_configs", {
					baseConfig,
					mappings,
				})

				// Save the merged configuration using Tauri
				const savePath = await save({
					filters: [
						{
							name: "JSON",
							extensions: ["json"],
						},
					],
					defaultPath: fileName,
				})

				if (savePath) {
					await writeTextFile(
						savePath,
						JSON.stringify(mergedConfig, null, 2)
					)
					setCurrentStep("complete")
				}
			} else {
				// Simple merge for web version (keep original for now)
				mergedConfig = baseConfig as LEDConfiguration

				// Download the file using web APIs
				const blob = new Blob([JSON.stringify(mergedConfig, null, 2)], {
					type: "application/json",
				})
				const url = URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = fileName
				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)
				URL.revokeObjectURL(url)

				setCurrentStep("complete")
			}
		} catch (err) {
			setError(t("errors.failedToSave", { error: err }))
		} finally {
			setIsLoading(false)
		}
	}

	const resetApp = () => {
		setCurrentStep("selectBase")
		setBaseConfig(null)
		setBaseFileName(null)
		setMappings([])
		setConcatenatedConfigs(null)
		setSavedSlotFiles(null)
		setError(null)
	}

	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-8 relative">
			<MatrixBackground />
			<div className="fixed top-4 right-4 z-50">
				<LanguageSelector />
			</div>
			<main className="w-full max-w-4xl mx-auto relative z-10">
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

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex justify-between items-center">
						<p className="text-red-700 m-0">{error}</p>
						<input
							type="button"
							onClick={() => setError(null)}
							value={t("buttons.dismiss")}
							className="bg-red-700 text-white border-none px-3 py-1 rounded cursor-pointer"
						/>
					</div>
				)}

				{isLoading && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
						<div className="w-12 h-12 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin"></div>
						<p className="text-white mt-4 text-lg">
							{t("loading.processing")}
						</p>
					</div>
				)}

				<div className="flex justify-center gap-4 mb-8 flex-wrap">
					<div
						className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md ${
							currentStep === "selectBase"
								? "bg-gradient-to-br from-green-500 to-emerald-600 text-white transform scale-105 shadow-lg"
								: "bg-white bg-opacity-20 text-white"
						}`}
					>
						{t("steps.selectBase")}
					</div>
					<div
						className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md ${
							currentStep === "configureMappings"
								? "bg-gradient-to-br from-green-500 to-emerald-600 text-white transform scale-105 shadow-lg"
								: "bg-white bg-opacity-20 text-white"
						}`}
					>
						{t("steps.configureMappings")}
					</div>
					<div
						className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md ${
							currentStep === "review"
								? "bg-gradient-to-br from-green-500 to-emerald-600 text-white transform scale-105 shadow-lg"
								: "bg-white bg-opacity-20 text-white"
						}`}
					>
						{t("steps.review")}
					</div>
					<div
						className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md ${
							currentStep === "complete"
								? "bg-gradient-to-br from-green-500 to-emerald-600 text-white transform scale-105 shadow-lg"
								: "bg-white bg-opacity-20 text-white"
						}`}
					>
						{t("steps.complete")}
					</div>
				</div>

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
								onBack={() => setCurrentStep("selectBase")}
							/>
						)}

					{currentStep === "review" && baseConfig && (
						<ReviewSummary
							baseConfig={baseConfig}
							concatenatedConfigs={concatenatedConfigs}
							onConfirm={handleSaveConfiguration}
							onBack={() => setCurrentStep("configureMappings")}
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
			</main>
		</div>
	)
}

export default App
