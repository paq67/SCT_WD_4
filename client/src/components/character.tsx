import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterStore, type Emotion } from '@/lib/characterStore';

const EMOTIONS: Record<Emotion, string> = {
  idle: '😊',
  happy: '😄',
  sad: '😢',
  excited: '🤩'
};

interface CharacterProps {
  level: number;
  onLevelUp?: () => void;
}

export default function Character({ level, onLevelUp }: CharacterProps) {
  const { emotion } = useCharacterStore();

  return (
    <div className="relative aspect-square max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full relative flex items-center justify-center"
      >
        <motion.div
          key={emotion}
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="text-9xl"
        >
          {EMOTIONS[emotion]}
        </motion.div>

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