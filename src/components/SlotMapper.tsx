import { useState, useMemo } from "react"
import type { LEDConfiguration, MergeMapping, SlotFile } from "../types"
import { LEDPreview } from "./LEDPreview"
import { FileSelectButton } from "./FileSelectButton"
import {
	concatenateSlotFrames,
	validateAllSlots,
	type ConcatenatedLEDConfig,
} from "../utils/frameUtils"

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
		fileInfo: any,
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
			<h2 className="mb-2 text-gray-800 text-2xl font-semibold">
				Configure Custom LED Pages
			</h2>
			<p className="mb-6 text-gray-600 italic">
				Add configuration files for each LED slot.
			</p>

			{/* LED Slot Selection */}
			<div className="mb-8">
				{[5, 6, 7].map((slotNumber) => {
					const files = slotFiles[slotNumber]

					return (
						<div
							key={slotNumber}
							className="border border-gray-200 rounded-lg p-4 mb-4 transition-shadow duration-200 hover:shadow-md"
						>
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-primary-500 m-0 text-lg font-semibold">
									LED {slotNumber - 4}
								</h3>
							</div>

							<div className="mb-4">
								{files.map((file, index) => (
									<div
										key={index}
										className="flex items-center gap-2 p-2 border border-gray-200 rounded mb-2 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
									>
										<span className="flex-1 text-sm text-gray-800">
											{file.fileInfo.name}
										</span>
										<select
											value={file.sourceLED}
											onChange={(e) =>
												handleSourceLEDChange(
													slotNumber,
													index,
													Number(e.target.value)
												)
											}
											className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
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
													index
												)
											}
											className="bg-red-500 text-white border-none rounded w-6 h-6 cursor-pointer text-lg leading-none p-0 transition-colors duration-200 hover:bg-red-600"
											value="×"
										/>
									</div>
								))}

								<FileSelectButton
									onFileSelect={(fileInfo, config) =>
										handleAddFileToSlot(
											slotNumber,
											fileInfo,
											config
										)
									}
									title={`Add configuration file for LED ${slotNumber - 4}`}
									className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none rounded px-4 py-2 text-sm cursor-pointer transition-transform duration-200 w-full mt-2 hover:-translate-y-0.5 hover:shadow-md"
								>
									+ Add File
								</FileSelectButton>
							</div>

							<div className="mt-4 pt-4 border-t border-gray-200">
								<div className="mb-4">
									<LEDPreview
										config={concatenatedConfigs[slotNumber]}
										selectedPage={
											concatenatedConfigs[slotNumber]
												.page_data[0]?.page_index ||
											slotNumber
										}
										displayName="Preview"
									/>
									{concatenatedConfigs[slotNumber]
										.warning && (
										<div className="text-orange-600 text-sm mt-2 p-2 bg-orange-50 rounded border-l-3 border-orange-600">
											⚠️{" "}
											{
												concatenatedConfigs[slotNumber]
													.warning
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
					className="bg-gray-100 text-gray-600 border-none px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-200"
					value="Back"
				/>
				<input
					type="button"
					onClick={handleComplete}
					className={`px-6 py-3 text-base rounded-lg cursor-pointer transition-all duration-200 border-none ${
						!isAllValid
							? "bg-gray-300 text-gray-500 cursor-not-allowed"
							: "bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:-translate-y-1 hover:shadow-lg"
					}`}
					value="Continue to Review"
					disabled={!isAllValid}
				/>
			</div>
		</div>
	)
}
