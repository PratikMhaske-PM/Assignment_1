import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TextFormatterService, TextFormatting, TextStats } from '../services/text-formatter.service';
import { RemoveSpecialCharsPipe } from '../pipes/remove-special-chars.pipe';

/**
 * FormattersComponent — Right Panel (Child 2)
 * Contains: Stats box, action buttons, B/I/U + color + font size controls
 * Communicates to parent via @Output EventEmitter
 */
@Component({
  selector: 'app-formatters',
  templateUrl: './formatters.component.html',
  styleUrls: ['./formatters.component.css'],
  providers: [RemoveSpecialCharsPipe]
})
export class FormattersComponent implements OnInit, OnDestroy {

  @Output() formattingChanged = new EventEmitter<Partial<TextFormatting>>();

  bold = false;
  italic = false;
  underline = false;
  color = '#000000';
  fontSize = 16;

  stats: TextStats = { wordCount: 0, charCount: 0 };

  private destroy$ = new Subject<void>();

  constructor(
    private textFormatterService: TextFormatterService,
    private removeSpecialCharsPipe: RemoveSpecialCharsPipe
  ) {}

  ngOnInit(): void {
    // Subscribe to stats observable
    this.textFormatterService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => this.stats = s);

    // Sync formatting state
    this.textFormatterService.formatting$
      .pipe(takeUntil(this.destroy$))
      .subscribe(f => {
        this.bold = f.bold;
        this.italic = f.italic;
        this.underline = f.underline;
        this.color = f.color;
        this.fontSize = f.fontSize;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== TEXT TRANSFORMATIONS =====

  clearAll(): void {
    this.textFormatterService.clearAll();
  }

  removeWhitespace(): void {
    const result = this.textFormatterService.getCurrentOutputText()
      .replace(/\s+/g, ' ').trim();
    this.textFormatterService.updateOutputText(result);
  }

  reverseAll(): void {
    const result = this.textFormatterService.getCurrentOutputText()
      .split('').reverse().join('');
    this.textFormatterService.updateOutputText(result);
  }

  removeSpecialChars(): void {
    const result = this.removeSpecialCharsPipe.transform(
      this.textFormatterService.getCurrentOutputText()
    );
    this.textFormatterService.updateOutputText(result);
  }

  removeStyling(): void {
    this.textFormatterService.resetFormatting();
  }

  capitalizeWords(): void {
    const result = this.textFormatterService.getCurrentOutputText()
      .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    this.textFormatterService.updateOutputText(result);
  }

  // ===== FORMATTING CONTROLS =====

  toggleBold(): void { this.bold = !this.bold; this.emitFormatting(); }
  toggleItalic(): void { this.italic = !this.italic; this.emitFormatting(); }
  toggleUnderline(): void { this.underline = !this.underline; this.emitFormatting(); }

  onColorChange(event: Event): void {
    this.color = (event.target as HTMLInputElement).value;
    this.emitFormatting();
  }

  increaseFontSize(): void {
    if (this.fontSize < 72) { this.fontSize++; this.emitFormatting(); }
  }

  decreaseFontSize(): void {
    if (this.fontSize > 8) { this.fontSize--; this.emitFormatting(); }
  }

  private emitFormatting(): void {
    const f: TextFormatting = {
      bold: this.bold, italic: this.italic,
      underline: this.underline, color: this.color, fontSize: this.fontSize
    };
    this.formattingChanged.emit(f);
    this.textFormatterService.updateFormatting(f);
  }

  resetAllFormatting(): void {
    this.bold = false; this.italic = false;
    this.underline = false; this.color = '#000000'; this.fontSize = 16;
    this.emitFormatting();
  }
}

