const MATERIAL_COLORS = [
  { name: 'Default', color: null },
  { name: 'Arctic White', color: '#f5f5f5' },
  { name: 'Midnight Black', color: '#1a1a1a' },
  { name: 'Electric Blue', color: '#3b82f6' },
  { name: 'Sunset Orange', color: '#f97316' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Hot Pink', color: '#ec4899' },
  { name: 'Royal Purple', color: '#8b5cf6' },
  { name: 'Gold', color: '#eab308' },
];

export default function MaterialChanger({ activeColor, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {MATERIAL_COLORS.map((item) => (
          <button
            key={item.name}
            className={`material-swatch ${activeColor === item.color ? 'active' : ''}`}
            style={{
              background: item.color
                ? item.color
                : 'conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
            }}
            onClick={() => onChange(item.color)}
            title={item.name}
            aria-label={`Set material color to ${item.name}`}
          />
        ))}
      </div>
      <p style={{ fontSize: '11px', color: '#4a4a5c' }}>
        {activeColor
          ? `Active: ${MATERIAL_COLORS.find(c => c.color === activeColor)?.name || activeColor}`
          : 'Using original textures'}
      </p>
    </div>
  );
}
