import { useCallback, useEffect, useState } from "react"
import type { LEDConfiguration } from "../types"

interface LEDPreviewProps {
	config: LEDConfiguration | null
	selectedPage?: number
	className?: string
	displayName?: string
}

const LED_ROWS = 5
const LED_COLS = 40
const TOTAL_LEDS = LED_ROWS * LED_COLS

export function LEDPreview({
	config,
	selectedPage = 5,
	className = "",
	displayName,
}: LEDPreviewProps) {
	const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
	const [isPlaying, setIsPlaying] = useState(true)
	const [speed, setSpeed] = useState(10) // Hz

	const getPageData = useCallback(() => {
		if (!config) {
			return null
		}

		const page = config.page_data.find(
			(page) => page.page_index === selectedPage
		)
		return page || null
	}, [config, selectedPage])

	// Animation loop
	useEffect(() => {
		if (!isPlaying) return

		const pageData = getPageData()
		if (
			!pageData ||
			!pageData.frames.frame_data ||
			pageData.frames.frame_data.length <= 1
		) {
			return
		}

		const interval = setInterval(() => {
			setCurrentFrameIndex(
				(prev) => (prev + 1) % pageData.frames.frame_data.length
			)
		}, 1000 / speed)

		return () => clearInterval(interval)
	}, [isPlaying, speed, getPageData])

	const getCurrentFrame = useCallback(() => {
		const pageData = getPageData()

		if (
			!pageData ||
			!pageData.frames.frame_data ||
			pageData.frames.frame_data.length === 0
		) {
			return Array(TOTAL_LEDS).fill("#000000")
		}

		const frameData = pageData.frames.frame_data[currentFrameIndex]

		if (!frameData || !frameData.frame_RGB) {
			return Array(TOTAL_LEDS).fill("#000000")
		}

		const colors = frameData.frame_RGB.slice(0, TOTAL_LEDS)
		while (colors.length < TOTAL_LEDS) {
			colors.push("#000000")
		}

		return colors
	}, [currentFrameIndex, getPageData])

	const getFrameInfo = useCallback(() => {
		const pageData = getPageData()

		if (
			!pageData ||
			!pageData.frames.frame_data ||
			pageData.frames.frame_data.length === 0
		) {
			return "Frame 0/0"
		}

		const totalFrames = pageData.frames.frame_data.length
		const currentFrame = currentFrameIndex + 1 // Convert to 1-based display

		return `Frame ${currentFrame}/${totalFrames}`
	}, [currentFrameIndex, getPageData])

	// Control functions
	const togglePlayPause = () => setIsPlaying(!isPlaying)
	const resetToFirst = () => setCurrentFrameIndex(0)
	const speedUp = () => setSpeed((prev) => Math.min(prev + 1, 60)) // Max 60Hz
	const speedDown = () => setSpeed((prev) => Math.max(prev - 1, 1)) // Min 1Hz

	const colors = getCurrentFrame()

	return (
		<div
			className={`bg-gray-50 border border-gray-200 rounded-lg p-4 my-4 ${className}`}
		>
			<div className="flex justify-between items-center mb-2">
				<h4 className="text-primary-500 m-0 text-base font-medium">
					{displayName || `LED Preview - Page ${selectedPage}`}
				</h4>
				<span className="text-gray-500 text-sm">{getFrameInfo()}</span>
			</div>
			<div className="grid grid-cols-led grid-rows-led bg-black p-[0.8%] rounded-[0.8vw] max-w-full overflow-hidden">
				{colors.map((color, index) => (
					<div
						key={index}
						className="aspect-square rounded-[0.2vw] m-[8%] transition-colors duration-200 hover:scale-110 hover:z-10 hover:relative hover:shadow-md"
						style={{ backgroundColor: color }}
						title={`LED ${index + 1}: ${color}`}
					/>
				))}
			</div>
			<div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
				<div className="flex gap-2">
					<input
						type="button"
						onClick={togglePlayPause}
						className="bg-gray-100 border border-gray-200 rounded px-2 cursor-pointer text-base transition-all duration-200 min-w-10 h-10 flex items-center justify-center hover:bg-gray-200 hover:-translate-y-0.5"
						value={isPlaying ? "⏸" : "▶"}
					/>
					<input
						type="button"
						onClick={resetToFirst}
						className="bg-gray-100 border border-gray-200 rounded px-2 cursor-pointer text-base transition-all duration-200 min-w-10 h-10 flex items-center justify-center hover:bg-gray-200 hover:-translate-y-0.5"
						value="⏮"
					/>
				</div>
				<div className="flex items-center gap-2">
					<input
						type="button"
						onClick={speedDown}
						className="bg-primary-500 text-white border-none rounded px-2 cursor-pointer text-sm transition-all duration-200 min-w-8 h-8 flex items-center justify-center hover:bg-primary-600 hover:-translate-y-0.5"
						value="-"
					/>
					<span className="text-primary-500 font-semibold text-sm min-w-12 text-center">
						{speed}Hz
					</span>
					<input
						type="button"
						onClick={speedUp}
						className="bg-primary-500 text-white border-none rounded px-2 cursor-pointer text-sm transition-all duration-200 min-w-8 h-8 flex items-center justify-center hover:bg-primary-600 hover:-translate-y-0.5"
						value="+"
					/>
				</div>
			</div>
		</div>
	)
}
