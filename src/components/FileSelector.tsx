import { open } from "@tauri-apps/plugin-dialog";
import { useRef } from "react";
import type { FileInfo } from "../types";
import { isTauri } from "../utils/platform";

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTauriFileSelect = async () => {
        console.log("handleTauriFileSelect called");
        try {
            const selected = await open({
                multiple,
                filters: [
                    {
                        name: "JSON",
                        extensions: ["json"],
                    },
                ],
                title,
            });

            console.log("Tauri file selected:", selected);
            if (selected) {
                const path = Array.isArray(selected) ? selected[0] : selected;
                const name = path.split("/").pop() || path;
                console.log("Calling onFileSelect with:", { name, path });
                onFileSelect({ name, path });
            }
        } catch (error) {
            console.error("Error selecting file:", error);
        }
    };

    const handleWebFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        console.log("handleWebFileSelect called");
        const file = event.target.files?.[0];
        console.log("Web file selected:", file?.name);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                console.log(
                    "Calling onFileSelect with:",
                    { name: file.name, path: file.name },
                    "content length:",
                    content.length
                );
                onFileSelect({ name: file.name, path: file.name }, content);
            };
            reader.readAsText(file);
        }
    };

    const handleSelectFile = () => {
        console.log("handleSelectFile called, isTauri:", isTauri());
        if (isTauri()) {
            handleTauriFileSelect();
        } else {
            console.log(
                "Clicking file input, element exists:",
                !!fileInputRef.current
            );
            // Reset file input value to allow selecting the same file again
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="file-selector">
            <h3>{title}</h3>
            {!isTauri() && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleWebFileSelect}
                    style={{ display: "none" }}
                />
            )}
            {!selectedFile ? (
                <input
                    type="button"
                    onClick={handleSelectFile}
                    className="select-button"
                    value="Select JSON File"
                />
            ) : (
                <div className="file-selected">
                    <p className="selected-file">Selected: {selectedFile}</p>
                </div>
            )}
        </div>
    );
}
