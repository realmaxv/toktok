// src/components/Spinner.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface SpinnerProps {
  /** Durchmesser des Spinners in px */
  size?: number;
  /** Anzahl der Balken */
  barCount?: number;
  /** Breite jedes Balkens in px */
  barWidth?: number;
  /** Höhe jedes Balkens in px */
  barHeight?: number;
  /** Farbe der Balken */
  color?: string;
  /** Dauer einer Umdrehung in Sekunden */
  speed?: number;
}

/**
 * Dezenter Spinner im Stil von .lds-spinner.
 * Transparenter Hintergrund und blockiert keine Interaktionen.
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = 40, // kleinerer Default-Durchmesser
  barCount = 12,
  barWidth = 4,
  barHeight = 11,
  color = '#808080',
  speed = 1.2,
}) => {
  const angleStep = 360 / barCount;
  const bars = Array.from({ length: barCount }, (_, i) => i);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        pointerEvents: 'none',
        background: 'transparent', // transparent bleibt der Hintergrund sichtbar
      }}
    >
      {bars.map((i) => {
        // Verzögerung analog zu CSS-Delay
        const delay = -(speed - i * (speed / barCount));
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: barWidth,
              height: barHeight,
              backgroundColor: color,
              borderRadius: '20%',
              top: size / 2 - barHeight / 2,
              left: size / 2 - barWidth / 2,
              transform: `rotate(${i * angleStep}deg) translateY(-${
                size / 2 - barHeight / 2
              }px)`,
              transformOrigin: 'center center',
            }}
            animate={{ opacity: [1, 0] }}
            transition={{
              repeat: Infinity,
              duration: speed,
              ease: 'linear',
              delay,
            }}
          />
        );
      })}
    </div>
  );
};

export default React.memo(Spinner);
