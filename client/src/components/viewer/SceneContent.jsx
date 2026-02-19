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

  const handleModelClick = useCallback((e) => {
    // Only handle click if in annotation mode
    if (annotationMode && onAddAnnotation) {
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
            onClick={handleModelClick}
          />
        ) : (
          <SceneLoader />
        )}
      </Suspense>

      {/* Annotations / Hotspots */}
      <Annotations
        annotations={annotations || []}
        activeAnnotation={activeAnnotation}
        onAnnotationClick={onAnnotationClick}
        onAnnotationDelete={onAnnotationDelete}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={controlsEnabled}
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
