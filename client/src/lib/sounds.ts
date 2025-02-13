
class SoundManager {
  private audio: HTMLAudioElement | null = null;
  private volume: number = 0.5;

  private sounds = {
    rain: '/sounds/rain.mp3',
    cafe: '/sounds/cafe.mp3',
    whitenoise: '/sounds/whitenoise.mp3',
    forest: '/sounds/forest.mp3'
  };

  play(sound: keyof typeof this.sounds) {
    if (this.audio) {
      this.stop();
    }

    this.audio = new Audio(this.sounds[sound]);
    this.audio.loop = true;
    this.audio.volume = this.volume;
    this.audio.play().catch(err => console.error('Audio playback failed:', err));
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.audio) {
      this.audio.volume = volume;
    }
  }
}

const soundManager = new SoundManager();
export { soundManager };
