import { useState } from 'react';
import { MergeMapping, LEDConfiguration, FileInfo } from '../types';

interface SlotMapperProps {
  baseConfig: LEDConfiguration;
  availableFiles: FileInfo[];
  onMappingComplete: (mappings: MergeMapping[]) => void;
  onBack: () => void;
}

export function SlotMapper({ 
  baseConfig, 
  availableFiles, 
  onMappingComplete,
  onBack 
}: SlotMapperProps) {
  const [mappings, setMappings] = useState<MergeMapping[]>(
    baseConfig.pages.map(page => ({
      slot: page.slot,
      action: 'keep' as const
    }))
  );

  const updateMapping = (slot: number, update: Partial<MergeMapping>) => {
    setMappings(prev => prev.map(m => 
      m.slot === slot ? { ...m, ...update } : m
    ));
  };

  const handleComplete = () => {
    onMappingComplete(mappings);
  };

  return (
    <div className="slot-mapper">
      <h2>Configure LED Slot Mappings</h2>
      <div className="mappings-container">
        {baseConfig.pages.map((page, index) => (
          <div key={page.slot} className="mapping-item">
            <div className="slot-header">
              <h3>Slot {page.slot}</h3>
              <span className="frame-count">{page.frames.length} frames</span>
            </div>
            
            <div className="action-selector">
              <label>
                <input
                  type="radio"
                  name={`action-${page.slot}`}
                  value="keep"
                  checked={mappings[index]?.action === 'keep'}
                  onChange={() => updateMapping(page.slot, { action: 'keep' })}
                />
                Keep Original
              </label>
              
              <label>
                <input
                  type="radio"
                  name={`action-${page.slot}`}
                  value="replace"
                  checked={mappings[index]?.action === 'replace'}
                  onChange={() => updateMapping(page.slot, { action: 'replace' })}
                />
                Replace with Another File
              </label>
              
              <label>
                <input
                  type="radio"
                  name={`action-${page.slot}`}
                  value="combine"
                  checked={mappings[index]?.action === 'combine'}
                  onChange={() => updateMapping(page.slot, { action: 'combine' })}
                />
                Combine with Another File
              </label>
            </div>

            {(mappings[index]?.action === 'replace' || mappings[index]?.action === 'combine') && (
              <div className="file-selection">
                <select
                  value={mappings[index]?.sourceFile || ''}
                  onChange={(e) => updateMapping(page.slot, { sourceFile: e.target.value })}
                >
                  <option value="">Select a file...</option>
                  {availableFiles.map(file => (
                    <option key={file.path} value={file.path}>
                      {file.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="actions">
        <button onClick={onBack} className="back-button">Back</button>
        <button onClick={handleComplete} className="continue-button">Continue to Review</button>
      </div>
    </div>
  );
}