import { invoke } from "@tauri-apps/api/core"
import { save } from "@tauri-apps/plugin-dialog"
import { writeTextFile } from "@tauri-apps/plugin-fs"
import { useState } from "react"
import "./App.css"
import { FileSelector } from "./components/FileSelector"
import { LEDPreview } from "./components/LEDPreview"
import { ReviewSummary } from "./components/ReviewSummary"
import { SlotMapper } from "./components/SlotMapper"
import type {
	FileInfo,
	LEDConfiguration,
	MergeMapping,
	MergeStep,
} from "./types"
import { isTauri } from "./utils/platform"
import type { ConcatenatedLEDConfig } from "./utils/frameUtils"

function App() {
	const [currentStep, setCurrentStep] = useState<MergeStep>("selectBase")
	const [baseConfig, setBaseConfig] = useState<LEDConfiguration | null>(null)
	const [baseFileName, setBaseFileName] = useState<string | null>(null)
	const [additionalFiles, setAdditionalFiles] = useState<FileInfo[]>([])
	const [mappings, setMappings] = useState<MergeMapping[]>([])
	const [concatenatedConfigs, setConcatenatedConfigs] = useState<{
		[key: number]: ConcatenatedLEDConfig
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
			setError(`Failed to load configuration: ${err}`)
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
		newConcatenatedConfigs: { [key: number]: ConcatenatedLEDConfig }
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
		setCurrentStep("review")
	}

	const handleSaveConfiguration = async () => {
		try {
			setIsLoading(true)
			setError(null)

			let mergedConfig: LEDConfiguration

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
					defaultPath: `merged_${new Date().toISOString().slice(0, 10)}.json`,
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
				mergedConfig = baseConfig!

				// Download the file using web APIs
				const blob = new Blob([JSON.stringify(mergedConfig, null, 2)], {
					type: "application/json",
				})
				const url = URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = `merged_${new Date().toISOString().slice(0, 10)}.json`
				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)
				URL.revokeObjectURL(url)

				setCurrentStep("complete")
			}
		} catch (err) {
			setError(`Failed to save configuration: ${err}`)
		} finally {
			setIsLoading(false)
		}
	}

	const resetApp = () => {
		setCurrentStep("selectBase")
		setBaseConfig(null)
		setBaseFileName(null)
		setAdditionalFiles([])
		setMappings([])
		setConcatenatedConfigs(null)
		setError(null)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
			<main className="w-full max-w-4xl mx-auto">
				<header className="text-center mb-8 text-white">
					<h1 className="text-4xl font-bold mb-2 drop-shadow-md">
						🎮 Cyberboard Config Merger
					</h1>
					<p className="text-lg opacity-95">
						Merge and customize your CYBERBOARD R4 LED
						configurations
					</p>
				</header>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex justify-between items-center">
						<p className="text-red-700 m-0">{error}</p>
						<input
							type="button"
							onClick={() => setError(null)}
							value="Dismiss"
							className="bg-red-700 text-white border-none px-3 py-1 rounded cursor-pointer"
						/>
					</div>
				)}

				{isLoading && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
						<div className="w-12 h-12 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin"></div>
						<p className="text-white mt-4 text-lg">Processing...</p>
					</div>
				)}

				<div className="flex justify-center gap-4 mb-8 flex-wrap">
					<div
						className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md ${
							currentStep === "selectBase"
								? "bg-white text-secondary-500 transform scale-105 shadow-lg"
								: "bg-white bg-opacity-20 text-white"
						}`}
					>
						1. Select Base
					</div>
					<div
						className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md ${
							currentStep === "configureMappings"
								? "bg-white text-secondary-500 transform scale-105 shadow-lg"
								: "bg-white bg-opacity-20 text-white"
						}`}
					>
						2. Configure Mappings
					</div>
					<div
						className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md ${
							currentStep === "review"
								? "bg-white text-secondary-500 transform scale-105 shadow-lg"
								: "bg-white bg-opacity-20 text-white"
						}`}
					>
						3. Review
					</div>
					<div
						className={`px-6 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-md ${
							currentStep === "complete"
								? "bg-white text-secondary-500 transform scale-105 shadow-lg"
								: "bg-white bg-opacity-20 text-white"
						}`}
					>
						4. Complete
					</div>
				</div>

				<div className="bg-white rounded-2xl p-8 shadow-2xl min-h-96">
					{currentStep === "selectBase" && (
						<>
							<FileSelector
								title="Select Base Configuration"
								onFileSelect={handleBaseFileSelect}
								selectedFile={baseFileName}
							/>
							{baseConfig && (
								<>
									<div className="py-6">
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
									<div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6 gap-4">
										<input
											type="button"
											onClick={handleReselectBase}
											className="bg-gray-100 text-gray-600 border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:-translate-y-0.5"
											value="ファイルを選び直す"
										/>
										<input
											type="button"
											onClick={handleProceedToMapping}
											className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
											value="次に進む"
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
								onMappingComplete={handleMappingComplete}
								onBack={() => setCurrentStep("selectBase")}
							/>
						)}

					{currentStep === "review" && baseConfig && (
						<ReviewSummary
							baseConfig={baseConfig}
							mappings={mappings}
							concatenatedConfigs={concatenatedConfigs}
							onConfirm={handleSaveConfiguration}
							onBack={() => setCurrentStep("configureMappings")}
						/>
					)}

					{currentStep === "complete" && (
						<div className="text-center py-12">
							<h2 className="text-green-500 mb-4 text-3xl font-bold">
								✅ Configuration Saved Successfully!
							</h2>
							<p className="text-gray-600 mb-8 text-lg">
								Your merged configuration has been saved.
							</p>
							<input
								type="button"
								onClick={resetApp}
								className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
								value="Create Another Configuration"
							/>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}

export default App
