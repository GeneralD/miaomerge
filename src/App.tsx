import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import './App.css';
import { FileSelector } from './components/FileSelector';
import { SlotMapper } from './components/SlotMapper';
import { ReviewSummary } from './components/ReviewSummary';
import { LEDConfiguration, FileInfo, MergeMapping, MergeStep } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState<MergeStep>('selectBase');
  const [baseConfig, setBaseConfig] = useState<LEDConfiguration | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<FileInfo[]>([]);
  const [mappings, setMappings] = useState<MergeMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBaseFileSelect = async (file: FileInfo) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load the configuration from the backend
      const config = await invoke<LEDConfiguration>('load_config', { path: file.path });
      
      setBaseConfig(config);
      setCurrentStep('configureMappings');
    } catch (err) {
      setError(`Failed to load configuration: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingComplete = (newMappings: MergeMapping[]) => {
    setMappings(newMappings);
    setCurrentStep('review');
  };

  const handleSaveConfiguration = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Merge configurations on the backend
      const mergedConfig = await invoke<LEDConfiguration>('merge_configs', {
        baseConfig,
        mappings
      });

      // Save the merged configuration
      const savePath = await save({
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }],
        defaultPath: `merged_${new Date().toISOString().slice(0, 10)}.json`
      });

      if (savePath) {
        await writeTextFile(savePath, JSON.stringify(mergedConfig, null, 2));
        setCurrentStep('complete');
      }
    } catch (err) {
      setError(`Failed to save configuration: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setCurrentStep('selectBase');
    setBaseConfig(null);
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
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}

      <div className="step-indicator">
        <div className={`step ${currentStep === 'selectBase' ? 'active' : ''}`}>
          1. Select Base
        </div>
        <div className={`step ${currentStep === 'configureMappings' ? 'active' : ''}`}>
          2. Configure Mappings
        </div>
        <div className={`step ${currentStep === 'review' ? 'active' : ''}`}>
          3. Review
        </div>
        <div className={`step ${currentStep === 'complete' ? 'active' : ''}`}>
          4. Complete
        </div>
      </div>

      <div className="content">
        {currentStep === 'selectBase' && (
          <FileSelector
            title="Select Base Configuration"
            onFileSelect={handleBaseFileSelect}
          />
        )}

        {currentStep === 'configureMappings' && baseConfig && (
          <SlotMapper
            baseConfig={baseConfig}
            availableFiles={additionalFiles}
            onMappingComplete={handleMappingComplete}
            onBack={() => setCurrentStep('selectBase')}
          />
        )}

        {currentStep === 'review' && baseConfig && (
          <ReviewSummary
            baseConfig={baseConfig}
            mappings={mappings}
            onConfirm={handleSaveConfiguration}
            onBack={() => setCurrentStep('configureMappings')}
          />
        )}

        {currentStep === 'complete' && (
          <div className="completion-message">
            <h2>✅ Configuration Saved Successfully!</h2>
            <p>Your merged configuration has been saved.</p>
            <button onClick={resetApp} className="restart-button">
              Create Another Configuration
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;