import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'htmlApply'
})
export class HtmlApplyPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
  }
  transform(style) {
    return this.sanitizer.bypassSecurityTrustHtml(style || '');
  }

}
