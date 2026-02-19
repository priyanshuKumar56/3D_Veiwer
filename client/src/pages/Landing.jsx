import { useCallback, useRef, useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpload } from '../hooks/useUpload';
import { useSettings } from '../hooks/useSettings';
import {
  Shirt,
  MoreHorizontal,
  ArrowUpDown,
  CloudUpload,
  Wifi,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Stage, PresentationControls, Float } from '@react-three/drei';
import { fetchUploads } from '../lib/api';

/* ─────────────────────────────────────────────
   STYLES – injected once via a <style> tag so
   this file stays self-contained.
───────────────────────────────────────────── */
const STYLES = `

  /* ── Tokens ─────────────────────────────── */
  :root {
    --bg:        #050507;
    --surface:   #0d0d12;
    --surface2:  #111118;
    --border:    rgba(255,255,255,0.07);
    --border-h:  rgba(255,255,255,0.18);
    --txt:       #e8e8ed;
    --txt-dim:   #6b6b80;
    --txt-muted: #3a3a4a;
    --blue:      #3b82f6;
    --blue-glow: rgba(59,130,246,0.20);
    --green:     #10b981;
    --amber:     #f59e0b;
    --red:       #ef4444;
    --radius:    14px;
    --font-head: 'Syne', system-ui, sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  /* ── Reset / base ───────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: var(--font-mono);
    background: var(--bg);
    color: var(--txt);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* ── Scrollbar ───────────────────────────── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }

  /* ── Landing wrapper ────────────────────── */
  .lp { min-height: 100vh; width: 100%; background: var(--bg); }

  /* ── NAV ────────────────────────────────── */
  .nav {
    position: fixed; top: 0; left: 0; width: 100%; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 56px;
    background: rgba(5,5,7,0.75);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    display: flex; align-items: center; gap: 10px;
  }
  .nav-dot {
    width: 18px; height: 18px;
    background: #fff;
    border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 12px rgba(255,255,255,0.4);
  }
  .nav-dot span {
    width: 5px; height: 5px; background: #000; border-radius: 2px;
  }
  .nav-title {
    font-family: var(--font-head);
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.18em; text-transform: uppercase; color: #fff;
  }
  .nav-links {
    display: flex; gap: 32px; list-style: none;
  }
  .nav-links a, .nav-links button {
    font-family: var(--font-mono);
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--txt-dim); text-decoration: none;
    background: none; border: none; cursor: pointer;
    transition: color 0.2s;
  }
  .nav-links a:hover, .nav-links button:hover { color: #fff; }
  .nav-badge {
    font-family: var(--font-mono);
    font-size: 9px; color: var(--txt-muted); letter-spacing: 0.1em;
  }

  /* ── HERO ───────────────────────────────── */
  .hero {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 80px 64px 40px;
    gap: 48px;
    position: relative;
    overflow: hidden;
  }
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 100px 24px 48px; text-align: center; }
    .hero-art { order: -1; height: 280px; }
    .hero-cta { justify-content: center; }
  }

  /* ambient radial */
  .hero::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 60% 40% at 70% 40%, rgba(59,130,246,0.06) 0%, transparent 65%),
      radial-gradient(ellipse 40% 50% at 20% 60%, rgba(139,92,246,0.04) 0%, transparent 60%);
  }
  /* subtle grid texture */
  .hero::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  .hero-copy { position: relative; z-index: 1; }
  .hero-label {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--font-mono);
    font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--txt-muted); margin-bottom: 28px;
  }
  .hero-label::before {
    content: '';
    width: 16px; height: 1px; background: var(--txt-muted);
  }
  .hero-h1 {
    font-family: var(--font-head);
    font-size: clamp(52px, 7vw, 96px);
    font-weight: 800;
    line-height: 0.9;
    letter-spacing: -0.03em;
    color: #fff;
    margin-bottom: 24px;
  }
  .hero-h1 em { color: var(--txt-dim); font-style: normal; }
  .hero-sub {
    font-family: var(--font-mono);
    font-size: 12px; line-height: 1.8;
    color: var(--txt-dim); max-width: 380px;
    margin-bottom: 40px;
  }
  .hero-cta { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-white {
    padding: 12px 24px;
    background: #fff; color: #000;
    border: none; border-radius: 999px;
    font-family: var(--font-mono); font-size: 10px;
    font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .btn-white:hover { background: #e0e0e0; transform: translateY(-1px); }
  .btn-ghost {
    padding: 12px 24px;
    background: rgba(255,255,255,0.04);
    color: var(--txt-dim);
    border: 1px solid var(--border);
    border-radius: 999px;
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: var(--border-h); color: #fff; }

  /* ── HERO ART ────────────────────────────── */
  .hero-art {
    position: relative; z-index: 1;
    display: flex; align-items: center; justify-content: center;
    height: 600px;
    width: 100%;
  }

  /* Make the canvas fill the container */
  .hero-art canvas { width: 100% !important; height: 100% !important; outline: none; }

  @media (max-width: 900px) {
    .hero-art {
      position: absolute;
      top: -60px;
      left: 0;
      width: 100%;
      height: 65vh;
      z-index: 0;
      opacity: 0.8;
      pointer-events: none; /* allow clicks to pass through */
      mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
    }
    .hero-copy {
      position: relative; z-index: 10;
      text-shadow: 0 4px 20px rgba(0,0,0,0.8); /* enhance readability */
    }
  }

  /* ── DIVIDER ─────────────────────────────── */
  .section-divider {
    width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
  }

  /* ── CONSOLE SECTION ─────────────────────── */
  .console {
    padding: 64px 64px 80px;
    background: var(--bg);
  }
  @media (max-width: 900px) { .console { padding: 48px 24px 64px; } }

  .console-header {
    display: flex; justify-content: space-between; align-items: flex-end;
    margin-bottom: 40px; gap: 16px; flex-wrap: wrap;
  }
  .console-title {
    font-family: var(--font-head);
    font-size: 28px; font-weight: 700; color: #fff;
    letter-spacing: -0.02em;
  }
  .console-sub {
    font-family: var(--font-mono);
    font-size: 10px; color: var(--txt-muted);
    letter-spacing: 0.08em; margin-top: 4px;
  }
  .icon-btn {
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--txt-dim); cursor: pointer;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .icon-btn:hover { background: rgba(255,255,255,0.08); border-color: var(--border-h); color: #fff; }

  .console-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 24px;
  }
  @media (max-width: 1100px) { .console-grid { grid-template-columns: 1fr; } }

  /* ── MODEL LIST ──────────────────────────── */
  .model-list { display: flex; flex-direction: column; gap: 2px; }
  .list-head {
    display: grid;
    grid-template-columns: 1fr 120px 100px;
    gap: 16px; padding: 8px 16px 12px;
    border-bottom: 1px solid var(--border);
  }
  .list-head span {
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--txt-muted);
  }
  .list-head span:last-child { text-align: right; }

  .model-empty {
    padding: 56px 24px; text-align: center;
    font-family: var(--font-mono); font-size: 11px;
    color: var(--txt-muted); letter-spacing: 0.08em;
    border: 1px dashed var(--border); border-radius: var(--radius);
    margin-top: 8px;
  }

  .model-row {
    display: grid;
    grid-template-columns: 1fr 120px 100px;
    gap: 16px; align-items: center;
    padding: 12px 16px;
    border: 1px solid transparent;
    border-radius: var(--radius);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    position: relative; overflow: hidden;
  }
  .model-row::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.025), transparent);
    transform: translateX(-100%);
    transition: transform 0.4s ease;
  }
  .model-row:hover { background: var(--surface); border-color: var(--border); }
  .model-row:hover::before { transform: translateX(100%); }

  .model-info { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .model-icon {
    width: 40px; height: 40px; flex-shrink: 0;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: var(--txt-dim);
    transition: background 0.2s, color 0.2s;
  }
  .model-row:hover .model-icon { background: rgba(255,255,255,0.06); color: #fff; }
  .model-name {
    font-family: var(--font-head);
    font-size: 13px; font-weight: 600; color: var(--txt);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color 0.2s;
  }
  .model-row:hover .model-name { color: #fff; }
  .model-meta {
    font-family: var(--font-mono);
    font-size: 9px; color: var(--txt-muted);
    letter-spacing: 0.06em; margin-top: 2px;
  }

  .status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px;
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.18);
    border-radius: 999px;
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.08em; color: var(--green);
  }
  .status-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--green);
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

  .model-time {
    text-align: right;
    font-family: var(--font-mono); font-size: 10px;
    color: var(--txt-muted);
    transition: color 0.2s;
  }
  .model-row:hover .model-time { color: var(--txt-dim); }

  .more-btn {
    margin-top: 16px; width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px;
    background: none; border: none; border-top: 1px solid var(--border);
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--txt-muted); cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .more-btn:hover { color: #fff; border-color: var(--border-h); }

  /* ── UPLOAD PANEL ────────────────────────── */
  .upload-panel {
    display: flex; flex-direction: column;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .upload-panel-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
  }
  .panel-label {
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--txt-muted);
  }
  .status-leds { display: flex; gap: 5px; align-items: center; }
  .led {
    width: 6px; height: 6px; border-radius: 50%;
  }
  .led-green { background: var(--green); opacity: 0.6; }
  .led-amber { background: var(--amber); animation: pulse 1.2s infinite; }
  .led-off   { background: var(--txt-muted); opacity: 0.3; }

  .upload-body { flex: 1; padding: 16px; }
  .drop-zone {
    width: 100%; height: 320px;
    border: 1px dashed var(--border);
    border-radius: 10px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    cursor: pointer; position: relative; overflow: hidden;
    transition: border-color 0.3s, box-shadow 0.3s;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 20px 20px;
  }
  .drop-zone:hover {
    border-color: rgba(255,255,255,0.25);
    box-shadow: 0 0 28px rgba(255,255,255,0.04);
  }
  /* scanning line on hover */
  .drop-zone .scan-line {
    position: absolute; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    box-shadow: 0 0 8px rgba(255,255,255,0.6);
    opacity: 0; top: 0;
    transition: opacity 0.3s;
    animation: none;
  }
  .drop-zone:hover .scan-line {
    opacity: 1;
    animation: scanDown 2s linear infinite;
  }
  @keyframes scanDown { 0% { top: 0%; } 100% { top: 100%; } }

  /* corner accents */
  .corner { position: absolute; width: 10px; height: 10px; }
  .corner-tl { top: 0; left: 0; border-top: 1px solid var(--txt-muted); border-left: 1px solid var(--txt-muted); }
  .corner-tr { top: 0; right: 0; border-top: 1px solid var(--txt-muted); border-right: 1px solid var(--txt-muted); }
  .corner-bl { bottom: 0; left: 0; border-bottom: 1px solid var(--txt-muted); border-left: 1px solid var(--txt-muted); }
  .corner-br { bottom: 0; right: 0; border-bottom: 1px solid var(--txt-muted); border-right: 1px solid var(--txt-muted); }
  .drop-zone:hover .corner { border-color: rgba(255,255,255,0.4); transition: border-color 0.3s; }

  .drop-icon {
    width: 64px; height: 64px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
    box-shadow: 0 0 24px rgba(0,0,0,0.5);
    transition: box-shadow 0.3s, border-color 0.3s, background 0.3s;
    color: var(--txt-dim);
  }
  .drop-zone:hover .drop-icon {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.15);
    color: #fff;
    box-shadow: 0 0 24px rgba(255,255,255,0.08);
  }
  .drop-title {
    font-family: var(--font-head);
    font-size: 14px; font-weight: 600; color: #fff;
    margin-bottom: 6px;
  }
  .drop-hint {
    font-family: var(--font-mono);
    font-size: 10px; color: var(--txt-dim);
    line-height: 1.8;
  }
  .drop-hint code {
    font-size: 9px; color: var(--txt-muted);
    letter-spacing: 0.08em;
  }
  .drop-inner { transition: transform 0.4s ease; position: relative; z-index: 1; }
  .drop-zone:hover .drop-inner { transform: translateY(-6px); }

  .dz-meta {
    position: absolute; bottom: 10px;
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.08em; color: var(--txt-muted);
  }
  .dz-meta-l { left: 14px; }
  .dz-meta-r { right: 14px; }
  .drop-zone:hover .dz-meta { color: rgba(255,255,255,0.25); transition: color 0.3s; }

  /* uploading state */
  .uploading-state {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 12px;
    position: relative; z-index: 1;
  }
  .uploading-state .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .progress-bar {
    width: 80px; height: 2px;
    background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: #fff;
    animation: fill 2s linear infinite;
  }
  @keyframes fill { 0% { width: 0%; } 100% { width: 100%; } }

  .error-toast {
    position: absolute; bottom: 44px; left: 12px; right: 12px;
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.25);
    color: var(--red); border-radius: 8px;
    font-family: var(--font-mono); font-size: 10px;
    padding: 8px 12px; text-align: center; z-index: 10;
  }

  .upload-panel-foot {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 18px;
    border-top: 1px solid var(--border);
    background: rgba(0,0,0,0.2);
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.1em; color: var(--txt-muted);
  }

  /* ── FOOTER ──────────────────────────────── */
  .footer {
    border-top: 1px solid var(--border);
    padding: 28px 64px;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px;
  }
  @media (max-width: 900px) { .footer { padding: 24px; } }
  .footer-copy {
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--txt-muted);
  }
  .footer-links { display: flex; gap: 20px; }
  .footer-links a {
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 0.1em; text-decoration: none;
    color: var(--txt-muted); transition: color 0.2s;
  }
  .footer-links a:hover { color: #fff; }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
/* ── 3D MODEL COMPONENT ──────────────────── */
function HeroModel(props) {
  const { scene } = useGLTF('/3dmodel/tshirt.glb');
  return <primitive object={scene} {...props} />;
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const { upload, uploading, error, clearError } = useUpload();
  const { updateSettings } = useSettings();
  const fileInputRef = useRef(null);
  const [recentModels, setRecentModels] = useState([]);
  const [uploadAnim, setUploadAnim] = useState(false);

  /* fetch recent models */
  useEffect(() => {
    fetchUploads()
      .then((d) => { if (d.success) setRecentModels(d.uploads || []); })
      .catch(() => {});
  }, []);

  /* upload logic */
  const handleFileSelect = useCallback(async (file) => {
    clearError();
    setUploadAnim(true);
    const data = await upload(file);
    setUploadAnim(false);
    if (data) {
      updateSettings({ modelUrl: data.url, modelName: data.originalName });
      navigate('/viewer', { state: { modelUrl: data.url, modelName: data.originalName, fileSize: data.fileSize } });
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
    const API = import.meta.env.VITE_API_URL || '';
    const url = `${API}${model.filePath}`;
    updateSettings({ modelUrl: url, modelName: model.originalName });
    navigate('/viewer', { state: { modelUrl: url, modelName: model.originalName, fileSize: model.fileSize } });
  };

  const openViewer = () =>
    navigate('/viewer', { state: { modelUrl: null, modelName: '', fileSize: 0 } });

  const busy = uploading || uploadAnim;

  /* ── RENDER ──────────────────────────────── */
  return (
    <div className="lp">
      <style>{STYLES}</style>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* ── NAV ─────────────────────────────── */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-dot"><span /></div>
          <span className="nav-title">Fabric OS</span>
        </div>
        <ul className="nav-links">
          <li><a href="#">Manifesto</a></li>
          <li><button onClick={openViewer}>Engine</button></li>
          <li><a href="#">Pricing</a></li>
        </ul>
        <span className="nav-badge">V.2.0.4‑BETA</span>
      </nav>

      {/* ── HERO ────────────────────────────── */}
      <section className="hero">
        {/* copy */}
        <div className="hero-copy">
          <div className="hero-label">Real-time 3D Garment Engine</div>
          <h1 className="hero-h1">
            Digital<br />
            <em>Tangibility.</em>
          </h1>
          <p className="hero-sub">
            The bridge between imagination and fabrication.
            Generate physics-accurate garments in real-time.
          </p>
          <div className="hero-cta">
            <button className="btn-white" onClick={openViewer}>Open Console</button>
            <button
              className="btn-ghost"
              onClick={() => document.getElementById('console')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Documentation
            </button>
          </div>
        </div>

        {/* t-shirt art (3D) */}
        <div className="hero-art">
          <Canvas dpr={[1, 2]} camera={{ fov: 45 }} style={{ background: 'transparent' }}>
            <Suspense fallback={null}>
              <PresentationControls
                speed={1.5}
                zoom={0.5}
                polar={[-0.1, Math.PI / 4]}
              >
                <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                  <Stage environment="city" intensity={0.5} contactShadow={false}>
                    <HeroModel scale={0.01} />
                  </Stage>
                </Float>
              </PresentationControls>
            </Suspense>
          </Canvas>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── CONSOLE ─────────────────────────── */}
      <section className="console" id="console">
        {/* header */}
        <div className="console-header">
          <div>
            <h2 className="console-title">Fabrication Console</h2>
            <p className="console-sub">Manage existing blueprints or initialize new fabrication.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="icon-btn" title="Sort">
              <ArrowUpDown size={16} strokeWidth={1.5} />
            </button>
            <button className="icon-btn" title="More">
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="console-grid">
          {/* ── Model List ──────────────────── */}
          <div className="model-list">
            <div className="list-head">
              <span>Project Name</span>
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Last Modified</span>
            </div>

            {recentModels.length === 0 ? (
              <div className="model-empty">No models uploaded yet.</div>
            ) : (
              recentModels.map((model) => (
                <div
                  key={model._id}
                  className="model-row"
                  onClick={() => handleModelClick(model)}
                >
                  <div className="model-info">
                    <div className="model-icon">
                      <Shirt size={17} strokeWidth={1.5} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="model-name">{model.originalName}</div>
                      <div className="model-meta">
                        {model.originalName.split('.').pop()?.toUpperCase()} &bull; {formatFileSize(model.fileSize)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="status-badge">
                      <span className="status-dot" />
                      Ready
                    </span>
                  </div>
                  <div className="model-time">{formatTime(model.createdAt)}</div>
                </div>
              ))
            )}

            <button className="more-btn" onClick={openViewer}>
              View archived models <ArrowRight size={13} />
            </button>
          </div>

          {/* ── Upload Panel ────────────────── */}
          <div className="upload-panel">
            {/* header */}
            <div className="upload-panel-head">
              <span className="panel-label">Input Stream</span>
              <div className="status-leds">
                <div className={`led ${busy ? 'led-amber' : 'led-green'}`} />
                <div className="led led-off" />
              </div>
            </div>

            {/* body */}
            <div className="upload-body">
              <div
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="scan-line" />
                <div className="corner corner-tl" />
                <div className="corner corner-tr" />
                <div className="corner corner-bl" />
                <div className="corner corner-br" />

                {busy ? (
                  <div className="uploading-state">
                    <Loader2 size={28} className="spin" color="white" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--txt-dim)', textTransform: 'uppercase' }}>
                      Uploading…
                    </span>
                    <div className="progress-bar">
                      <div className="progress-fill" />
                    </div>
                  </div>
                ) : (
                  <div className="drop-inner">
                    <div className="drop-icon" style={{ margin: '0 auto 18px' }}>
                      <CloudUpload size={26} strokeWidth={1.5} />
                    </div>
                    <div className="drop-title">Initiate Upload</div>
                    <p className="drop-hint">
                      Drag & drop geometry files.<br />
                      <code>.GLB .GLTF SUPPORTED</code>
                    </p>
                  </div>
                )}

                {error && <div className="error-toast">{error}</div>}

                <span className="dz-meta dz-meta-l">MAX: 50 MB</span>
                <span className="dz-meta dz-meta-r">SECURE</span>
              </div>
            </div>

            {/* footer */}
            <div className="upload-panel-foot">
              <span>{busy ? 'PROCESSING…' : 'AWAITING INPUT'}</span>
              <Wifi size={13} />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer className="footer">
        <span className="footer-copy">System Operational</span>
        <div className="footer-links">
          <a href="#">Legal</a>
          <a href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
}