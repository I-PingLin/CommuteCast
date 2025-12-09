import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GeminiService } from './services/gemini.service';
import { TtsService } from './services/tts.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  geminiService = inject(GeminiService);
  ttsService = inject(TtsService);

  articleText = signal('');
  summary = signal('');
  isLoading = signal(false);
  error = signal('');
  
  playingState = this.ttsService.playingState;

  updateArticleText(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.articleText.set(input.value);
  }

  async generateSummaryAndSpeech(): Promise<void> {
    if (!this.articleText().trim() || this.isLoading()) {
      return;
    }
    
    this.isLoading.set(true);
    this.error.set('');
    this.summary.set('');
    this.ttsService.stop();

    try {
      const generatedSummary = await this.geminiService.summarizeArticle(this.articleText());
      this.summary.set(generatedSummary);
      this.ttsService.speak(generatedSummary);
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleAudio(): void {
    if (this.playingState() === 'stopped' && this.summary()) {
        this.ttsService.speak(this.summary());
    } else {
        this.ttsService.togglePlayPause();
    }
  }
}
