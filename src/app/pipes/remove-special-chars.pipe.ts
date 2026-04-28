import { Pipe, PipeTransform } from '@angular/core';

/**
 * Custom Pipe: removeSpecialChars
 * Removes all special characters from the given string.
 * Implements PipeTransform interface.
 *
 * Usage in template: {{ text | removeSpecialChars }}
 */
@Pipe({
  name: 'removeSpecialChars',
  pure: true   // Pure pipe — only re-evaluates when input reference changes
})
export class RemoveSpecialCharsPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    // Remove everything that is not a letter, digit, or whitespace
    return value.replace(/[^a-zA-Z0-9\s]/g, '');
  }

}
