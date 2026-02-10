import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Token Node Component
const TokenNode = ({ position, color, text, index, level = 0, hoverText = '' }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + index) * 0.0008;
    }
  });

  const nodeSize = Math.max(0.15, Math.min(0.45, 0.15 + level * 0.08));

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[nodeSize, 24, 24]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.95 : 0.5}
          metalness={0.85}
          roughness={0.15}
          wireframe={false}
        />
      </Sphere>

      {(hovered || text.length <= 3) && (
        <Text
          position={[0, nodeSize + 0.4, 0]}
          fontSize={Math.max(0.14, nodeSize * 1.6)}
          color="#ffffff"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {text}
        </Text>
      )}

      {hovered && hoverText && (
        <Text
          position={[0, -(nodeSize + 0.5), 0]}
          fontSize={0.11}
          color="#90ee90"
          anchorX="center"
          anchorY="top"
        >
          {hoverText}
        </Text>
      )}
    </group>
  );
};

// Connection Line Component
const Connection = ({ start, end, isHighlight }) => {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);

  return (
    <Line
      points={points}
      color={isHighlight ? '#10b981' : '#3b82f6'}
      lineWidth={isHighlight ? 3 : 2}
      transparent
      opacity={isHighlight ? 0.85 : 0.5}
      dashed={false}
    />
  );
};

// Main Scene Component
const Scene = ({ tokens, mergeHistory, inputText }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0003;
    }
  });

  // Build hierarchical tree showing merge process
  const { nodes, connections } = useMemo(() => {
    const nodes = [];
    const connections = [];
    const nodeMap = new Map();

    // Level 0: Original characters
    const chars = Array.from(inputText);
    const charWidth = Math.max(8, chars.length * 0.8);

    chars.forEach((char, i) => {
      const x = (i - chars.length / 2) * (charWidth / chars.length);
      const y = 0;
      const z = 0;

      const node = {
        id: `char-${i}`,
        text: char === ' ' ? '·' : char,
        fullText: char,
        position: [x, y, z],
        level: 0,
        color: new THREE.Color().setHSL(0.15, 0.4, 0.65),
        isCharacter: true,
        index: i
      };
      nodes.push(node);
      nodeMap.set(node.id, node);
    });

    // Process merge history to build tree
    if (mergeHistory && mergeHistory.length > 0) {
      const mergeMap = new Map();
      let mergeIndex = 0;

      mergeHistory.forEach((merge, idx) => {
        const mergeId = `merge-${idx}`;
        const parentText = merge.text || '?';
        const children = merge.children || [];

        // Calculate average position of children
        let avgX = 0;
        let childCount = 0;

        children.forEach(childId => {
          const child = nodeMap.get(childId);
          if (child) {
            avgX += child.position[0];
            childCount++;
          }
        });

        if (childCount > 0) {
          avgX /= childCount;

          // Determine level based on the children's levels
          let childLevel = 0;
          children.forEach(childId => {
            const child = nodeMap.get(childId);
            if (child) {
              childLevel = Math.max(childLevel, child.level);
            }
          });

          const y = (childLevel + 1) * 2.2;

          const node = {
            id: mergeId,
            text: parentText.length > 4 ? parentText.substring(0, 4) + '...' : parentText,
            fullText: parentText,
            position: [avgX, y, 0],
            level: childLevel + 1,
            color: new THREE.Color().setHSL(0.5 + (childLevel + 1) * 0.06, 0.65, 0.55),
            isMerge: true,
            index: mergeIndex++
          };

          nodes.push(node);
          nodeMap.set(mergeId, node);

          // Create connections
          children.forEach(childId => {
            const child = nodeMap.get(childId);
            if (child) {
              connections.push({
                id: `con-${childId}-${mergeId}`,
                start: child.position,
                end: node.position,
                isHighlight: false
              });
            }
          });

          mergeMap.set(mergeId, node);
        }
      });
    }

    // Add final token nodes at the top
    const maxLevel = Math.max(0, ...nodes.map(n => n.level));
    const finalTokenCount = tokens.length;
    const tokenSpacing = Math.max(1.5, charWidth / finalTokenCount);

    tokens.forEach((token, i) => {
      const tokenText = typeof token === 'string' ? token : token.text || '?';
      const x = (i - finalTokenCount / 2) * tokenSpacing;
      const y = (maxLevel + 2) * 2.2;

      const node = {
        id: `final-${i}`,
        text: tokenText.length > 6 ? tokenText.substring(0, 6) + '...' : tokenText,
        fullText: tokenText,
        position: [x, y, 0],
        level: maxLevel + 2,
        color: new THREE.Color().setHSL(0.05, 0.8, 0.6),
        isFinal: true,
        index: i
      };
      nodes.push(node);
      nodeMap.set(node.id, node);
    });

    return { nodes, connections };
  }, [tokens, mergeHistory, inputText]);

  return (
    <group ref={groupRef}>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <pointLight position={[15, 20, 15]} intensity={1.2} />
      <pointLight position={[-15, -10, -15]} intensity={0.7} color="#3b82f6" />
      <pointLight position={[10, -10, 10]} intensity={0.5} color="#10b981" />

      {/* Connections */}
      {connections.map(conn => (
        <Connection key={conn.id} start={conn.start} end={conn.end} isHighlight={conn.isHighlight} />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <TokenNode
          key={node.id}
          position={node.position}
          color={node.color}
          text={node.text}
          index={i}
          level={node.level}
          hoverText={node.fullText.length > node.text.length ? node.fullText : node.isFinal ? 'Final Token' : 'Merged'}
        />
      ))}

      {/* Grid reference */}
      <gridHelper args={[40, 20]} position={[0, -2, 0]} />
    </group>
  );
};

export const Network3D = ({ tokens, mergeHistory, inputText = '' }) => {
  if (!tokens || tokens.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto px-4 py-16"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-apple-gray-900">Token Merge Tree</h2>
        <p className="text-lg text-apple-gray-600">
          See how characters combine through BPE merges to form final tokens
        </p>
      </div>

      <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl relative" style={{ height: '700px' }}>
        <Canvas
          camera={{ position: [0, 5, 20], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#0a0a0a']} />
          <fog attach="fog" args={['#0a0a0a', 5, 50]} />
          <Scene tokens={tokens} mergeHistory={mergeHistory} inputText={inputText} />
          <OrbitControls
            enableDamping
            dampingFactor={0.08}
            rotateSpeed={0.4}
            enableZoom={true}
            zoomSpeed={1.2}
            enablePan={true}
            panSpeed={0.5}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-center">
          <p className="text-sm text-gray-300">
            <span className="text-blue-400">●</span> Characters →{' '}
            <span className="text-purple-400">●</span> Merged Pairs →{' '}
            <span className="text-red-400">●</span> Final Tokens
          </p>
          <p className="text-xs text-gray-500 mt-2">Drag to rotate • Scroll to zoom • Right-click to pan</p>
        </div>
      </div>
    </motion.div>
  );
};
