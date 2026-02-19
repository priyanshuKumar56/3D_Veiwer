/**
 * SceneLoader — Wireframe octahedron placeholder shown while model loads.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function SceneLoader() {
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
