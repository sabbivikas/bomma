
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import { Mesh } from 'three';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// The 3D model that uses the doodle as a texture
const DoodleModel = ({ imageUrl }: { imageUrl: string }) => {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(imageUrl);
  
  // Simple rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[3, 3, 0.1]} />
      <meshStandardMaterial>
        <primitive attach="map" object={texture} />
      </meshStandardMaterial>
    </mesh>
  );
};

interface DoodleViewer3DProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const DoodleViewer3D: React.FC<DoodleViewer3DProps> = ({ 
  imageUrl, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl h-[80vh] rounded-lg overflow-hidden">
        <Button 
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <PerspectiveCamera makeDefault position={[0, 0, 6]} />
          <OrbitControls enableZoom={true} autoRotate={false} />
          <DoodleModel imageUrl={imageUrl} />
        </Canvas>
      </div>
    </div>
  );
};

export default DoodleViewer3D;
