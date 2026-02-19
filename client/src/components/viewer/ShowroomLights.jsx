/**
 * ShowroomLights — Multi-directional lighting rig for the 3D viewer.
 */
export default function ShowroomLights({ lightColor, platformRadius }) {
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
