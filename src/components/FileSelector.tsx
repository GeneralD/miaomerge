import { useTranslation } from "react-i18next"
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
	const { t } = useTranslation()

	return (
		<div className="text-center p-8 mb-6">
			<h3 className="mb-6 text-white text-xl font-semibold">{title}</h3>
			{!selectedFile ? (
				<FileSelectButton
					onFileSelect={(fileInfo, _config, content) =>
						onFileSelect(fileInfo, content)
					}
					title={title}
					className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none px-8 py-4 text-lg rounded-lg cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
					loadConfig={false}
				>
					{t("fileSelector.selectJsonFile")}
				</FileSelectButton>
			) : (
				<div className="mt-4">
					<p className="mt-4 p-3 backdrop-blur-sm bg-black/20 border border-green-400/30 rounded-lg text-green-100">
						{t("fileSelector.selected", { fileName: selectedFile })}
					</p>
				</div>
			)}
		</div>
	)
}
