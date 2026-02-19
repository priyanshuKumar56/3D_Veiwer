import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Stage, PresentationControls, Float, Html, useProgress } from '@react-three/drei';

/* ── Inline 3D model loader ───────────── */
function HeroModel(props) {
  const { scene } = useGLTF('/3dmodel/sport.glb');
  return <primitive object={scene} {...props} />;
}

function Loader() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="hero-loader" style={{ position: 'absolute', zIndex: 10, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <div className="spinner"></div>
      <span>{progress.toFixed(0)}% Loading</span>
    </div>
  );
}

export default function HeroSection({ onOpenViewer, onScrollToConsole }) {
  return (
    <section className="hero">
      {/* copy */}
      <div className="hero-copy">
        <div className="hero-label">Real-time 3D Garment Engine</div>
        <h1 className="hero-h1">
          Digital<br />
          <em>Tangibility.</em>
        </h1>
        <p className="hero-sub">
          The bridge between imagination and fabrication.
          Generate physics-accurate garments in real-time.
        </p>
        <div className="hero-cta">
          <button className="btn-white" onClick={onOpenViewer}>Open Console</button>
          <button className="btn-ghost" onClick={onScrollToConsole}>
            Documentation
          </button>
        </div>
      </div>

      {/* 3D T-shirt art */}
      <div className="hero-art" style={{ position: 'relative' }}>
        <Loader />
        <Canvas dpr={[1, 2]} camera={{ fov: 45 }} style={{ background: 'transparent' }}>
          <Suspense fallback={null}>
            <PresentationControls
              speed={1.5}
              zoom={0.5}
              polar={[-0.1, Math.PI / 4]}
            >
              <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <Stage environment="city" intensity={0.5} contactShadow={false}>
                  <HeroModel scale={0.01} />
                </Stage>
              </Float>
            </PresentationControls>
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
