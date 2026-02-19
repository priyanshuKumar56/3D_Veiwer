/**
 * Model — Loads a GLB/GLTF model, normalizes it, and handles
 * entrance animations, wireframe, and material color overrides.
 */
import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function Model({
  url,
  wireframe,
  materialColor,
  materialPreset,
  onSizeCalculated,
  controlsRef,
  onControlsReady,
  onClick, // We'll use this prop for onPointerDown too
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef();
  const { camera } = useThree();
  const hasCentered = useRef(false);
  const originalMaterials = useRef(new Map());
  const prevSceneRef = useRef(null);

  /* ── Clone scene & dispose previous ──── */
  const clonedScene = useMemo(() => {
    if (prevSceneRef.current) {
      prevSceneRef.current.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
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

  /* ── Normalize & center model ──────── */
  const setupData = useRef(null);
  const setupFramesLeft = useRef(0);

  useEffect(() => {
    if (!clonedScene || hasCentered.current) return;
    hasCentered.current = true;

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());

    const TARGET_SIZE = 2;
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = TARGET_SIZE / maxDim;
    clonedScene.scale.setScalar(scaleFactor);

    const scaledBox = new THREE.Box3().setFromObject(clonedScene);
    const scaledSize = scaledBox.getSize(new THREE.Vector3());
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

    clonedScene.position.set(-scaledCenter.x, -scaledBox.min.y, -scaledCenter.z);

    const lookY = scaledSize.y * 0.45;
    const camDist = TARGET_SIZE * 2.8;
    const camPos = [camDist * 0.7, camDist * 0.4, camDist * 0.9];
    const target = [0, lookY, 0];

    setupData.current = { camPos, target, TARGET_SIZE };
    setupFramesLeft.current = 10;

    camera.position.set(...camPos);
    camera.near = 0.01;
    camera.far = 500;
    camera.updateProjectionMatrix();
    camera.lookAt(...target);

    const footprint = Math.max(scaledSize.x, scaledSize.z);
    if (onSizeCalculated) {
      onSizeCalculated({ maxDim: TARGET_SIZE, footprint, height: scaledSize.y });
    }
  }, [clonedScene, camera, onSizeCalculated]);

  /* ── Force camera for several frames ── */
  useFrame(() => {
    if (setupFramesLeft.current <= 0 || !setupData.current) return;
    const ctrl = controlsRef?.current;
    if (!ctrl) return;

    const { camPos, target, TARGET_SIZE } = setupData.current;
    ctrl.target.set(...target);
    camera.position.set(...camPos);
    ctrl.minDistance = TARGET_SIZE * 0.8;
    ctrl.maxDistance = TARGET_SIZE * 6;
    ctrl.minPolarAngle = Math.PI * 0.1;
    ctrl.maxPolarAngle = Math.PI * 0.48;
    ctrl.enableDamping = false;
    ctrl.update();

    setupFramesLeft.current -= 1;

    if (setupFramesLeft.current === 0) {
      if (ctrl) ctrl.enableDamping = true;
      setupData.current = null;
      if (onControlsReady) onControlsReady();
    }
  });

  /* ── Cleanup on unmount ───────────────── */
  useEffect(() => {
    return () => {
      if (prevSceneRef.current) {
        prevSceneRef.current.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((mat) => mat.dispose());
            }
          }
        });
      }
      useGLTF.clear(url);
    };
  }, [url]);

  /* ── Wireframe + material color + texture preset ── */
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Robustness: ensure meshes receive events if primitive fails
        child.userData.onClick = onClick;

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
          // Apply material texture preset
          if (materialPreset) {
            if (materialPreset.metalness !== undefined) mat.metalness = materialPreset.metalness;
            if (materialPreset.roughness !== undefined) mat.roughness = materialPreset.roughness;
            if (materialPreset.emissiveIntensity !== undefined) mat.emissiveIntensity = materialPreset.emissiveIntensity;
            if (materialPreset.clearcoat !== undefined && mat.clearcoat !== undefined) mat.clearcoat = materialPreset.clearcoat;
          } else {
            // Reset to sensible defaults when no preset
            mat.metalness = mat.metalness ?? 0.5;
            mat.roughness = mat.roughness ?? 0.5;
            mat.emissiveIntensity = 0;
          }
        });
      }
    });
  }, [clonedScene, wireframe, materialColor, materialPreset, onClick]);

  /* ── Entrance animation ──────────────── */
  const animProgress = useRef(0);
  const isAnimating = useRef(true);
  const meshMaterials = useRef([]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.y = 0;
      groupRef.current.scale.set(0.8, 0.8, 0.8);

      const mats = [];
      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          const matArr = Array.isArray(child.material) ? child.material : [child.material];
          matArr.forEach((mat) => {
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

    const s = THREE.MathUtils.lerp(0.8, 1, ease);
    groupRef.current.scale.set(s, s, s);

    for (const mat of meshMaterials.current) {
      mat.opacity = ease;
      if (t >= 1) mat.transparent = false;
    }

    if (t >= 1) isAnimating.current = false;
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={clonedScene}
        castShadow
        onPointerDown={onClick} 
      />
    </group>
  );
}
