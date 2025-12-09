import { Injectable, signal, WritableSignal } from '@angular/core';

export type PlayingState = 'stopped' | 'playing' | 'paused';

@Injectable({
  providedIn: 'root',
})
export class TtsService {
  playingState: WritableSignal<PlayingState> = signal('stopped');
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    window.addEventListener('beforeunload', () => {
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    });
  }

  speak(text: string): void {
    if (!text || typeof window.speechSynthesis === 'undefined') {
        console.error('Speech synthesis not supported or no text provided.');
        return;
    }
    
    this.stop();

    // Workaround for a common browser bug where voices are not loaded immediately
    const voices = speechSynthesis.getVoices();
    
    // Fix: Corrected typo from SpeechSynthesisUtterterance to SpeechSynthesisUtterance
    this.utterance = new SpeechSynthesisUtterance(text);
    
    const preferredVoice = voices.find(voice => voice.name.includes('Google US English') || voice.lang.startsWith('en-US'));
    if (preferredVoice) {
      this.utterance.voice = preferredVoice;
    }

    this.utterance.onstart = () => this.playingState.set('playing');
    this.utterance.onend = () => this.playingState.set('stopped');
    this.utterance.onpause = () => this.playingState.set('paused');
    this.utterance.onresume = () => this.playingState.set('playing');
    this.utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      this.playingState.set('stopped');
    };

    speechSynthesis.speak(this.utterance);
  }

  togglePlayPause(): void {
    if (typeof window.speechSynthesis === 'undefined') return;

    const currentState = this.playingState();
    if (currentState === 'playing') {
      speechSynthesis.pause();
    } else if (currentState === 'paused') {
      speechSynthesis.resume();
    }
  }
  
  stop(): void {
    if (typeof window.speechSynthesis !== 'undefined') {
        speechSynthesis.cancel();
    }
    this.playingState.set('stopped');
  }
}
