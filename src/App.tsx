import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { useState } from "react";
import "./App.css";
import { FileSelector } from "./components/FileSelector";
import { LEDPreview } from "./components/LEDPreview";
import { ReviewSummary } from "./components/ReviewSummary";
import { SlotMapper } from "./components/SlotMapper";
import type {
    FileInfo,
    LEDConfiguration,
    MergeMapping,
    MergeStep,
} from "./types";
import { isTauri } from "./utils/platform";

function App() {
    const [currentStep, setCurrentStep] = useState<MergeStep>("selectBase");
    const [baseConfig, setBaseConfig] = useState<LEDConfiguration | null>(null);
    const [baseFileName, setBaseFileName] = useState<string | null>(null);
    const [additionalFiles, setAdditionalFiles] = useState<FileInfo[]>([]);
    const [mappings, setMappings] = useState<MergeMapping[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBaseFileSelect = async (file: FileInfo, content?: string) => {
        console.log(
            "handleBaseFileSelect called with:",
            file,
            "content length:",
            content?.length
        );
        try {
            setIsLoading(true);
            setError(null);

            let config: LEDConfiguration;

            if (isTauri()) {
                // Load the configuration from the backend (Tauri)
                config = await invoke<LEDConfiguration>("load_config", {
                    path: file.path,
                });
            } else {
                // Parse the JSON content directly (Web)
                if (!content) {
                    throw new Error("No file content provided for web version");
                }
                config = JSON.parse(content);
            }

            console.log("Setting baseConfig:", config);
            console.log("Setting baseFileName:", file.name);
            setBaseConfig(config);
            setBaseFileName(file.name);
        } catch (err) {
            console.error("App - Error loading config:", err);
            setError(`Failed to load configuration: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProceedToMapping = () => {
        setCurrentStep("configureMappings");
    };

    const handleReselectBase = () => {
        console.log("handleReselectBase called - resetting state");
        setBaseConfig(null);
        setBaseFileName(null);
    };

    const handleMappingComplete = (newMappings: MergeMapping[]) => {
        // Create mappings for all pages, but only edit custom pages (5, 6, 7)
        const allMappings =
            baseConfig?.page_data.map((page) => {
                const editMapping = newMappings.find(
                    (m) => m.slot === page.page_index
                );
                return (
                    editMapping || {
                        slot: page.page_index,
                        action: "keep" as const,
                    }
                );
            }) || [];

        setMappings(allMappings);
        setCurrentStep("review");
    };

    const handleSaveConfiguration = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let mergedConfig: LEDConfiguration;

            if (isTauri()) {
                // Merge configurations on the backend (Tauri)
                mergedConfig = await invoke<LEDConfiguration>("merge_configs", {
                    baseConfig,
                    mappings,
                });

                // Save the merged configuration using Tauri
                const savePath = await save({
                    filters: [
                        {
                            name: "JSON",
                            extensions: ["json"],
                        },
                    ],
                    defaultPath: `merged_${new Date().toISOString().slice(0, 10)}.json`,
                });

                if (savePath) {
                    await writeTextFile(
                        savePath,
                        JSON.stringify(mergedConfig, null, 2)
                    );
                    setCurrentStep("complete");
                }
            } else {
                // Simple merge for web version (keep original for now)
                mergedConfig = baseConfig!;

                // Download the file using web APIs
                const blob = new Blob([JSON.stringify(mergedConfig, null, 2)], {
                    type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `merged_${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                setCurrentStep("complete");
            }
        } catch (err) {
            setError(`Failed to save configuration: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const resetApp = () => {
        setCurrentStep("selectBase");
        setBaseConfig(null);
        setBaseFileName(null);
        setAdditionalFiles([]);
        setMappings([]);
        setError(null);
    };

    return (
        <main className="container">
            <header className="app-header">
                <h1>🎮 Cyberboard Config Merger</h1>
                <p>Merge and customize your CYBERBOARD R4 LED configurations</p>
            </header>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <input
                        type="button"
                        onClick={() => setError(null)}
                        value="Dismiss"
                    />
                </div>
            )}

            {isLoading && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Processing...</p>
                </div>
            )}

            <div className="step-indicator">
                <div
                    className={`step ${currentStep === "selectBase" ? "active" : ""}`}
                >
                    1. Select Base
                </div>
                <div
                    className={`step ${currentStep === "configureMappings" ? "active" : ""}`}
                >
                    2. Configure Mappings
                </div>
                <div
                    className={`step ${currentStep === "review" ? "active" : ""}`}
                >
                    3. Review
                </div>
                <div
                    className={`step ${currentStep === "complete" ? "active" : ""}`}
                >
                    4. Complete
                </div>
            </div>

            <div className="content">
                {currentStep === "selectBase" && (
                    <>
                        <FileSelector
                            title="Select Base Configuration"
                            onFileSelect={handleBaseFileSelect}
                            selectedFile={baseFileName}
                        />
                        {(() => {
                            console.log(
                                "Rendering - baseConfig exists:",
                                !!baseConfig,
                                "baseFileName:",
                                baseFileName
                            );
                            return (
                                baseConfig && (
                                    <>
                                        <div className="preview-section">
                                            <LEDPreview
                                                config={baseConfig}
                                                selectedPage={5}
                                                displayName="LED 1 Preview"
                                            />
                                            <LEDPreview
                                                config={baseConfig}
                                                selectedPage={6}
                                                displayName="LED 2 Preview"
                                            />
                                            <LEDPreview
                                                config={baseConfig}
                                                selectedPage={7}
                                                displayName="LED 3 Preview"
                                            />
                                        </div>
                                        <div className="step-navigation">
                                            <input
                                                type="button"
                                                onClick={handleReselectBase}
                                                className="reselect-button"
                                                value="ファイルを選び直す"
                                            />
                                            <input
                                                type="button"
                                                onClick={handleProceedToMapping}
                                                className="continue-button"
                                                value="次に進む"
                                            />
                                        </div>
                                    </>
                                )
                            );
                        })()}
                    </>
                )}

                {currentStep === "configureMappings" && baseConfig && (
                    <SlotMapper
                        baseConfig={baseConfig}
                        onMappingComplete={handleMappingComplete}
                        onBack={() => setCurrentStep("selectBase")}
                    />
                )}

                {currentStep === "review" && baseConfig && (
                    <ReviewSummary
                        baseConfig={baseConfig}
                        mappings={mappings}
                        onConfirm={handleSaveConfiguration}
                        onBack={() => setCurrentStep("configureMappings")}
                    />
                )}

                {currentStep === "complete" && (
                    <div className="completion-message">
                        <h2>✅ Configuration Saved Successfully!</h2>
                        <p>Your merged configuration has been saved.</p>
                        <input
                            type="button"
                            onClick={resetApp}
                            className="restart-button"
                            value="Create Another Configuration"
                        />
                    </div>
                )}
            </div>
        </main>
    );
}

export default App;
