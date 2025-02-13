import { Howl } from "howler";

type SoundType = "rain" | "cafe" | "whitenoise" | "forest";

const sounds: Record<SoundType, string> = {
  rain: "https://cdn.example.com/rain.mp3",
  cafe: "https://cdn.example.com/cafe.mp3",
  whitenoise: "https://cdn.example.com/whitenoise.mp3",
  forest: "https://cdn.example.com/forest.mp3"
};

class SoundManager {
  private currentSound?: Howl;
  private volume = 0.5;

  play(type: SoundType) {
    if (this.currentSound) {
      this.currentSound.stop();
    }

    this.currentSound = new Howl({
      src: [sounds[type]],
      loop: true,
      volume: this.volume
    });

    this.currentSound.play();
  }

  stop() {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound = undefined;
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.currentSound) {
      this.currentSound.volume(volume);
    }
  }
}

export const soundManager = new SoundManager();
