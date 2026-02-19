/**
 * ConsoleSection — Model management console with model list and upload panel.
 */
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import ModelList from './ModelList';
import UploadPanel from './UploadPanel';

export default function ConsoleSection({
  recentModels,
  busy,
  error,
  fileInputRef,
  onModelClick,
  onDrop,
  onOpenViewer,
}) {
  return (
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
        <ModelList
          models={recentModels}
          onModelClick={onModelClick}
          onViewArchive={onOpenViewer}
        />
        <UploadPanel
          busy={busy}
          error={error}
          fileInputRef={fileInputRef}
          onDrop={onDrop}
        />
      </div>
    </section>
  );
}
