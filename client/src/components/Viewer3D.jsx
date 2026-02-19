import { Suspense, useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import "../viewer-styles.css"

// ============================================
// SHOWROOM PLATFORM — scales to model size
// ============================================
function ShowroomPlatform({ platformRadius, lightColor }) {
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.12;
    }
  });

  const ticks = 60;
  const tickGeometries = useMemo(() => {
    const items = [];
    for (let i = 0; i < ticks; i++) {
      const angle = (i / ticks) * Math.PI * 2;
      const isLong = i % 5 === 0;
      const innerR = isLong ? platformRadius * 0.48 : platformRadius * 0.62;
      const outerR = platformRadius * 0.95;
      items.push({ angle, innerR, outerR, index: i, isLong });
    }
    return items;
  }, [platformRadius]);

  // Scale line widths relative to the platform
  const lineThick = platformRadius * 0.008;
  const lineThin = platformRadius * 0.004;

  return (
    <group position={[0, 0.01, 0]}>
      {/* Large ground shadow that blends into the floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <circleGeometry args={[platformRadius * 2.2, 64]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Soft fade ring around the shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]}>
        <ringGeometry args={[platformRadius * 1.5, platformRadius * 2.2, 64]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>

      {/* Main platform disc — dark, reflective */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[platformRadius * 1.08, 64]} />
        <meshStandardMaterial
          color="#080810"
          metalness={0.7}
          roughness={0.25}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Subtle center glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[platformRadius * 0.35, 32]} />
        <meshBasicMaterial
          color={lightColor}
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>

      {/* Outer glowing rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[platformRadius * 1.04, platformRadius * 1.08, 64]} />
        <meshStandardMaterial
          color={lightColor}
          emissive={lightColor}
          emissiveIntensity={0.35}
          transparent
          opacity={0.55}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Inner accent ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <ringGeometry args={[platformRadius * 0.44, platformRadius * 0.46, 64]} />
        <meshStandardMaterial
          color={lightColor}
          emissive={lightColor}
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Radial tick marks */}
      <group ref={ringRef} position={[0, 0.012, 0]}>
        {tickGeometries.map(({ angle, innerR, outerR, index, isLong }) => {
          const x1 = Math.cos(angle) * innerR;
          const z1 = Math.sin(angle) * innerR;
          const x2 = Math.cos(angle) * outerR;
          const z2 = Math.sin(angle) * outerR;
          const length = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
          const cx = (x1 + x2) / 2;
          const cz = (z1 + z2) / 2;

          return (
            <mesh
              key={index}
              position={[cx, 0, cz]}
              rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
            >
              <planeGeometry args={[isLong ? lineThick : lineThin, length]} />
              <meshBasicMaterial
                color={isLong ? '#555566' : '#2a2a38'}
                transparent
                opacity={isLong ? 0.7 : 0.4}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// ============================================
// SHOWROOM LIGHTS
// ============================================
function ShowroomLights({ lightColor, platformRadius }) {
  return (
    <>
      <directionalLight
        position={[platformRadius * 2, platformRadius * 3.5, platformRadius * 2.5]}
        intensity={1.8}
        color={lightColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[-platformRadius * 3, platformRadius * 2, platformRadius]}
        intensity={0.7}
        color="#c0d0e8"
      />
      <directionalLight
        position={[platformRadius * 0.5, platformRadius * 2, -platformRadius * 3.5]}
        intensity={0.9}
        color="#e0e0f0"
      />
      <spotLight
        position={[0, platformRadius * 6, 0]}
        angle={0.5}
        penumbra={1}
        intensity={1.2}
        color={lightColor}
        castShadow={false}
      />
      <ambientLight intensity={0.15} color="#1a1a2e" />
      <hemisphereLight args={['#20203a', '#080810', 0.4]} />
    </>
  );
}

// ============================================
// MODEL — reports its size for platform scaling
// ============================================
function Model({ url, wireframe, materialColor, onSizeCalculated, controlsRef, onControlsReady }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();
  const { camera } = useThree();
  const hasCentered = useRef(false);
  const originalMaterials = useRef(new Map());
  const prevSceneRef = useRef(null);

  const clonedScene = useMemo(() => {
    // Dispose previous clone to free GPU memory (prevents Context Lost)
    if (prevSceneRef.current) {
      prevSceneRef.current.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(mat => {
              if (mat.map) mat.map.dispose();
              if (mat.normalMap) mat.normalMap.dispose();
              if (mat.roughnessMap) mat.roughnessMap.dispose();
              if (mat.metalnessMap) mat.metalnessMap.dispose();
              if (mat.emissiveMap) mat.emissiveMap.dispose();
              if (mat.aoMap) mat.aoMap.dispose();
              mat.dispose();
            });
          }
        }
      });
    }

    // Reset centering flag so new model gets positioned
    hasCentered.current = false;
    originalMaterials.current.clear();

    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat, i) => {
          const key = `${child.uuid}_${i}`;
          originalMaterials.current.set(key, mat.color ? mat.color.clone() : new THREE.Color('#ffffff'));
        });
      }
    });

    prevSceneRef.current = cloned;
    return cloned;
  }, [scene]);

  // Normalize model to standard size + set fixed camera position
  // Every model gets scaled to the same size, so camera works identically for all

  // Store setup data for useFrame to apply over multiple frames
  const setupData = useRef(null);
  const setupFramesLeft = useRef(0);

  useEffect(() => {
    if (!clonedScene || hasCentered.current) return;
    hasCentered.current = true;

    // --- 1. Measure the model's original size ---
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());

    // --- 2. Normalize: scale model so its largest dimension = TARGET_SIZE ---
    const TARGET_SIZE = 2;
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = TARGET_SIZE / maxDim;

    clonedScene.scale.setScalar(scaleFactor);

    // --- 3. Re-measure after scaling ---
    const scaledBox = new THREE.Box3().setFromObject(clonedScene);
    const scaledSize = scaledBox.getSize(new THREE.Vector3());
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

    // --- 4. Center on platform: X/Z centered, bottom at y=0 ---
    clonedScene.position.set(
      -scaledCenter.x,
      -scaledBox.min.y,
      -scaledCenter.z
    );

    // --- 5. Store fixed camera values for useFrame to apply ---
    const lookY = scaledSize.y * 0.45;
    const camDist = TARGET_SIZE * 2.8;
    const camPos = [camDist * 0.7, camDist * 0.4, camDist * 0.9];
    const target = [0, lookY, 0];

    setupData.current = { camPos, target, TARGET_SIZE };
    setupFramesLeft.current = 10; // Force for 10 frames to overpower any interference

    // Set camera immediately too
    camera.position.set(...camPos);
    camera.near = 0.01;
    camera.far = 500;
    camera.updateProjectionMatrix();
    camera.lookAt(...target);

    // Tell parent about model size for platform scaling
    const footprint = Math.max(scaledSize.x, scaledSize.z);
    if (onSizeCalculated) {
      onSizeCalculated({ maxDim: TARGET_SIZE, footprint, height: scaledSize.y });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedScene, camera]);

  // useFrame: Force camera position for several frames after model loads
  // This overpowers OrbitControls damping/defaults that cause reload differences
  useFrame(() => {
    if (setupFramesLeft.current <= 0 || !setupData.current) return;

    const ctrl = controlsRef?.current;
    if (!ctrl) return;

    const { camPos, target, TARGET_SIZE } = setupData.current;

    // Force camera and controls to exact position every frame
    ctrl.target.set(...target);
    camera.position.set(...camPos);

    // Set limits
    ctrl.minDistance = TARGET_SIZE * 0.8;
    ctrl.maxDistance = TARGET_SIZE * 6;
    ctrl.minPolarAngle = Math.PI * 0.1;
    ctrl.maxPolarAngle = Math.PI * 0.48;

    // Disable damping temporarily so controls don't fight us
    ctrl.enableDamping = false;
    ctrl.update();

    setupFramesLeft.current -= 1;

    // On the LAST frame, finalize everything
    if (setupFramesLeft.current === 0) {
      ctrl.enableDamping = true;
      ctrl.autoRotate = true;
      setupData.current = null;

      // Enable controls
      if (onControlsReady) onControlsReady();
    }
  });

  // Cleanup on unmount — dispose everything
  useEffect(() => {
    return () => {
      if (prevSceneRef.current) {
        prevSceneRef.current.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach(mat => mat.dispose());
            }
          }
        });
      }
      // Clear useGLTF cache for this URL to free memory
      useGLTF.clear(url);
    };
  }, [url]);

  // Wireframe + material color — position NOT touched
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat, i) => {
          mat.wireframe = wireframe;
          const key = `${child.uuid}_${i}`;
          if (materialColor) {
            mat.color.set(materialColor);
          } else {
            const orig = originalMaterials.current.get(key);
            if (orig) mat.color.copy(orig);
          }
        });
      }
    });
  }, [clonedScene, wireframe, materialColor]);

  // Elegant entrance animation — scale in + fade in ONLY (no Y movement)
  // Y position is handled by centering logic above, never touched by animation
  const animProgress = useRef(0);
  const isAnimating = useRef(true);
  const meshMaterials = useRef([]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.y = 0;
      groupRef.current.scale.set(0.8, 0.8, 0.8);

      // Cache all mesh materials ONCE (avoid traversing every frame)
      const mats = [];
      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          const matArr = Array.isArray(child.material) ? child.material : [child.material];
          matArr.forEach(mat => {
            mat.transparent = true;
            mat.opacity = 0;
            mats.push(mat);
          });
        }
      });
      meshMaterials.current = mats;
      animProgress.current = 0;
      isAnimating.current = true;
    }
  }, [clonedScene]);

  useFrame((_, delta) => {
    if (!isAnimating.current || !groupRef.current) return;

    animProgress.current += delta * 0.9;
    const t = Math.min(animProgress.current, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    // Scale up from 0.8 → 1.0
    const s = THREE.MathUtils.lerp(0.8, 1, ease);
    groupRef.current.scale.set(s, s, s);

    // Fade in using cached materials (no traverse!)
    for (const mat of meshMaterials.current) {
      mat.opacity = ease;
      if (t >= 1) mat.transparent = false;
    }

    if (t >= 1) isAnimating.current = false;
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} castShadow />
    </group>
  );
}

