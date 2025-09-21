import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import type {
	FileInfo,
	LEDConfiguration,
	MergeMapping,
	SlotFile,
} from "../types"
import {
	type ConcatenatedLEDConfig,
	concatenateSlotFrames,
	validateAllSlots,
} from "../utils/frameUtils"
import { FileSelectButton } from "./FileSelectButton"
import { LEDPreview } from "./LEDPreview"

interface SlotMapperProps {
	baseConfig: LEDConfiguration
	baseFileName: string
	onMappingComplete: (
		mappings: MergeMapping[],
		concatenatedConfigs: { [key: number]: ConcatenatedLEDConfig }
	) => void
	onBack: () => void
}

interface SlotFiles {
	[key: number]: SlotFile[] // key is LED slot (5, 6, or 7)
}

export function SlotMapper({
	baseConfig,
	baseFileName,
	onMappingComplete,
	onBack,
}: SlotMapperProps) {
	const { t } = useTranslation()
	// Initialize with base file - each LED slot gets its corresponding LED
	const [slotFiles, setSlotFiles] = useState<SlotFiles>({
		5: [
			{
				fileInfo: { name: baseFileName, path: "" },
				config: baseConfig,
				sourceLED: 5,
			},
		],
		6: [
			{
				fileInfo: { name: baseFileName, path: "" },
				config: baseConfig,
				sourceLED: 6,
			},
		],
		7: [
			{
				fileInfo: { name: baseFileName, path: "" },
				config: baseConfig,
				sourceLED: 7,
			},
		],
	})

	const handleAddFileToSlot = (
		slotNumber: number,
		fileInfo: FileInfo,
		config: LEDConfiguration
	) => {
		// Add file to the specific slot with LED 1 as default
		const newFile: SlotFile = {
			fileInfo,
			config,
			sourceLED: 5, // Default to LED 1 from the source file
		}

		setSlotFiles((prev) => ({
			...prev,
			[slotNumber]: [...prev[slotNumber], newFile],
		}))
	}

	const handleRemoveFileFromSlot = (
		slotNumber: number,
		fileIndex: number
	) => {
		setSlotFiles((prev) => ({
			...prev,
			[slotNumber]: prev[slotNumber].filter((_, i) => i !== fileIndex),
		}))
	}

	const handleSourceLEDChange = (
		slotNumber: number,
		fileIndex: number,
		newSourceLED: number
	) => {
		setSlotFiles((prev) => ({
			...prev,
			[slotNumber]: prev[slotNumber].map((file, i) =>
				i === fileIndex ? { ...file, sourceLED: newSourceLED } : file
			),
		}))
	}

	// Real-time validation
	const isAllValid = useMemo(() => {
		return validateAllSlots(slotFiles)
	}, [slotFiles])

	// Get concatenated configurations for each slot
	const concatenatedConfigs = useMemo(() => {
		return {
			5: concatenateSlotFrames(slotFiles[5]),
			6: concatenateSlotFrames(slotFiles[6]),
			7: concatenateSlotFrames(slotFiles[7]),
		}
	}, [slotFiles])

	const handleComplete = () => {
		if (!isAllValid) {
			return // Prevent navigation if validation fails
		}
		const mappings: MergeMapping[] = []

		// Use all files from all slots for the final configuration
		;[5, 6, 7].forEach((slotNumber) => {
			// For now, just use the first file in each slot (could be enhanced to merge multiple)
			if (slotFiles[slotNumber].length > 0) {
				const file = slotFiles[slotNumber][0]
				mappings.push({
					slot: slotNumber,
					sourceFile: file.fileInfo.path || undefined,
					sourceSlot: file.sourceLED,
				})
			}
		})

		onMappingComplete(mappings, concatenatedConfigs)
	}

	return (
		<div>
			<h2 className="mb-4 text-white text-2xl font-semibold">
				Configure Custom LED Pages
			</h2>
			<p className="mb-2 text-green-100">{t("slotMapper.description")}</p>
			<p className="mb-6 text-green-200 text-sm">
				{t("slotMapper.frameLimit")}
			</p>

			{/* LED Slot Selection */}
			<div className="mb-8">
				{[5, 6, 7].map((slotNumber) => {
					const files = slotFiles[slotNumber]

					return (
						<div
							key={slotNumber}
							className="border border-green-400/30 rounded-lg p-4 mb-4 transition-shadow duration-200 hover:shadow-md"
						>
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-green-400 m-0 text-lg font-semibold">
									{t("ledSlot.ledTitle", {
										number: slotNumber - 4,
									})}
								</h3>
							</div>

							<div className="mb-4">
								{files.map((file, fileIndex) => (
									<div
										key={`${file.fileInfo.path}-${file.sourceLED}`}
										className="flex items-center gap-2 p-2 border border-green-400/30 rounded mb-2 backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-colors duration-200"
									>
										<span className="flex-1 text-sm text-white">
											{file.fileInfo.name}
										</span>
										<select
											value={file.sourceLED}
											onChange={(e) =>
												handleSourceLEDChange(
													slotNumber,
													fileIndex,
													Number(e.target.value)
												)
											}
											className="px-2 py-1 border border-green-400/30 rounded text-xs backdrop-blur-sm bg-white/10 text-green-100"
										>
											<option value={5}>LED 1</option>
											<option value={6}>LED 2</option>
											<option value={7}>LED 3</option>
										</select>
										<input
											type="button"
											onClick={() =>
												handleRemoveFileFromSlot(
													slotNumber,
													fileIndex
												)
											}
											className="bg-red-500 text-white border-none rounded w-6 h-6 cursor-pointer text-lg leading-none p-0 transition-colors duration-200 hover:bg-red-600"
											value="×"
										/>
									</div>
								))}

								<FileSelectButton
									onFileSelect={(fileInfo, config) => {
										if (config) {
											handleAddFileToSlot(
												slotNumber,
												fileInfo,
												config
											)
										}
									}}
									title={t("slotMapper.addFileFor", {
										ledNumber: slotNumber - 4,
									})}
									className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none rounded px-4 py-2 text-sm cursor-pointer transition-transform duration-200 w-full mt-2 hover:-translate-y-0.5 hover:shadow-md"
								>
									{t("buttons.addFile")}
								</FileSelectButton>
							</div>

							<div className="mt-4 pt-4 border-t border-gray-200">
								<div className="mb-4">
									<LEDPreview
										config={
											concatenatedConfigs[
												slotNumber as keyof typeof concatenatedConfigs
											]
										}
										selectedPage={
											concatenatedConfigs[
												slotNumber as keyof typeof concatenatedConfigs
											].page_data[0]?.page_index ||
											slotNumber
										}
										slot={slotNumber - 4}
									/>
									{concatenatedConfigs[
										slotNumber as keyof typeof concatenatedConfigs
									].warning && (
										<div className="text-orange-600 text-sm mt-2 p-2 bg-orange-50 rounded border-l-3 border-orange-600">
											⚠️{" "}
											{
												concatenatedConfigs[
													slotNumber as keyof typeof concatenatedConfigs
												].warning
											}
										</div>
									)}
								</div>
							</div>
						</div>
					)
				})}
			</div>

			<div className="flex justify-between gap-4 mt-8">
				<input
					type="button"
					onClick={onBack}
					className="backdrop-blur-sm bg-white/10 text-white border border-white/30 px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/20"
					value={t("buttons.back")}
				/>
				<input
					type="button"
					onClick={handleComplete}
					className={`px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 border-none ${
						!isAllValid
							? "backdrop-blur-sm bg-black/20 text-gray-400 cursor-not-allowed border border-gray-500"
							: "bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:-translate-y-1 hover:shadow-lg"
					}`}
					value={t("buttons.continueToReview")}
					disabled={!isAllValid}
				/>
			</div>
		</div>
	)
}
