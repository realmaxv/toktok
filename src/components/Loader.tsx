// src/components/Loader.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import logoUrl from '../assets/logo.svg';

interface Stone {
  id: number;
  size: number;
  angle: number; // Startwinkel
  distance: number; // Orbit-Radius
  clipPath: string; // Stein-Form
  speed: number; // Umlauf-Dauer
  explodeX: number; // Explosions-Verschiebung X
  explodeY: number; // Explosions-Verschiebung Y
}

const blobShapes = [
  'polygon(50% 0%, 100% 25%, 75% 100%, 25% 100%, 0% 30%)',
  'polygon(0% 40%, 20% 0%, 80% 10%, 100% 50%, 70% 100%, 30% 90%)',
  'polygon(10% 20%, 90% 0%, 100% 60%, 60% 100%, 0% 80%)',
];

const generateStones = (count: number): Stone[] =>
  Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * 360;
    const distance = 50 + Math.random() * 70;
    const explodeRadius = 200 + Math.random() * 100;
    const rad = (angle * Math.PI) / 180;
    return {
      id: i,
      size: 12 + Math.random() * 16,
      angle,
      distance,
      clipPath: blobShapes[Math.floor(Math.random() * blobShapes.length)],
      speed: 2 + Math.random() * 1.5,
      explodeX: explodeRadius * Math.cos(rad),
      explodeY: explodeRadius * Math.sin(rad),
    };
  });

const stoneVariants: Variants = {
  init: (s: Stone) => ({ rotate: s.angle }),
  orbit: (s: Stone) => ({
    rotate: s.angle + 360,
    transition: { repeat: Infinity, ease: 'linear', duration: s.speed },
  }),
  explode: (s: Stone) => ({
    x: s.explodeX,
    y: s.explodeY,
    opacity: 0,
    scale: 2,
    transition: { duration: 1, ease: 'easeOut' },
  }),
};

export const Loader: React.FC<{ maxStones?: number }> = ({
  maxStones = 10,
}) => {
  const [exploding, setExploding] = useState(false);

  // Trigger Explosion nach 1 Sekunde
  useEffect(() => {
    const t = setTimeout(() => setExploding(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const stones = useMemo(() => {
    const min = 20;
    const max = Math.max(min, maxStones);
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    return generateStones(count);
  }, [maxStones]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black z-50"
      style={{ pointerEvents: 'none' }}
    >
      {stones.map((s) => {
        const color = s.id % 2 === 0 ? '#FF7185' : '#FFB8C2';
        return (
          <motion.div
            key={s.id}
            custom={s}
            variants={stoneVariants}
            initial="init"
            animate={exploding ? 'explode' : 'orbit'}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              transformOrigin: '0 0',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: s.distance,
                top: -s.size / 2,
                width: s.size,
                height: s.size,
                backgroundColor: color,
                clipPath: s.clipPath,
              }}
            />
          </motion.div>
        );
      })}

      <motion.img
        src={logoUrl}
        alt="Logo"
        initial={{ scale: 1, opacity: 1 }}
        animate={
          exploding
            ? { scale: 3, opacity: 0 }
            : { scale: [1, 1.15, 1, 1.15, 1] }
        }
        transition={
          exploding
            ? { duration: 1, ease: 'easeOut' }
            : {
                duration: 1.2,
                times: [0, 0.15, 0.3, 0.45, 1],
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        style={{ width: 80, height: 80, transformOrigin: '50% 50%' }}
        className="z-10"
      />
    </div>
  );
};

export default React.memo(Loader);
