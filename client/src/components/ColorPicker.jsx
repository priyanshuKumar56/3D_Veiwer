export default function ColorPicker({ label, value, onChange }) {
  return (
    <div className="control-row">
      <span className="control-label">{label}</span>
      <div className="color-picker-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '11px', color: '#6b6b80', fontFamily: 'monospace' }}>
          {value}
        </span>
        <div className="color-swatch" style={{ backgroundColor: value }}>
          <input
            id="bg-color-picker"
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
