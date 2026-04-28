import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TextStats {
  wordCount: number;
  charCount: number;
}

export interface TextFormatting {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  fontSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class TextFormatterService {

  // BehaviorSubject for the input text
  private textSubject = new BehaviorSubject<string>('');
  public text$: Observable<string> = this.textSubject.asObservable();

  // BehaviorSubject for word & char count stats
  private statsSubject = new BehaviorSubject<TextStats>({ wordCount: 0, charCount: 0 });
  public stats$: Observable<TextStats> = this.statsSubject.asObservable();

  // BehaviorSubject for formatting options (Child → Parent communication via service)
  private formattingSubject = new BehaviorSubject<TextFormatting>({
    bold: false,
    italic: false,
    underline: false,
    color: '#000000',
    fontSize: 16
  });
  public formatting$: Observable<TextFormatting> = this.formattingSubject.asObservable();

  // BehaviorSubject for processed/output text
  private outputTextSubject = new BehaviorSubject<string>('');
  public outputText$: Observable<string> = this.outputTextSubject.asObservable();

  constructor() {}

  /**
   * Update raw input text and auto-compute stats
   */
  updateText(text: string): void {
    this.textSubject.next(text);
    this.outputTextSubject.next(text);
    this.computeStats(text);
  }

  /**
   * Compute word count and character count
   */
  private computeStats(text: string): void {
    const trimmed = text.trim();
    const wordCount = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
    const charCount = text.length;
    this.statsSubject.next({ wordCount, charCount });
  }

  /**
   * Update output text (after transformations)
   */
  updateOutputText(text: string): void {
    this.outputTextSubject.next(text);
  }

  /**
   * Update formatting (emitted from Formatters child component)
   */
  updateFormatting(formatting: Partial<TextFormatting>): void {
    const current = this.formattingSubject.getValue();
    this.formattingSubject.next({ ...current, ...formatting });
  }

  /**
   * Remove formatting — reset to defaults
   */
  resetFormatting(): void {
    this.formattingSubject.next({
      bold: false,
      italic: false,
      underline: false,
      color: '#000000',
      fontSize: 16
    });
  }

  /**
   * Clear all text
   */
  clearAll(): void {
    this.textSubject.next('');
    this.outputTextSubject.next('');
    this.statsSubject.next({ wordCount: 0, charCount: 0 });
    this.resetFormatting();
  }

  /**
   * Get current raw text value
   */
  getCurrentText(): string {
    return this.textSubject.getValue();
  }

  /**
   * Get current output text value
   */
  getCurrentOutputText(): string {
    return this.outputTextSubject.getValue();
  }
}
