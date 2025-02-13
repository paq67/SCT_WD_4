import { useEffect, useRef } from 'react';
import { Application, Assets, Sprite } from 'pixi.js';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const { emotion, equippedItems } = useCharacterStore();

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current) return;

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    containerRef.current.appendChild(canvas);

    // Initialize PixiJS application
    const app = new Application({
      view: canvas,
      width: 400,
      height: 400,
      backgroundColor: 0x00000000,
      antialias: true,
    });

    appRef.current = app;

    // Load and create sprite
    const loadSprite = async () => {
      try {
        const sprite = Sprite.from(SPRITE_STATES[emotion]);
        sprite.anchor.set(0.5);
        sprite.x = app.screen.width / 2;
        sprite.y = app.screen.height / 2;
        sprite.scale.set(0.8);
        app.stage.addChild(sprite);
      } catch (error) {
        console.error('Error loading sprite:', error);
      }
    };

    loadSprite();

    // Cleanup
    return () => {
      app.destroy(true, { children: true, texture: true, baseTexture: true });
      if (containerRef.current?.contains(canvas)) {
        containerRef.current.removeChild(canvas);
      }
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
        <div ref={containerRef} className="absolute inset-0" />

        {/* Customization layer with Konva */}
        <Stage width={400} height={400} className="absolute inset-0">
          <Layer>
            {/* Render equipped items */}
            {Object.entries(equippedItems).map(([slot, item]) => {
              if (!item) return null;
              const image = new window.Image();
              image.src = item;
              return (
                <Image
                  key={slot}
                  image={image}
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