import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenAI | null = null;

  constructor() {
    if (process.env.API_KEY) {
       this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
        console.error('API_KEY environment variable not set.');
    }
  }

  async summarizeArticle(articleText: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini AI client not initialized. Check API Key.');
    }
    if (!articleText.trim()) {
      throw new Error('Article text cannot be empty.');
    }

    const model = 'gemini-2.5-flash';
    const prompt = `Summarize the following news article into a concise, easy-to-listen-to audio script of about 2-3 paragraphs. Focus on the key points and present it in a clear, narrative style suitable for a commuter's daily briefing.
    
    Article text:
    ---
    ${articleText}
    ---
    `;

    try {
      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: model,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error summarizing article:', error);
      throw new Error('Failed to generate summary. Please try again.');
    }
  }
}
