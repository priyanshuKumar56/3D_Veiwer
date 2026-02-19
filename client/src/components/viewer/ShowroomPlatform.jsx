/**
 * ShowroomPlatform — Circular platform that scales to model size.
 * Includes ground shadow, glowing rim, accent ring, and radial tick marks.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ShowroomPlatform({ platformRadius, lightColor }) {
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

  const lineThick = platformRadius * 0.008;
  const lineThin = platformRadius * 0.004;

  return (
    <group position={[0, 0.01, 0]}>
      {/* Large ground shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <circleGeometry args={[platformRadius * 2.2, 64]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.5} depthWrite={false} />
      </mesh>

      {/* Soft fade ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]}>
        <ringGeometry args={[platformRadius * 1.5, platformRadius * 2.2, 64]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* Main platform disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[platformRadius * 1.08, 64]} />
        <meshStandardMaterial color="#080810" metalness={0.7} roughness={0.25} envMapIntensity={0.3} />
      </mesh>

      {/* Subtle center glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[platformRadius * 0.35, 32]} />
        <meshBasicMaterial color={lightColor} transparent opacity={0.05} depthWrite={false} />
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
