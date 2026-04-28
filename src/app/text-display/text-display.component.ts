import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TextFormatterService, TextStats, TextFormatting } from '../services/text-formatter.service';
import { RemoveSpecialCharsPipe } from '../pipes/remove-special-chars.pipe';

/**
 * TextDisplayComponent — Left Panel (Child 1)
 * - Input text box (two-way binding with ngModel)
 * - Output text box displaying transformed text
 * - Word Count & Char Count (via Service + Observable)
 * - Receives @Input from HomeComponent for text operations triggered by Formatters
 */
@Component({
  selector: 'app-text-display',
  templateUrl: './text-display.component.html',
  styleUrls: ['./text-display.component.css'],
  providers: [RemoveSpecialCharsPipe]
})
export class TextDisplayComponent implements OnInit, OnDestroy {

  // @Input — Parent to Child: receives a transformation command from HomeComponent
  // (HomeComponent can pass down transformation commands from Formatters via @Input)
  @Input() transformCommand: string = '';

  inputText: string = '';
  outputText: string = '';

  stats: TextStats = { wordCount: 0, charCount: 0 };
  formatting: TextFormatting = {
    bold: false,
    italic: false,
    underline: false,
    color: '#000000',
    fontSize: 16
  };

  private destroy$ = new Subject<void>();

  constructor(
    private textFormatterService: TextFormatterService,
    private removeSpecialCharsPipe: RemoveSpecialCharsPipe
  ) {}

  ngOnInit(): void {
    // Subscribe to stats Observable — word & char count
    this.textFormatterService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
      });

    // Subscribe to output text Observable
    this.textFormatterService.outputText$
      .pipe(takeUntil(this.destroy$))
      .subscribe(text => {
        this.outputText = text;
      });

    // Subscribe to formatting Observable (from Formatters child via service)
    this.textFormatterService.formatting$
      .pipe(takeUntil(this.destroy$))
      .subscribe(formatting => {
        this.formatting = formatting;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fires on every keystroke in the input box
   * Updates service → triggers Observable chain → updates stats & output
   */
  onTextInput(): void {
    this.textFormatterService.updateText(this.inputText);
  }

  /**
   * Build ngStyle object for the output textarea based on current formatting
   */
  get outputStyles(): { [key: string]: string } {
    return {
      'font-weight': this.formatting.bold ? 'bold' : 'normal',
      'font-style': this.formatting.italic ? 'italic' : 'normal',
      'text-decoration': this.formatting.underline ? 'underline' : 'none',
      'color': this.formatting.color,
      'font-size': this.formatting.fontSize + 'px'
    };
  }

  // ===== TEXT TRANSFORMATIONS =====

  /** Clear All — clears input and resets everything */
  clearAll(): void {
    this.inputText = '';
    this.textFormatterService.clearAll();
  }

  /** Remove extra whitespace from text */
  removeWhitespace(): void {
    const result = this.textFormatterService.getCurrentOutputText()
      .replace(/\s+/g, ' ')
      .trim();
    this.textFormatterService.updateOutputText(result);
  }

  /** Reverse entire sentence (not word by word) */
  reverseAll(): void {
    const result = this.textFormatterService.getCurrentOutputText()
      .split('').reverse().join('');
    this.textFormatterService.updateOutputText(result);
  }

  /** Remove Special Characters — uses Custom Pipe (PipeTransform) */
  removeSpecialChars(): void {
    const current = this.textFormatterService.getCurrentOutputText();
    const result = this.removeSpecialCharsPipe.transform(current);
    this.textFormatterService.updateOutputText(result);
  }

  /** Remove all applied styling */
  removeStyling(): void {
    this.textFormatterService.resetFormatting();
  }

  /** Capitalize first letter of each word */
  capitalizeWords(): void {
    const result = this.textFormatterService.getCurrentOutputText()
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
    this.textFormatterService.updateOutputText(result);
  }
}
