/**
 * SceneContent — Composes all 3D elements inside the Canvas.
 * Manages OrbitControls, lighting, platform, environment, annotations, and the model.
 */
import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';

import ShowroomLights from './ShowroomLights';
import ShowroomPlatform from './ShowroomPlatform';
import Model from './Model';
import SceneLoader from './SceneLoader';
import Annotations from './Annotations';

export default function SceneContent({
  modelUrl,
  wireframe,
  materialColor,
  materialPreset,
  spotColor,
  onSizeCalculated,
  platformRadius,
  onModelLoaded,
  showPlatform,
  environmentPreset,
  annotations,
  activeAnnotation,
  onAnnotationClick,
  onAnnotationDelete,
  annotationMode,
  onAddAnnotation,
}) {
  const controlsRef = useRef();
  const [controlsEnabled, setControlsEnabled] = useState(false);

  // Reset controls when model changes
  useEffect(() => {
    setControlsEnabled(false);
  }, [modelUrl]);

  const handleControlsReady = useCallback(() => {
    setControlsEnabled(true);
  }, []);

  // Cursor effect for annotation mode
  useEffect(() => {
    if (annotationMode) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = 'auto';
    }
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [annotationMode]);

  // Force controls ensuring they are disabled in annotation mode
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = controlsEnabled && !annotationMode;
      // Also force stop auto-rotation if active
      if (annotationMode) controlsRef.current.autoRotate = false;
    }
  }, [controlsEnabled, annotationMode]);

  const handleModelClick = useCallback((e) => {
    // Only handle click if in annotation mode
    if (annotationMode && onAddAnnotation) {
      console.log('Model clicked at:', e.point);
      e.stopPropagation();
      const point = [
        parseFloat(e.point.x.toFixed(3)),
        parseFloat(e.point.y.toFixed(3)),
        parseFloat(e.point.z.toFixed(3)),
      ];
      onAddAnnotation(point);
    }
  }, [annotationMode, onAddAnnotation]);

  return (
    <>
      <ShowroomLights lightColor={spotColor} platformRadius={platformRadius} />

      {/* HDRI environment — background={true} makes it visible */}
      {environmentPreset && environmentPreset !== 'none' && (
        <Environment preset={environmentPreset} background />
      )}

      {/* Group to reliably capture clicks on Model OR Platform */}
      <group onPointerDown={handleModelClick}>
        {/* Showroom platform — toggleable */}
        {showPlatform && (
          <ShowroomPlatform platformRadius={platformRadius} lightColor={spotColor} />
        )}

        <Suspense fallback={<SceneLoader />}>
          {modelUrl ? (
            <Model
              url={modelUrl}
              wireframe={wireframe}
              materialColor={materialColor}
              materialPreset={materialPreset}
              controlsRef={controlsRef}
              onControlsReady={handleControlsReady}
              onSizeCalculated={(data) => {
                onSizeCalculated(data);
                if (onModelLoaded) onModelLoaded();
              }}
              // Removed individual onClick here as parent handles it
              // onClick={handleModelClick}
            />
          ) : (
            <SceneLoader />
          )}
        </Suspense>
      </group>

      {/* Annotations / Hotspots */}
      <Annotations
        annotations={annotations || []}
        activeAnnotation={activeAnnotation}
        onAnnotationClick={onAnnotationClick}
        onAnnotationDelete={onAnnotationDelete}
        annotationMode={annotationMode}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={controlsEnabled && !annotationMode}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
        enablePan={false}
        enableRotate={true}
        enableZoom={true}
        autoRotate={false}
        autoRotateSpeed={0.4}
      />
    </>
  );
}
