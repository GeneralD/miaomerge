import type { FileInfo } from "../types"
import { FileSelectButton } from "./FileSelectButton"

interface FileSelectorProps {
	onFileSelect: (file: FileInfo, content?: string) => void
	title: string
	multiple?: boolean
	selectedFile?: string | null
}

export function FileSelector({
	onFileSelect,
	title,
	selectedFile,
}: FileSelectorProps) {
	return (
		<div className="text-center p-8 mb-6">
			<h3 className="mb-6 text-gray-800 text-xl font-semibold">
				{title}
			</h3>
			{!selectedFile ? (
				<FileSelectButton
					onFileSelect={(fileInfo, _config, content) =>
						onFileSelect(fileInfo, content)
					}
					title={title}
					className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none px-8 py-4 text-lg rounded-lg cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
					loadConfig={false}
				>
					Select JSON File
				</FileSelectButton>
			) : (
				<div className="mt-4">
					<p className="mt-4 p-3 bg-gray-100 rounded-lg text-gray-600">
						Selected: {selectedFile}
					</p>
				</div>
			)}
		</div>
	)
}