// ============================================
// LOADER
// ============================================
function Loader() {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.rotation.x += delta * 0.5;
    }
  });
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  );
}

// ============================================
// SCENE CONTENT — inside Canvas
// ============================================
function SceneContent({ modelUrl, wireframe, materialColor, spotColor, onSizeCalculated, platformRadius, onModelLoaded }) {
  const controlsRef = useRef();
  const [controlsEnabled, setControlsEnabled] = useState(false);

  // Reset controls when model changes (disable until new model is set up)
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

      <Suspense fallback={<Loader />}>
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
          <Loader />
        )}
      </Suspense>

      {/* Controls: completely DISABLED until model setup is done */}
      {/* This prevents OrbitControls from moving the camera before our code runs */}
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

// ============================================
// LOADING OVERLAY — elegant showroom loading screen
// ============================================
function LoadingOverlay({ message }) {
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

// ============================================
// MAIN VIEWER
// ============================================
export default function Viewer3D({ modelUrl, backgroundColor, wireframe, materialColor, lightColor }) {
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
    // Small delay so entrance animation can start
    setTimeout(() => setModelLoading(false), 300);
  }, []);

  return (
    <div
      className="viewer-canvas"
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Layer 0: Showroom photo background */}
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

      {/* Layer 1: Color tint overlay */}
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

      {/* Layer 2: Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(0,0,0,0.55) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

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
            spotColor={spotColor}
            platformRadius={platformRadius}
            onSizeCalculated={handleSizeCalculated}
            onModelLoaded={handleModelLoaded}
          />
        </Canvas>
      </div>

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
