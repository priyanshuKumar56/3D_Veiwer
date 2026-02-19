import { useState, useEffect } from 'react';
import {
  Upload,
  Palette,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  FileBox,
  Save,
  Check,
  AlertCircle,
  Loader2,
  Box,
  Sparkles,
  Sun,
  Clock,
} from 'lucide-react';
import ColorPicker from './ColorPicker';
import WireframeToggle from './WireframeToggle';
import MaterialChanger from './MaterialChanger';
import { fetchUploads } from '../lib/api';

// Preset light color themes
const LIGHT_PRESETS = [
  { name: 'Daylight', color: '#ffffff', emoji: '☀️' },
  { name: 'Warm Studio', color: '#ffd4a0', emoji: '🔥' },
  { name: 'Cool Blue', color: '#a0c4ff', emoji: '❄️' },
  { name: 'Neon Purple', color: '#c084fc', emoji: '💜' },
  { name: 'Sunset Orange', color: '#fdba74', emoji: '🌅' },
  { name: 'Emerald', color: '#6ee7b7', emoji: '💚' },
  { name: 'Rose', color: '#fda4af', emoji: '🌸' },
  { name: 'Electric Blue', color: '#38bdf8', emoji: '⚡' },
];

export default function ControlPanel({
  settings,
  onUpdateSetting,
  modelName,
  modelSize,
  onUploadClick,
  uploading,
  saving,
  saveStatus,
  savedAt,
  materialColor,
  onMaterialChange,
  lightColor,
  onLightColorChange,
  onSelectModel,
}) {
  const [expandedSections, setExpandedSections] = useState({
    model: true,
    recent: true,
    environment: true,
    lighting: true,
    display: true,
    settings: true,
  });

  const [recentModels, setRecentModels] = useState([]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return date.toLocaleDateString();
  };

  // Fetch recent models from server
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await fetchUploads();
        if (data.success) {
          setRecentModels(data.uploads || []);
        }
      } catch (err) {
        console.warn('Could not fetch recent models:', err);
      }
    };
    fetchRecent();
  }, [modelName]); // re-fetch when a new model is uploaded

  return (
    <div className="control-panel">
      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(59,130,246,0.25)',
          }}>
            <Box size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: '#e8e8ed', lineHeight: 1.2 }}>
              3D Viewer
            </h1>
            <p style={{ fontSize: '11px', color: '#6b6b80' }}>Showroom Experience</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Section: Model */}
      <div className="control-section">
        <button
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%',
          }}
          onClick={() => toggleSection('model')}
        >
          <span className="control-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileBox size={12} /> Model
          </span>
          {expandedSections.model ? <ChevronUp size={14} color="#6b6b80" /> : <ChevronDown size={14} color="#6b6b80" />}
        </button>

        {expandedSections.model && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              id="upload-btn"
              className="btn-primary"
              onClick={onUploadClick}
              disabled={uploading}
              style={{ width: '100%', opacity: uploading ? 0.7 : 1 }}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Model
                </>
              )}
            </button>

            {modelName && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <FileBox size={14} color="#3b82f6" />
                <div style={{ overflow: 'hidden' }}>
                  <p style={{
                    fontSize: '12px', fontWeight: 600, color: '#c0c0cc',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {modelName}
                  </p>
                  {modelSize && (
                    <p style={{ fontSize: '10px', color: '#6b6b80' }}>{formatFileSize(modelSize)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section: Recent Models */}
      <div className="control-section">
        <button
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%',
          }}
          onClick={() => toggleSection('recent')}
        >
          <span className="control-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} /> Recent Models
          </span>
          {expandedSections.recent ? <ChevronUp size={14} color="#6b6b80" /> : <ChevronDown size={14} color="#6b6b80" />}
        </button>

        {expandedSections.recent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
            {recentModels.length === 0 && (
              <p style={{ fontSize: '11px', color: '#4a4a5c', fontStyle: 'italic', padding: '8px 0' }}>No models uploaded yet</p>
            )}
            {recentModels.map((model) => {
              const isActive = modelName === model.originalName;
              return (
                <button
                  key={model._id}
                  onClick={() => {
                    if (onSelectModel && !isActive) {
                      onSelectModel(model);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.04)',
                    background: isActive ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: isActive ? 'default' : 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <FileBox size={12} color={isActive ? '#3b82f6' : '#6b6b80'} />
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#93b4f6' : '#9999a8',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{model.originalName}</p>
                    <p style={{ fontSize: '9px', color: '#4a4a5c' }}>
                      {formatFileSize(model.fileSize)} • {formatTime(model.createdAt)}
                    </p>
                  </div>
                  {isActive && (
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#3b82f6', flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Section: Environment */}
      <div className="control-section">
        <button
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%',
          }}
          onClick={() => toggleSection('environment')}
        >
          <span className="control-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Palette size={12} /> Environment
          </span>
          {expandedSections.environment ? <ChevronUp size={14} color="#6b6b80" /> : <ChevronDown size={14} color="#6b6b80" />}
        </button>

        {expandedSections.environment && (
          <ColorPicker
            label="Background"
            value={settings.backgroundColor}
            onChange={(val) => onUpdateSetting('backgroundColor', val)}
          />
        )}
      </div>

      {/* Section: Lighting — NEW */}
      <div className="control-section">
        <button
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%',
          }}
          onClick={() => toggleSection('lighting')}
        >
          <span className="control-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sun size={12} /> Lighting
          </span>
          {expandedSections.lighting ? <ChevronUp size={14} color="#6b6b80" /> : <ChevronDown size={14} color="#6b6b80" />}
        </button>

        {expandedSections.lighting && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Light color custom picker */}
            <ColorPicker
              label="Light Color"
              value={lightColor || '#ffffff'}
              onChange={onLightColorChange}
            />

            {/* Preset light themes */}
            <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              <span className="control-label" style={{ fontSize: '12px' }}>Quick Presets</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', width: '100%' }}>
                {LIGHT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => onLightColorChange(preset.color)}
                    title={preset.name}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      border: lightColor === preset.color
                        ? '2px solid #ffffff'
                        : '2px solid rgba(255,255,255,0.08)',
                      background: preset.color,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      boxShadow: lightColor === preset.color
                        ? `0 0 12px ${preset.color}40`
                        : 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section: Display */}
      <div className="control-section">
        <button
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%',
          }}
          onClick={() => toggleSection('display')}
        >
          <span className="control-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={12} /> Display
          </span>
          {expandedSections.display ? <ChevronUp size={14} color="#6b6b80" /> : <ChevronDown size={14} color="#6b6b80" />}
        </button>

        {expandedSections.display && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <WireframeToggle
              value={settings.wireframe}
              onChange={(val) => onUpdateSetting('wireframe', val)}
            />

            <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              <span className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} /> Material Color
              </span>
              <MaterialChanger activeColor={materialColor} onChange={onMaterialChange} />
            </div>
          </div>
        )}
      </div>

      {/* Section: Settings */}
      <div className="control-section">
        <button
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%',
          }}
          onClick={() => toggleSection('settings')}
        >
          <span className="control-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={12} /> Settings
          </span>
          {expandedSections.settings ? <ChevronUp size={14} color="#6b6b80" /> : <ChevronDown size={14} color="#6b6b80" />}
        </button>

        {expandedSections.settings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="control-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                {saveStatus === 'saved' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: 500 }}>
                    <Check size={14} /> Settings saved
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                    <AlertCircle size={14} /> Save failed
                  </div>
                )}
                {saving && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b6b80', fontSize: '12px' }}>
                    <Loader2 size={14} style={{ animation: 'spin-slow 1s linear infinite' }} /> Saving...
                  </div>
                )}
                {!saving && !saveStatus && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b6b80', fontSize: '12px' }}>
                    <Save size={14} /> Auto-save on
                  </div>
                )}
              </div>
              {savedAt && (
                <p style={{ fontSize: '10px', color: '#4a4a5c' }}>
                  Last saved: {formatTime(savedAt)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: '10px', color: '#3a3a48', textAlign: 'center' }}>
          3D Product Viewer v2.0 — Showroom
        </p>
      </div>
    </div>
  );
}
