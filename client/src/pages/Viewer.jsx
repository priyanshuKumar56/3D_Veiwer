import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Viewer3D from '../components/Viewer3D';
import ControlPanel from '../components/ControlPanel';
import Toast from '../components/Toast';
import { useSettings } from '../hooks/useSettings';
import { useUpload } from '../hooks/useUpload';

export default function ViewerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { settings, updateSetting, updateSettings, saving, saveStatus, savedAt, loaded } = useSettings();
  const { upload, uploading, error: uploadError, clearError } = useUpload();

  const [modelUrl, setModelUrl] = useState(location.state?.modelUrl || '');
  const [modelName, setModelName] = useState(location.state?.modelName || '');
  const [modelSize, setModelSize] = useState(location.state?.fileSize || 0);
  const [materialColor, setMaterialColor] = useState(null);
  const [lightColor, setLightColor] = useState(settings.lightColor || '#ffffff');
  const [toasts, setToasts] = useState([]);

  // Apply loaded settings
  useEffect(() => {
    if (loaded && settings.modelUrl && !modelUrl) {
      setModelUrl(settings.modelUrl);
      setModelName(settings.modelName || '');
    }
  }, [loaded, settings.modelUrl, settings.modelName, modelUrl]);

  // Sync light color from settings
  useEffect(() => {
    if (loaded && settings.lightColor) {
      setLightColor(settings.lightColor);
    }
  }, [loaded, settings.lightColor]);

  const addToast = useCallback((type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Handle upload from control panel
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    clearError();
    const data = await upload(file);
    if (data) {
      const url = data.url;
      setModelUrl(url);
      setModelName(data.originalName);
      setModelSize(data.fileSize);
      updateSettings({ modelUrl: url, modelName: data.originalName });
      addToast('success', `${data.originalName} loaded successfully`);
    } else {
      addToast('error', uploadError || 'Upload failed');
    }
  };

  // Handle light color change with auto-save
  const handleLightColorChange = useCallback((color) => {
    setLightColor(color);
    updateSetting('lightColor', color);
  }, [updateSetting]);

  // Handle selecting a recent model from the list
  const handleSelectModel = useCallback((model) => {
    const API = import.meta.env.VITE_API_URL || '';
    const url = `${API}${model.filePath}`;
    setModelUrl(url);
    setModelName(model.originalName);
    setModelSize(model.fileSize);
    updateSettings({ modelUrl: url, modelName: model.originalName });
    addToast('success', `Switched to ${model.originalName}`);
  }, [updateSettings, addToast]);

  // Show upload error as toast
  useEffect(() => {
    if (uploadError) {
      addToast('error', uploadError);
    }
  }, [uploadError, addToast]);

  return (
    <div className="viewer-layout">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Back button overlay */}
      <button
        id="back-btn"
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: 'rgba(17,17,24,0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#c0c0cc',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(17,17,24,0.9)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(17,17,24,0.7)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* 3D Canvas */}
      <Viewer3D
        modelUrl={modelUrl}
        backgroundColor={settings.backgroundColor}
        wireframe={settings.wireframe}
        materialColor={materialColor}
        lightColor={lightColor}
      />

      {/* Control Panel Sidebar */}
      <ControlPanel
        settings={settings}
        onUpdateSetting={updateSetting}
        modelName={modelName}
        modelSize={modelSize}
        onUploadClick={handleUploadClick}
        uploading={uploading}
        saving={saving}
        saveStatus={saveStatus}
        savedAt={savedAt}
        materialColor={materialColor}
        onMaterialChange={setMaterialColor}
        lightColor={lightColor}
        onLightColorChange={handleLightColorChange}
        onSelectModel={handleSelectModel}
      />

      {/* Toast notifications */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '340px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 1000,
      }}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
