import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import type { LEDConfiguration } from "../types"

interface LEDPreviewProps {
	config: LEDConfiguration | null
	selectedPage?: number
	className?: string
	slot?: number
}

const LED_ROWS = 5
const LED_COLS = 40
const TOTAL_LEDS = LED_ROWS * LED_COLS

export function LEDPreview({
	config,
	selectedPage = 5,
	className = "",
	slot,
}: LEDPreviewProps) {
	const { t } = useTranslation()
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
			className={`backdrop-blur-sm bg-black/10 border border-green-400/30 rounded-lg p-4 my-4 ${className}`}
		>
			<div className="flex justify-between items-center mb-2">
				<h4 className="text-green-400 m-0 text-base font-medium">
					{slot
						? t("ledPreview.ledPreview", { number: slot })
						: `LED Preview - Page ${selectedPage}`}
				</h4>
				<span className="text-green-200 text-sm">{getFrameInfo()}</span>
			</div>
			<div className="grid grid-cols-led grid-rows-led bg-black p-[0.8%] max-w-full overflow-hidden">
				{colors.map((color, ledIndex) => (
					<div
						key={`led-${ledIndex}-${color}`}
						className="aspect-square rounded-[20%] m-[8%] transition-colors duration-200 hover:scale-110 hover:z-10 hover:relative hover:shadow-md"
						style={{ backgroundColor: color }}
						title={`LED ${ledIndex + 1}: ${color}`}
					/>
				))}
			</div>
			<div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
				<div className="flex gap-2">
					<input
						type="button"
						onClick={togglePlayPause}
						className="backdrop-blur-sm bg-white/10 border border-white/30 rounded px-2 cursor-pointer text-base transition-all duration-200 min-w-10 h-10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-0.5 text-white"
						value={isPlaying ? "⏸" : "▶"}
					/>
					<input
						type="button"
						onClick={resetToFirst}
						className="backdrop-blur-sm bg-white/10 border border-white/30 rounded px-2 cursor-pointer text-base transition-all duration-200 min-w-10 h-10 flex items-center justify-center hover:bg-white/20 hover:-translate-y-0.5 text-white"
						value="⏮"
					/>
				</div>
				<div className="flex items-center gap-2">
					<input
						type="button"
						onClick={speedDown}
						className="bg-green-500 text-white border-none rounded px-2 cursor-pointer text-sm transition-all duration-200 min-w-8 h-8 flex items-center justify-center hover:bg-green-600 hover:-translate-y-0.5"
						value="-"
					/>
					<span className="text-green-400 font-semibold text-sm min-w-12 text-center">
						{speed}Hz
					</span>
					<input
						type="button"
						onClick={speedUp}
						className="bg-green-500 text-white border-none rounded px-2 cursor-pointer text-sm transition-all duration-200 min-w-8 h-8 flex items-center justify-center hover:bg-green-600 hover:-translate-y-0.5"
						value="+"
					/>
				</div>
			</div>
		</div>
	)
}
