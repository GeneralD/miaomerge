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

		const frameData = pageData.frames.frame_data[0];

		if (!frameData || !frameData.frame_RGB) {
			return Array(TOTAL_LEDS).fill("#000000");
		}

		const colors = frameData.frame_RGB.slice(0, TOTAL_LEDS);
		while (colors.length < TOTAL_LEDS) {
			colors.push("#000000");
		}

		return colors;
	};

	const colors = getCurrentFrame();

	return (
		<div className={`led-preview ${className}`}>
			<div className="led-preview-header">
				<h4>{displayName || `LED Preview - Page ${selectedPage}`}</h4>
				<span className="led-count">{TOTAL_LEDS} LEDs</span>
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
		</div>
	);
}
