/**
 * UploadPanel — Drop-zone upload card with status LEDs and scan animation.
 */
import { CloudUpload, Wifi, Loader2 } from 'lucide-react';

export default function UploadPanel({ busy, error, fileInputRef, onDrop }) {
  return (
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
          onDrop={onDrop}
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
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.14em',
                color: 'var(--txt-dim)',
                textTransform: 'uppercase',
              }}>
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
  );
}
