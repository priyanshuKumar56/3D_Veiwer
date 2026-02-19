export default function WireframeToggle({ value, onChange }) {
  return (
    <div className="control-row">
      <span className="control-label">Wireframe Mode</span>
      <button
        id="wireframe-toggle"
        className={`toggle-switch ${value ? 'active' : ''}`}
        onClick={() => onChange(!value)}
        aria-label="Toggle wireframe mode"
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}
