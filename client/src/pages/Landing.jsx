
import { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpload } from '../hooks/useUpload';
import { useSettings } from '../hooks/useSettings';
import { fetchUploads, API_BASE_URL } from '../lib/api';

/* ── Sub-components ─────────────────────── */
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ConsoleSection from '../components/landing/ConsoleSection';
import Footer from '../components/landing/Footer';

/* ── Styles ─────────────────────────────── */
import '../styles/landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { upload, uploading, error, clearError } = useUpload();
  const { updateSettings } = useSettings();
  const fileInputRef = useRef(null);
  const [recentModels, setRecentModels] = useState([]);
  const [uploadAnim, setUploadAnim] = useState(false);

  /* ── Fetch recent models on mount ────── */
  useEffect(() => {
    fetchUploads()
      .then((d) => { if (d.success) setRecentModels(d.uploads || []); })
      .catch(() => {});
  }, []);

  /* ── Upload logic ─────────────────────── */
  const handleFileSelect = useCallback(async (file) => {
    clearError();
    setUploadAnim(true);
    const data = await upload(file);
    setUploadAnim(false);
    if (data) {
      const fullUrl = data.url.startsWith('http') ? data.url : `${API_BASE_URL}${data.url}`;
      updateSettings({ modelUrl: fullUrl, modelName: data.originalName });
      navigate('/viewer', {
        state: { modelUrl: fullUrl, modelName: data.originalName, fileSize: data.fileSize },
      });
    }
  }, [upload, updateSettings, navigate, clearError]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    handleFileSelect(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleModelClick = (model) => {
    const url = model.filePath.startsWith('http') ? model.filePath : `${API_BASE_URL}${model.filePath}`;
    updateSettings({ modelUrl: url, modelName: model.originalName });
    navigate('/viewer', {
      state: { modelUrl: url, modelName: model.originalName, fileSize: model.fileSize },
    });
  };

  const openViewer = () =>
    navigate('/viewer', { state: { modelUrl: null, modelName: '', fileSize: 0 } });

  const scrollToConsole = () =>
    document.getElementById('console')?.scrollIntoView({ behavior: 'smooth' });

  const busy = uploading || uploadAnim;

  /* ── Render ───────────────────────────── */
  return (
    <div className="lp">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <Navbar onOpenViewer={openViewer} />

      <HeroSection
        onOpenViewer={openViewer}
        onScrollToConsole={scrollToConsole}
      />

      <div className="section-divider" />

      <ConsoleSection
        recentModels={recentModels.slice(0, 4)}
        busy={busy}
        error={error}
        fileInputRef={fileInputRef}
        onModelClick={handleModelClick}
        onDrop={handleDrop}
        onOpenViewer={openViewer}
      />

      <Footer />
    </div>
  );
}