
class SoundManager {
  private audio: HTMLAudioElement | null = null;
  private volume: number = 0.5;

  private sounds = {
    rain: 'https://cdn.freesound.org/previews/346/346562_5858296-lq.mp3',
    cafe: 'https://cdn.freesound.org/previews/323/323502_5260872-lq.mp3',
    whitenoise: 'https://cdn.freesound.org/previews/242/242037_4387476-lq.mp3',
    forest: 'https://cdn.freesound.org/previews/573/573576_5142851-lq.mp3'
  };

  play(sound: keyof typeof this.sounds) {
    if (this.audio) {
      this.stop();
    }

    this.audio = new Audio(this.sounds[sound]);
    this.audio.loop = true;
    this.audio.volume = this.volume;
    this.audio.play();
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

export const soundManager = new SoundManager();
