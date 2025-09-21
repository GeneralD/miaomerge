import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import type { FileInfo, LEDConfiguration, MergeMapping } from "../types";
import { LEDPreview } from "./LEDPreview";

interface SlotMapperProps {
    baseConfig: LEDConfiguration;
    availableFiles: FileInfo[];
    onMappingComplete: (mappings: MergeMapping[]) => void;
    onBack: () => void;
}

export function SlotMapper({
    baseConfig,
    onMappingComplete,
    onBack,
}: SlotMapperProps) {
    // Filter to only custom LED pages (5, 6, 7)
    const editablePages = baseConfig.page_data.filter(
        (page) =>
            page.page_index === 5 ||
            page.page_index === 6 ||
            page.page_index === 7
    );

    const [mappings, setMappings] = useState<MergeMapping[]>(
        editablePages.map((page) => ({
            slot: page.page_index,
            action: "keep" as const,
        }))
    );

    const [sourceFiles, setSourceFiles] = useState<{ [key: number]: FileInfo }>(
        {}
    );
    const [sourceConfigs, setSourceConfigs] = useState<{
        [key: number]: LEDConfiguration;
    }>({});

    const updateMapping = (slot: number, update: Partial<MergeMapping>) => {
        setMappings((prev) =>
            prev.map((m) => (m.slot === slot ? { ...m, ...update } : m))
        );
    };

    const handleFileSelect = async (slot: number) => {
        try {
            const selected = await open({
                multiple: false,
                filters: [
                    {
                        name: "JSON",
                        extensions: ["json"],
                    },
                ],
                title: `Select source file for LED ${slot - 4}`,
            });

            if (selected && typeof selected === "string") {
                const name = selected.split("/").pop() || selected;
                const fileInfo = { name, path: selected };
                setSourceFiles((prev) => ({ ...prev, [slot]: fileInfo }));
                updateMapping(slot, { sourceFile: selected });

                // Load the source configuration for preview
                try {
                    const config = await invoke<LEDConfiguration>(
                        "load_config",
                        {
                            path: selected,
                        }
                    );
                    setSourceConfigs((prev) => ({ ...prev, [slot]: config }));
                } catch (err) {
                    console.error(
                        "Failed to load source config for preview:",
                        err
                    );
                }
            }
        } catch (error) {
            console.error("Error selecting file:", error);
        }
    };

    const handleComplete = () => {
        onMappingComplete(mappings);
    };

    return (
        <div className="slot-mapper">
            <h2>Configure Custom LED Pages</h2>
            <div className="mappings-container">
                {editablePages.map((page, index) => (
                    <div key={page.page_index} className="mapping-item">
                        <div className="slot-header">
                            <h3>LED {page.page_index - 4}</h3>
                            <span className="frame-count">
                                {page.frames.frame_data?.length || 0} frames
                            </span>
                        </div>

                        <div className="action-selector">
                            <label>
                                <input
                                    type="radio"
                                    name={`action-${page.page_index}`}
                                    value="keep"
                                    checked={mappings[index]?.action === "keep"}
                                    onChange={() =>
                                        updateMapping(page.page_index, {
                                            action: "keep",
                                        })
                                    }
                                />
                                Keep Original
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name={`action-${page.page_index}`}
                                    value="replace"
                                    checked={
                                        mappings[index]?.action === "replace"
                                    }
                                    onChange={() =>
                                        updateMapping(page.page_index, {
                                            action: "replace",
                                        })
                                    }
                                />
                                Replace with Another File
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name={`action-${page.page_index}`}
                                    value="combine"
                                    checked={
                                        mappings[index]?.action === "combine"
                                    }
                                    onChange={() =>
                                        updateMapping(page.page_index, {
                                            action: "combine",
                                        })
                                    }
                                />
                                Combine with Another File
                            </label>
                        </div>

                        {(mappings[index]?.action === "replace" ||
                            mappings[index]?.action === "combine") && (
                            <div className="file-selection">
                                <button
                                    onClick={() =>
                                        handleFileSelect(page.page_index)
                                    }
                                    className="select-button"
                                >
                                    {sourceFiles[page.page_index]
                                        ? `Selected: ${sourceFiles[page.page_index].name}`
                                        : "Select Source File"}
                                </button>
                                {sourceConfigs[page.page_index] && (
                                    <div className="source-preview">
                                        <h5>Source File Preview:</h5>
                                        <LEDPreview
                                            config={
                                                sourceConfigs[page.page_index]
                                            }
                                            selectedPage={page.page_index}
                                            displayName="Preview"
                                            className="compact"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="current-preview">
                            <LEDPreview
                                config={baseConfig}
                                selectedPage={page.page_index}
                                displayName="Preview"
                                className="compact"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="actions">
                <button onClick={onBack} className="back-button">
                    Back
                </button>
                <button onClick={handleComplete} className="continue-button">
                    Continue to Review
                </button>
            </div>
        </div>
    );
}
