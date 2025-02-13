import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Emotion = 'idle' | 'happy' | 'sad' | 'excited';

interface CharacterState {
  emotion: Emotion;
  setEmotion: (emotion: Emotion) => void;
  updateEmotionBasedOnProgress: (completedHabits: number, totalHabits: number) => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      emotion: 'idle',
      setEmotion: (emotion) => set({ emotion }),
      updateEmotionBasedOnProgress: (completedHabits, totalHabits) => {
        if (totalHabits === 0) {
          set({ emotion: 'idle' });
        } else {
          const progress = completedHabits / totalHabits;
          if (progress === 0) {
            set({ emotion: 'sad' });
          } else if (progress === 1) {
            set({ emotion: 'excited' });
          } else if (progress >= 0.5) {
            set({ emotion: 'happy' });
          } else {
            set({ emotion: 'idle' });
          }
        }
      },
    }),
    {
      name: 'character-storage',
    }
  )
);