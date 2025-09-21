import { invoke } from "@tauri-apps/api/core"
import { save } from "@tauri-apps/plugin-dialog"
import { writeTextFile } from "@tauri-apps/plugin-fs"
import { createContext, useContext, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import type {
	FileInfo,
	LEDConfiguration,
	MergeMapping,
	MergeStep,
	SlotFile,
} from "../types"
import type { ConcatenatedLEDConfig } from "../utils/frameUtils"
import { isTauri } from "../utils/platform"

interface MergeWorkflowContextType {
	currentStep: MergeStep
	setCurrentStep: (step: MergeStep) => void
	baseConfig: LEDConfiguration | null
	baseFileName: string | null
	concatenatedConfigs: { [key: number]: ConcatenatedLEDConfig } | null
	savedSlotFiles: { [key: number]: SlotFile[] } | null
	isLoading: boolean
	error: string | null
	setError: (error: string | null) => void
	handleBaseFileSelect: (file: FileInfo, content?: string) => Promise<void>
	handleProceedToMapping: () => void
	handleReselectBase: () => void
	handleMappingComplete: (
		newMappings: MergeMapping[],
		newConcatenatedConfigs: { [key: number]: ConcatenatedLEDConfig },
		slotFiles: { [key: number]: SlotFile[] }
	) => void
	handleSaveConfiguration: () => Promise<void>
	resetApp: () => void
}

const MergeWorkflowContext = createContext<MergeWorkflowContextType | null>(
	null
)

export function MergeWorkflowProvider({ children }: { children: ReactNode }) {
	const { t } = useTranslation()
	const [currentStep, setCurrentStep] = useState<MergeStep>("selectBase")
	const [baseConfig, setBaseConfig] = useState<LEDConfiguration | null>(null)
	const [baseFileName, setBaseFileName] = useState<string | null>(null)
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
				config = await invoke<LEDConfiguration>("load_config", {
					path: file.path,
				})
			} else {
				if (!content) {
					throw new Error("No file content provided for web version")
				}
				// Parse as any to preserve all properties, then cast to LEDConfiguration
				config = JSON.parse(content) as LEDConfiguration
			}

			setBaseConfig(config)
			setBaseFileName(file.name)
		} catch (err) {
			console.error("Error loading config:", err)
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
		_newMappings: MergeMapping[],
		newConcatenatedConfigs: { [key: number]: ConcatenatedLEDConfig },
		slotFiles: { [key: number]: SlotFile[] }
	) => {
		setConcatenatedConfigs(newConcatenatedConfigs)
		setSavedSlotFiles(slotFiles)
		setCurrentStep("review")
	}

	const handleSaveConfiguration = async () => {
		console.log("DEBUG: handleSaveConfiguration called")
		console.log("DEBUG: Platform is Tauri?", isTauri())
		try {
			setIsLoading(true)
			setError(null)

			let mergedConfig: LEDConfiguration

			const timestamp = new Date()
				.toISOString()
				.replace(/:/g, "-")
				.replace(/\..+/, "")
				.replace("T", "_")
			const baseNameWithoutExt =
				baseFileName?.replace(/\.json$/i, "") || "config"
			const fileName = `${baseNameWithoutExt}_${timestamp}.json`

			if (!baseConfig) {
				throw new Error("Base configuration is missing")
			}

			if (!concatenatedConfigs) {
				console.log("DEBUG: concatenatedConfigs is null/undefined")
				console.log("DEBUG: Current step:", currentStep)
				console.log("DEBUG: Base config exists:", !!baseConfig)
				throw new Error(
					"Concatenated configurations are missing - this should not happen"
				)
			}

			console.log("DEBUG: concatenatedConfigs:", concatenatedConfigs)
			console.log(
				"DEBUG: Object.keys(concatenatedConfigs):",
				Object.keys(concatenatedConfigs)
			)

			// Start with base config to preserve Fn_key and other properties
			mergedConfig = { ...baseConfig }

			// Only update page_data for LED settings, keep everything else from base
			for (const [slotNumber, concatenatedConfig] of Object.entries(
				concatenatedConfigs
			)) {
				const slot = Number(slotNumber)
				const pageIndex = mergedConfig.page_data.findIndex(
					(page) => page.page_index === slot
				)

				if (
					pageIndex !== -1 &&
					concatenatedConfig.page_data.length > 0
				) {
					// Important: Set correct page_index before merging and only use frames data
					const sourcePageData = concatenatedConfig.page_data[0]
					const newPageData = { ...mergedConfig.page_data[pageIndex] }

					// Only replace frames data, keep other page properties from base
					newPageData.frames = sourcePageData.frames
					newPageData.page_index = slot

					mergedConfig.page_data[pageIndex] = newPageData
				}
			}

			if (isTauri()) {
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
		setConcatenatedConfigs(null)
		setSavedSlotFiles(null)
		setError(null)
	}

	const value = {
		currentStep,
		setCurrentStep,
		baseConfig,
		baseFileName,
		concatenatedConfigs,
		savedSlotFiles,
		isLoading,
		error,
		setError,
		handleBaseFileSelect,
		handleProceedToMapping,
		handleReselectBase,
		handleMappingComplete,
		handleSaveConfiguration,
		resetApp,
	}

	return (
		<MergeWorkflowContext.Provider value={value}>
			{children}
		</MergeWorkflowContext.Provider>
	)
}

export function useMergeWorkflow() {
	const context = useContext(MergeWorkflowContext)
	if (!context) {
		throw new Error(
			"useMergeWorkflow must be used within a MergeWorkflowProvider"
		)
	}
	return context
}
