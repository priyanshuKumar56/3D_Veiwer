/**
 * SceneContent — Composes all 3D elements inside the Canvas.
 * Manages OrbitControls, lighting, platform, and the model.
 */
import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';

import ShowroomLights from './ShowroomLights';
import ShowroomPlatform from './ShowroomPlatform';
import Model from './Model';
import SceneLoader from './SceneLoader';

export default function SceneContent({
  modelUrl,
  wireframe,
  materialColor,
  spotColor,
  onSizeCalculated,
  platformRadius,
  onModelLoaded,
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

  return (
    <>
      <ShowroomLights lightColor={spotColor} platformRadius={platformRadius} />
      <Environment preset="night" />
      <ShowroomPlatform platformRadius={platformRadius} lightColor={spotColor} />

      <Suspense fallback={<SceneLoader />}>
        {modelUrl ? (
          <Model
            url={modelUrl}
            wireframe={wireframe}
            materialColor={materialColor}
            controlsRef={controlsRef}
            onControlsReady={handleControlsReady}
            onSizeCalculated={(data) => {
              onSizeCalculated(data);
              if (onModelLoaded) onModelLoaded();
            }}
          />
        ) : (
          <SceneLoader />
        )}
      </Suspense>

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
