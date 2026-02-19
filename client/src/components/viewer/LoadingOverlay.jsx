/**
 * LoadingOverlay — Elegant loading screen with animated rings.
 */
export default function LoadingOverlay({ message }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(5,5,10,0.85)',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Animated rings */}
      <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '24px' }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid rgba(255,255,255,0.06)',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin-slow 1.2s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '8px',
          border: '2px solid rgba(255,255,255,0.04)',
          borderBottomColor: '#8b5cf6',
          borderRadius: '50%',
          animation: 'spin-slow 1.8s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute', inset: '16px',
          border: '2px solid rgba(255,255,255,0.03)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin-slow 2.5s linear infinite',
        }} />
        {/* Center dot */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          boxShadow: '0 0 20px rgba(59,130,246,0.5)',
        }} />
      </div>

      <p style={{
        color: '#8888a0',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>{message}</p>

      {/* Subtle progress bar */}
      <div style={{
        width: '120px', height: '2px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '1px',
        marginTop: '12px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '40%', height: '100%',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          borderRadius: '1px',
          animation: 'loading-bar 1.5s ease-in-out infinite',
        }} />
      </div>
    </div>
  );
}
