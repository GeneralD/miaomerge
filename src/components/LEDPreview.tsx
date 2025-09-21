import { useState, useEffect } from "react";
import { LEDConfiguration, PageData } from "../types";

interface LEDPreviewProps {
	config: LEDConfiguration | null;
	selectedPage?: number;
	className?: string;
	displayName?: string;
}

const LED_ROWS = 5;
const LED_COLS = 40;
const TOTAL_LEDS = LED_ROWS * LED_COLS;

export function LEDPreview({
	config,
	selectedPage = 5,
	className = "",
	displayName,
}: LEDPreviewProps) {
	const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);
	const [speed, setSpeed] = useState(10); // Hz

	// Animation loop
	useEffect(() => {
		if (!isPlaying) return;

		const pageData = getPageData();
		if (!pageData || !pageData.frames.frame_data || pageData.frames.frame_data.length <= 1) {
			return;
		}

		const interval = setInterval(() => {
			setCurrentFrameIndex(prev => 
				(prev + 1) % pageData.frames.frame_data.length
			);
		}, 1000 / speed);

		return () => clearInterval(interval);
	}, [isPlaying, speed, config, selectedPage]);
	const getPageData = (): PageData | null => {
		if (!config) {
			return null;
		}

		const page = config.page_data.find(
			(page) => page.page_index === selectedPage,
		);
		return page || null;
	};

	const getCurrentFrame = (): string[] => {
		const pageData = getPageData();

		if (
			!pageData ||
			!pageData.frames.frame_data ||
			pageData.frames.frame_data.length === 0
		) {
			return Array(TOTAL_LEDS).fill("#000000");
		}

		const frameData = pageData.frames.frame_data[currentFrameIndex];

		if (!frameData || !frameData.frame_RGB) {
			return Array(TOTAL_LEDS).fill("#000000");
		}

		const colors = frameData.frame_RGB.slice(0, TOTAL_LEDS);
		while (colors.length < TOTAL_LEDS) {
			colors.push("#000000");
		}

		return colors;
	};

	const getFrameInfo = (): string => {
		const pageData = getPageData();
		
		if (
			!pageData ||
			!pageData.frames.frame_data ||
			pageData.frames.frame_data.length === 0
		) {
			return "Frame 0/0";
		}

		const totalFrames = pageData.frames.frame_data.length;
		const currentFrame = currentFrameIndex + 1; // Convert to 1-based display
		
		return `Frame ${currentFrame}/${totalFrames}`;
	};

	// Control functions
	const togglePlayPause = () => setIsPlaying(!isPlaying);
	const resetToFirst = () => setCurrentFrameIndex(0);
	const speedUp = () => setSpeed(prev => Math.min(prev + 1, 60)); // Max 60Hz
	const speedDown = () => setSpeed(prev => Math.max(prev - 1, 1)); // Min 1Hz

	const colors = getCurrentFrame();

	return (
		<div className={`led-preview ${className}`}>
			<div className="led-preview-header">
				<h4>{displayName || `LED Preview - Page ${selectedPage}`}</h4>
				<span className="frame-info">{getFrameInfo()}</span>
			</div>
			<div className="led-grid">
				{colors.map((color, index) => (
					<div
						key={index}
						className="led-dot"
						style={{ backgroundColor: color }}
						title={`LED ${index + 1}: ${color}`}
					/>
				))}
			</div>
			<div className="led-controls">
				<div className="control-group">
					<button onClick={togglePlayPause} className="control-button">
						{isPlaying ? "⏸️" : "▶️"}
					</button>
					<button onClick={resetToFirst} className="control-button">
						⏮️
					</button>
				</div>
				<div className="speed-controls">
					<button onClick={speedDown} className="speed-button">
						➖
					</button>
					<span className="speed-display">{speed}Hz</span>
					<button onClick={speedUp} className="speed-button">
						➕
					</button>
				</div>
			</div>
		</div>
	);
}
