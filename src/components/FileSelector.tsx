import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { FileInfo } from '../types';

interface FileSelectorProps {
  onFileSelect: (file: FileInfo) => void;
  title: string;
  multiple?: boolean;
}

export function FileSelector({ onFileSelect, title, multiple = false }: FileSelectorProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }],
        title
      });

      if (selected) {
        const path = Array.isArray(selected) ? selected[0] : selected;
        const name = path.split('/').pop() || path;
        setSelectedFile(name);
        onFileSelect({ name, path });
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  return (
    <div className="file-selector">
      <h3>{title}</h3>
      <button onClick={handleSelectFile} className="select-button">
        Select JSON File
      </button>
      {selectedFile && (
        <p className="selected-file">Selected: {selectedFile}</p>
      )}
    </div>
  );
}