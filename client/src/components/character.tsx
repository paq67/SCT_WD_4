import { motion } from "framer-motion";

const CHARACTER_IMAGES = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=level1",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=level2",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=level3",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=level4",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=level5"
];

export default function Character({ level }: { level: number }) {
  const characterIndex = Math.min(Math.floor((level - 1) / 5), CHARACTER_IMAGES.length - 1);
  
  return (
    <div className="relative aspect-square max-w-md mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full relative"
      >
        <img
          src={CHARACTER_IMAGES[characterIndex]}
          alt={`Level ${level} character`}
          className="w-full h-full object-contain"
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium"
        >
          Level {level}
        </motion.div>
      </motion.div>
    </div>
  );
}
