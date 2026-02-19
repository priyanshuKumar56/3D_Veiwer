import { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Viewer3D from '../components/Viewer3D';
import ControlPanel from '../components/ControlPanel';
import Toast from '../components/Toast';
import { useSettings } from '../hooks/useSettings';
import { useUpload } from '../hooks/useUpload';

/* ── Material texture presets ──────────── */
const MATERIAL_PRESETS = [
  { name: 'Default', key: null },
  { name: 'Chrome', key: { metalness: 1, roughness: 0.05, emissiveIntensity: 0 }, emoji: '🪞' },
  { name: 'Brushed Metal', key: { metalness: 0.9, roughness: 0.35, emissiveIntensity: 0 }, emoji: '🔩' },
  { name: 'Plastic', key: { metalness: 0, roughness: 0.4, emissiveIntensity: 0 }, emoji: '🧊' },
  { name: 'Glass', key: { metalness: 0.1, roughness: 0, emissiveIntensity: 0.1 }, emoji: '💎' },
  { name: 'Matte', key: { metalness: 0, roughness: 1, emissiveIntensity: 0 }, emoji: '🧱' },
  { name: 'Ceramic', key: { metalness: 0.2, roughness: 0.15, emissiveIntensity: 0 }, emoji: '🏺' },
  { name: 'Rubber', key: { metalness: 0, roughness: 0.85, emissiveIntensity: 0 }, emoji: '🛞' },
];

/* ── HDRI environment presets ──────────── */
const ENVIRONMENT_PRESETS = [
  { name: 'None', key: 'none', emoji: '⬛' },
  { name: 'Night', key: 'night', emoji: '🌙' },
  { name: 'Studio', key: 'studio', emoji: '💡' },
  { name: 'City', key: 'city', emoji: '🏙️' },
  { name: 'Sunset', key: 'sunset', emoji: '🌅' },
  { name: 'Dawn', key: 'dawn', emoji: '🌄' },
  { name: 'Forest', key: 'forest', emoji: '🌲' },
];

/* ── Annotation colors ─────────────────── */
const ANNOTATION_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

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

  /* ── New feature state ─────────────── */
  const [materialPreset, setMaterialPreset] = useState(null);
  const [showPlatform, setShowPlatform] = useState(true);
  const [environmentPreset, setEnvironmentPreset] = useState('none');
  const [annotations, setAnnotations] = useState([]);
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const [annotationMode, setAnnotationMode] = useState(false);

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

  /* ── Annotation handlers ──────────── */
  const handleAddAnnotation = useCallback((position) => {
    const colorIndex = annotations.length % ANNOTATION_COLORS.length;
    const newAnnotation = {
      id: Date.now(),
      index: annotations.length,
      position,
      title: `Point ${annotations.length + 1}`,
      description: 'Annotation added',
      color: ANNOTATION_COLORS[colorIndex],
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setActiveAnnotation(newAnnotation.id);
    setAnnotationMode(false);
    addToast('success', `Annotation #${annotations.length + 1} added`);
  }, [annotations, addToast]);

  const handleAnnotationClick = useCallback((id) => {
    setActiveAnnotation(prev => prev === id ? null : id);
  }, []);

  const handleAnnotationDelete = useCallback((id) => {
    setAnnotations(prev => {
      const filtered = prev.filter(a => a.id !== id);
      // Re-index
      return filtered.map((a, i) => ({ ...a, index: i, title: `Point ${i + 1}` }));
    });
    setActiveAnnotation(null);
    addToast('info', 'Annotation removed');
  }, [addToast]);

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
        materialPreset={materialPreset}
        showPlatform={showPlatform}
        environmentPreset={environmentPreset}
        annotations={annotations}
        activeAnnotation={activeAnnotation}
        annotationMode={annotationMode}
        onAnnotationClick={handleAnnotationClick}
        onAnnotationDelete={handleAnnotationDelete}
        onAddAnnotation={handleAddAnnotation}
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
        /* New feature props */
        materialPreset={materialPreset}
        materialPresets={MATERIAL_PRESETS}
        onMaterialPresetChange={setMaterialPreset}
        showPlatform={showPlatform}
        onTogglePlatform={() => setShowPlatform(prev => !prev)}
        environmentPreset={environmentPreset}
        environmentPresets={ENVIRONMENT_PRESETS}
        onEnvironmentChange={setEnvironmentPreset}
        annotations={annotations}
        annotationMode={annotationMode}
        onToggleAnnotationMode={() => {
          setAnnotationMode(prev => {
            if (!prev) addToast('info', 'Mode Active: Click on model to place pin');
            return !prev;
          });
        }}
        onClearAnnotations={() => { setAnnotations([]); setActiveAnnotation(null); }}
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
