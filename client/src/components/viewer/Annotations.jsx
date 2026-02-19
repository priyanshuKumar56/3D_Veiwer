/**
 * Annotations — Clickable 3D hotspot markers with labels.
 * Renders floating markers in 3D space that expand on click to show details.
 */
import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/* ── Single annotation marker ────────── */
function AnnotationMarker({ annotation, isActive, onClick, onDelete }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        annotation.position[1] + Math.sin(state.clock.elapsedTime * 2 + annotation.id) * 0.03;
    }
  });

  return (
    <group ref={meshRef} position={annotation.position}>
      {/* Outer pulse ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.06, 0.08, 32]} />
        <meshBasicMaterial
          color={annotation.color || '#3b82f6'}
          transparent
          opacity={hovered || isActive ? 0.8 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main sphere */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onClick(annotation.id); }}
        scale={hovered ? 1.3 : 1}
      >
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color={annotation.color || '#3b82f6'}
          emissive={annotation.color || '#3b82f6'}
          emissiveIntensity={hovered || isActive ? 1 : 0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Number label (always visible) */}
      <Html
        center
        distanceFactor={4}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: annotation.color || '#3b82f6',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 700,
          fontFamily: "'DM Mono', monospace",
          boxShadow: `0 0 12px ${annotation.color || '#3b82f6'}60`,
          transform: 'translateY(-24px)',
          userSelect: 'none',
        }}>
          {annotation.index + 1}
        </div>
      </Html>

      {/* Expanded detail card */}
      {isActive && (
        <Html
          center
          distanceFactor={3.5}
          style={{ pointerEvents: 'auto' }}
        >
          <div style={{
            minWidth: '180px',
            maxWidth: '240px',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(10,10,15,0.92)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${annotation.color || '#3b82f6'}40`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${annotation.color || '#3b82f6'}20`,
            transform: 'translateY(-60px)',
            color: '#e8e8ed',
            fontFamily: "'DM Mono', monospace",
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: annotation.color || '#3b82f6',
                letterSpacing: '0.05em',
              }}>
                #{annotation.index + 1}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(annotation.id); }}
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '9px',
                  cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                ✕
              </button>
            </div>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#e8e8ed',
              marginBottom: '4px',
            }}>
              {annotation.title || 'Annotation'}
            </p>
            <p style={{
              fontSize: '10px',
              color: '#6b6b80',
              lineHeight: 1.5,
            }}>
              {annotation.description || 'Click on model to place annotations'}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ── Annotation system ────────────────── */
export default function Annotations({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  onAnnotationDelete,
}) {
  return (
    <group>
      {/* Render all annotation markers */}
      {annotations.map((ann) => (
        <AnnotationMarker
          key={ann.id}
          annotation={ann}
          isActive={activeAnnotation === ann.id}
          onClick={onAnnotationClick}
          onDelete={onAnnotationDelete}
        />
      ))}
    </group>
  );
}
