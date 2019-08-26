
import { Directive, AfterContentInit, Input, ElementRef } from '@angular/core';
/**
 * Directive to auto focus the dom element
 */
@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[autoFocus]'
})

export class AppAutoFocusDirective implements AfterContentInit {

    public constructor(private el: ElementRef) {
    }

    /**
     * Life cycle hook, which will call the once the content is initialised in view.
     */
    ngAfterContentInit() {
        setTimeout(() => {
            this.el.nativeElement.focus();
        }, 500);
    }

}
