import { useState, useMemo } from "react"
import type { LEDConfiguration, MergeMapping, SlotFile } from "../types"
import { LEDPreview } from "./LEDPreview"
import { FileSelectButton } from "./FileSelectButton"
import { concatenateSlotFrames, validateAllSlots, type ConcatenatedLEDConfig } from "../utils/frameUtils"

interface SlotMapperProps {
	baseConfig: LEDConfiguration
	baseFileName: string
	onMappingComplete: (mappings: MergeMapping[], concatenatedConfigs: { [key: number]: ConcatenatedLEDConfig }) => void
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
		<div className="slot-mapper">
			<h2>Configure Custom LED Pages</h2>
			<p>Add configuration files for each LED slot.</p>

			{/* LED Slot Selection */}
			<div className="led-slots-container">
				{[5, 6, 7].map((slotNumber) => {
					const files = slotFiles[slotNumber]

					return (
						<div key={slotNumber} className="led-slot-item">
							<div className="slot-header">
								<h3>LED {slotNumber - 4}</h3>
							</div>

							<div className="slot-files-list">
								{files.map((file, index) => (
									<div key={index} className="slot-file-item">
										<span className="file-name">
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
											className="source-led-select"
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
											className="remove-file-btn"
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
								>
									+ Add File
								</FileSelectButton>
							</div>

							<div className="current-preview">
								<div className="preview-item">
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
										<div className="frame-warning">
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

			<div className="actions">
				<input
					type="button"
					onClick={onBack}
					className="back-button"
					value="Back"
				/>
				<input
					type="button"
					onClick={handleComplete}
					className={`continue-button ${!isAllValid ? "disabled" : ""}`}
					value="Continue to Review"
					disabled={!isAllValid}
				/>
			</div>
		</div>
	)
}
