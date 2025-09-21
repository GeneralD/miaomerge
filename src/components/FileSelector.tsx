import type { FileInfo, LEDConfiguration } from "../types";
import { FileSelectButton } from "./FileSelectButton";

interface FileSelectorProps {
    onFileSelect: (file: FileInfo, content?: string) => void;
    title: string;
    multiple?: boolean;
    selectedFile?: string | null;
}

export function FileSelector({
    onFileSelect,
    title,
    multiple = false,
    selectedFile,
}: FileSelectorProps) {
    const handleFileSelect = (
        fileInfo: FileInfo,
        config?: LEDConfiguration,
        content?: string
    ) => {
        onFileSelect(fileInfo, content);
    };

    return (
        <div className="file-selector">
            <h3>{title}</h3>
            {!selectedFile ? (
                <FileSelectButton
                    onFileSelect={handleFileSelect}
                    title={title}
                    className="select-button"
                    loadConfig={false}
                >
                    Select JSON File
                </FileSelectButton>
            ) : (
                <div className="file-selected">
                    <p className="selected-file">Selected: {selectedFile}</p>
                </div>
            )}
        </div>
    );
}
