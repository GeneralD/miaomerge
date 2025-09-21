import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import { useRef } from "react"
import type { FileInfo, LEDConfiguration } from "../types"
import { isTauri } from "../utils/platform"

interface FileSelectButtonProps {
	onFileSelect: (
		fileInfo: FileInfo,
		config?: LEDConfiguration,
		content?: string
	) => void
	title?: string
	className?: string
	children: React.ReactNode
	loadConfig?: boolean // Whether to load and parse LED configuration
}

export function FileSelectButton({
	onFileSelect,
	title = "Select JSON File",
	className = "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none rounded px-4 py-2 text-sm cursor-pointer transition-transform duration-200 w-full mt-2 hover:-translate-y-0.5 hover:shadow-md",
	children,
	loadConfig = true,
}: FileSelectButtonProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleTauriFileSelect = async () => {
		try {
			const selected = await open({
				multiple: false,
				filters: [
					{
						name: "JSON",
						extensions: ["json"],
					},
				],
				title,
			})

			if (selected && typeof selected === "string") {
				const name = selected.split("/").pop() || selected
				const fileInfo = { name, path: selected }

				if (loadConfig) {
					// Load the configuration
					const config = await invoke<LEDConfiguration>(
						"load_config",
						{
							path: selected,
						}
					)
					onFileSelect(fileInfo, config)
				} else {
					onFileSelect(fileInfo)
				}
			}
		} catch (error) {
			console.error("Error selecting file:", error)
		}
	}

	const handleWebFileSelect = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0]
		if (file) {
			const reader = new FileReader()
			reader.onload = (e) => {
				try {
					const content = e.target?.result as string
					const fileInfo = { name: file.name, path: file.name }

					if (loadConfig) {
						const config = JSON.parse(content)
						onFileSelect(fileInfo, config)
					} else {
						onFileSelect(fileInfo, undefined, content)
					}
				} catch (error) {
					console.error("Error parsing JSON:", error)
				}
			}
			reader.readAsText(file)
		}
	}

	const handleClick = () => {
		if (isTauri()) {
			handleTauriFileSelect()
		} else {
			// Reset file input value to allow selecting the same file again
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
			fileInputRef.current?.click()
		}
	}

	return (
		<>
			{!isTauri() && (
				<input
					ref={fileInputRef}
					type="file"
					accept=".json"
					onChange={handleWebFileSelect}
					style={{ display: "none" }}
				/>
			)}
			<input
				type="button"
				onClick={handleClick}
				className={className}
				value={children as string}
			/>
		</>
	)
}
