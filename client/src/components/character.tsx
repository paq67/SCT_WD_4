import { useEffect, useRef } from 'react';
import { Application, Sprite } from 'pixi.js';
import { Stage, Layer, Image } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterStore, type Emotion } from '@/lib/characterStore';

const SPRITE_STATES: Record<Emotion, string> = {
  idle: "https://api.dicebear.com/7.x/adventurer/svg?seed=idle",
  happy: "https://api.dicebear.com/7.x/adventurer/svg?seed=happy",
  sad: "https://api.dicebear.com/7.x/adventurer/svg?seed=sad",
  excited: "https://api.dicebear.com/7.x/adventurer/svg?seed=excited"
};

interface CharacterProps {
  level: number;
  onLevelUp?: () => void;
}

export default function Character({ level, onLevelUp }: CharacterProps) {
  const pixiRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application>();
  const { emotion, equippedItems } = useCharacterStore();

  // Initialize PixiJS
  useEffect(() => {
    if (!pixiRef.current) return;

    // Create PixiJS application if it doesn't exist
    if (!appRef.current) {
      appRef.current = new Application({
        width: 400,
        height: 400,
        backgroundColor: 0x00000000,
        antialias: true,
      });
      if (appRef.current.canvas) {
        pixiRef.current.appendChild(appRef.current.canvas);
      }
    }

    // Load character sprite based on emotion
    const sprite = Sprite.from(SPRITE_STATES[emotion]);
    sprite.anchor.set(0.5);
    sprite.x = appRef.current.screen.width / 2;
    sprite.y = appRef.current.screen.height / 2;
    sprite.scale.set(0.8);

    appRef.current.stage.addChild(sprite);

    return () => {
      appRef.current?.stage.removeChild(sprite);
    };
  }, [emotion]);

  return (
    <div className="relative aspect-square max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full relative"
      >
        {/* Base character rendered with PixiJS */}
        <div ref={pixiRef} className="absolute inset-0" />

        {/* Customization layer with Konva */}
        <Stage width={400} height={400} className="absolute inset-0">
          <Layer>
            {/* Render equipped items */}
            {Object.entries(equippedItems).map(([slot, item]) => {
              if (!item) return null;
              return (
                <Image
                  key={slot}
                  image={new window.Image()}
                  src={item}
                  width={100}
                  height={100}
                  x={150}
                  y={150}
                />
              );
            })}
          </Layer>
        </Stage>

        <AnimatePresence>
          {level && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium"
            >
              Level {level}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}