/**
 * ModelList — Displays recent uploaded models in a table layout.
 */
import { Shirt, ArrowRight } from 'lucide-react';
import { formatFileSize, formatTime } from '../../lib/helpers';

export default function ModelList({ models, onModelClick, onViewArchive }) {
  return (
    <div className="model-list">
      {/* table header */}
      <div className="list-head">
        <span>Project Name</span>
        <span>Status</span>
        <span style={{ textAlign: 'right' }}>Last Modified</span>
      </div>

      {/* rows */}
      {models.length === 0 ? (
        <div className="model-empty">No models uploaded yet.</div>
      ) : (
        models.map((model) => (
          <div
            key={model._id}
            className="model-row"
            onClick={() => onModelClick(model)}
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

      {/* archive link */}
      <button className="more-btn" onClick={onViewArchive}>
        View archived models <ArrowRight size={13} />
      </button>
    </div>
  );
}
