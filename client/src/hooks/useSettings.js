import { useState, useCallback, useRef, useEffect } from 'react';
import { saveSettings, fetchSettings } from '../lib/api';

export function useSettings() {
  const [settings, setSettings] = useState({
    backgroundColor: '#0a0a0f',
    wireframe: false,
    modelUrl: '',
    modelName: '',
    lightColor: '#ffffff',
  });
  const [savedAt, setSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'error' | null
  const debounceTimer = useRef(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchSettings();
      if (data.success) {
        setSettings({
          backgroundColor: data.backgroundColor || '#0a0a0f',
          wireframe: data.wireframe || false,
          modelUrl: data.modelUrl || '',
          modelName: data.modelName || '',
          lightColor: data.lightColor || '#ffffff',
        });
        setSavedAt(data.savedAt);
      }
    } catch (err) {
      console.warn('Could not load settings from server:', err.message);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Auto-save with debounce
  const autoSave = useCallback((newSettings) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const data = await saveSettings(newSettings);
        if (data.success) {
          setSavedAt(data.savedAt);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 2500);
        }
      } catch (err) {
        console.error('Failed to save settings:', err);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      } finally {
        setSaving(false);
      }
    }, 800);
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      autoSave(next);
      return next;
    });
  }, [autoSave]);

  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      autoSave(next);
      return next;
    });
  }, [autoSave]);

  return {
    settings,
    savedAt,
    saving,
    loaded,
    saveStatus,
    updateSetting,
    updateSettings,
    loadSettings,
  };
}
