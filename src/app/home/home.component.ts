import { Component, OnInit, ViewChild } from '@angular/core';
import { TextFormatterService } from '../services/text-formatter.service';
import { FormattersComponent } from '../formatters/formatters.component';

/**
 * HomeComponent — Parent component
 * - Contains the app header "Text Formatter"
 * - Hosts TextDisplayComponent (left) and FormattersComponent (right)
 * - Uses @ViewChild to access FormattersComponent
 * - Communicates via Service (Observable) and @Output EventEmitter
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // @ViewChild — Child to Parent via ViewChild
  @ViewChild(FormattersComponent) formattersChild!: FormattersComponent;

  constructor(private textFormatterService: TextFormatterService) {}

  ngOnInit(): void {}

  /**
   * Receives formatting event from FormattersComponent child
   * via @Output EventEmitter (Child → Parent)
   */
  onFormattingChanged(event: any): void {
    this.textFormatterService.updateFormatting(event);
  }

  /**
   * Example of using @ViewChild to call a method on the child
   */
  resetAllFormatters(): void {
    if (this.formattersChild) {
      this.formattersChild.resetAllFormatting();
    }
  }
}
