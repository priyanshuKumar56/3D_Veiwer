import { useRef, useState, useCallback } from 'react';
import { Upload, FileBox } from 'lucide-react';

export default function UploadZone({ onFileSelect, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div
      id="upload-zone"
      className={`upload-zone ${dragging ? 'dragging' : ''}`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ pointerEvents: disabled ? 'none' : 'auto', opacity: disabled ? 0.5 : 1 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div
          className="animate-float"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {dragging ? (
            <FileBox size={32} color="#3b82f6" />
          ) : (
            <Upload size={32} color="#3b82f6" />
          )}
        </div>

        <div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#e8e8ed', marginBottom: '4px' }}>
            {dragging ? 'Drop your file here' : 'Drop your GLB file here'}
          </p>
          <p style={{ fontSize: '13px', color: '#6b6b80' }}>
            or <span style={{ color: '#3b82f6', fontWeight: 500 }}>click to browse</span>
          </p>
        </div>

        <p style={{
          fontSize: '11px',
          color: '#4a4a5c',
          padding: '4px 12px',
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.03)',
        }}>
          Supported: .glb, .gltf • Max 50MB
        </p>
      </div>
    </div>
  );
}
