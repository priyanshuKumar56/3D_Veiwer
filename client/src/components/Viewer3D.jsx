/**
 * Viewer3D — Main 3D viewer component.
 * Composes the canvas, background layers, loading states, and scene content.
 *
 * Props:
 *   modelUrl, backgroundColor, wireframe, materialColor, lightColor,
 *   materialPreset, showPlatform, environmentPreset,
 *   annotations, activeAnnotation, annotationMode,
 *   onAnnotationClick, onAnnotationDelete, onAddAnnotation
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import SceneContent from './viewer/SceneContent';
import LoadingOverlay from './viewer/LoadingOverlay';

import '../viewer-styles.css';

export default function Viewer3D({
  modelUrl,
  backgroundColor,
  wireframe,
  materialColor,
  lightColor,
  materialPreset,
  showPlatform = true,
  environmentPreset = 'night',
  annotations = [],
  activeAnnotation,
  annotationMode,
  onAnnotationClick,
  onAnnotationDelete,
  onAddAnnotation,
}) {
  const bgColor = backgroundColor || '#0a0a0f';
  const spotColor = lightColor || '#ffffff';
  const [platformRadius, setPlatformRadius] = useState(2);
  const [sceneReady, setSceneReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const prevModelUrl = useRef(null);

  // Show scene after short delay (canvas init)
  useEffect(() => {
    const t = setTimeout(() => setSceneReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Track when a new model starts loading
  useEffect(() => {
    if (modelUrl && modelUrl !== prevModelUrl.current) {
      setModelLoading(true);
      prevModelUrl.current = modelUrl;
    }
  }, [modelUrl]);

  const handleSizeCalculated = useCallback(({ footprint }) => {
    const newRadius = Math.max(footprint * 1.2, 2);
    setPlatformRadius(newRadius);
  }, []);

  const handleModelLoaded = useCallback(() => {
    setTimeout(() => setModelLoading(false), 300);
  }, []);

  return (
    <div className="viewer-canvas" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Layer 0, 1, 2: CSS Backgrounds (only if no HDRI environment) */}
      {environmentPreset === 'none' && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(/images/Production-Studio-Black-Box-1.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 75%',
              backgroundRepeat: 'no-repeat',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: bgColor,
              opacity: 0.4,
              zIndex: 1,
              mixBlendMode: 'multiply',
              transition: 'background-color 0.4s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(0,0,0,0.55) 100%)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* Layer 3: Three.js canvas */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%' }}>
        <Canvas
          shadows
          camera={{ position: [5, 3, 5], fov: 45, near: 0.01, far: 10000 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.9,
            alpha: true,
          }}
          style={{ background: 'transparent' }}
        >
          <SceneContent
            modelUrl={modelUrl}
            wireframe={wireframe}
            materialColor={materialColor}
            materialPreset={materialPreset}
            spotColor={spotColor}
            platformRadius={platformRadius}
            onSizeCalculated={handleSizeCalculated}
            onModelLoaded={handleModelLoaded}
            showPlatform={showPlatform}
            environmentPreset={environmentPreset}
            annotations={annotations}
            activeAnnotation={activeAnnotation}
            onAnnotationClick={onAnnotationClick}
            onAnnotationDelete={onAnnotationDelete}
            annotationMode={annotationMode}
            onAddAnnotation={onAddAnnotation}
          />
        </Canvas>
      </div>

      {/* Annotation mode indicator */}
      {annotationMode && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 20px',
          borderRadius: '999px',
          background: 'rgba(59,130,246,0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(59,130,246,0.3)',
          color: '#60a5fa',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.05em',
          zIndex: 10,
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}>
          📌 Click on model to add annotation
        </div>
      )}

      {/* Loading: Scene initializing */}
      {!sceneReady && (
        <LoadingOverlay message="Preparing Showroom" />
      )}

      {/* Loading: Model file loading */}
      {sceneReady && modelLoading && (
        <LoadingOverlay message="Loading Model" />
      )}

      {/* Overlay when no model */}
      {sceneReady && !modelLoading && !modelUrl && (
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          borderRadius: '12px',
          background: 'rgba(10,10,15,0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#6b6b80',
          fontSize: '13px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}>
          Upload a model to preview in the showroom
        </div>
      )}
    </div>
  );
}
