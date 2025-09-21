import type { LEDConfiguration, SlotFile, FrameData } from "../types"

export interface ConcatenatedLEDConfig extends LEDConfiguration {
	totalFrames: number
	isValid: boolean
	warning?: string
}

/**
 * Concatenate frames from multiple SlotFiles for a specific LED slot
 */
export function concatenateSlotFrames(
	files: SlotFile[]
): ConcatenatedLEDConfig {
	if (files.length === 0) {
		return {
			product_info: null,
			page_num: 0,
			page_data: [],
			totalFrames: 0,
			isValid: false,
			warning: "No configuration files selected",
		}
	}

	// Use the first file as the base configuration
	const baseFile = files[0]
	const basePageData = baseFile.config.page_data.find(
		(page) => page.page_index === baseFile.sourceLED
	)

	if (!basePageData) {
		return {
			...baseFile.config,
			totalFrames: 0,
			isValid: false,
			warning: "Invalid base configuration",
		}
	}

	// Start with base page frames
	let concatenatedFrames: FrameData[] = [
		...(basePageData.frames.frame_data || []),
	]

	// Concatenate frames from additional files
	for (let i = 1; i < files.length; i++) {
		const file = files[i]
		const pageData = file.config.page_data.find(
			(page) => page.page_index === file.sourceLED
		)

		if (pageData && pageData.frames.frame_data) {
			// Reindex frames to continue from the last frame index
			const reindexedFrames = pageData.frames.frame_data.map(
				(frame, index) => ({
					...frame,
					frame_index: concatenatedFrames.length + index,
				})
			)
			concatenatedFrames.push(...reindexedFrames)
		}
	}

	const totalFrames = concatenatedFrames.length
	const isValid = totalFrames >= 1 && totalFrames <= 300
	let warning: string | undefined

	if (totalFrames === 0) {
		warning = "No frames found in configuration"
	} else if (totalFrames > 300) {
		warning = `Frame count (${totalFrames}) exceeds maximum limit of 300`
	}

	// Create concatenated configuration
	const concatenatedPageData = {
		...basePageData,
		frames: {
			...basePageData.frames,
			frame_num: totalFrames,
			frame_data: concatenatedFrames,
		},
	}

	return {
		...baseFile.config,
		page_data: [concatenatedPageData],
		totalFrames,
		isValid,
		warning,
	}
}

/**
 * Validate all LED slots
 */
export function validateAllSlots(slotFiles: {
	[key: number]: SlotFile[]
}): boolean {
	return [5, 6, 7].every((slotNumber) => {
		const concatenated = concatenateSlotFrames(slotFiles[slotNumber])
		return concatenated.isValid
	})
}
