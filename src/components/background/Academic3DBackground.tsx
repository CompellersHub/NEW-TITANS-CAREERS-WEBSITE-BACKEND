import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

function AcademicObjects() {
  return (
    <group>
      {/* Floating Books */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[-3, 2, -5]}>
          <boxGeometry args={[0.8, 1.2, 0.2]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh position={[4, -1, -8]}>
          <boxGeometry args={[0.8, 1.2, 0.2]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </Float>

      {/* Graduation Caps */}
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
        <group position={[2, 3, -6]}>
          <mesh>
            <boxGeometry args={[1.2, 0.1, 1.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.5, 32]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </Float>

      {/* Geometric Shapes - Academic Theme */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.4}>
        <mesh position={[-2, -2, -7]}>
          <octahedronGeometry args={[0.6]} />
          <meshStandardMaterial color="#f59e0b" wireframe />
        </mesh>
      </Float>

      <Float speed={1.6} rotationIntensity={0.5} floatIntensity={0.7}>
        <mesh position={[5, 1, -9]}>
          <torusGeometry args={[0.5, 0.2, 16, 32]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>
      </Float>

      {/* Scrolls/Diplomas */}
      <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh position={[-4, -1, -6]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 32]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </Float>
    </group>
  );
}

interface Academic3DBackgroundProps {
  intensity?: 'subtle' | 'medium' | 'prominent';
}

export function Academic3DBackground({ intensity = 'subtle' }: Academic3DBackgroundProps) {
  const opacityMap = {
    subtle: 0.15,
    medium: 0.3,
    prominent: 0.5,
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: opacityMap[intensity] }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#f59e0b" />
          
          {/* Stars Background */}
          <Stars 
            radius={100} 
            depth={50} 
            count={1000} 
            factor={4} 
            saturation={0} 
            fade 
          />
          
          {/* Academic Objects */}
          <AcademicObjects />
          
          {/* Gentle Camera Controls */}
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
