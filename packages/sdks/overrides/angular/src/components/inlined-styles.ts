import { CommonModule } from '@angular/common';
// fails because type imports cannot be injected
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Component, ElementRef, input, Renderer2 } from '@angular/core';

interface Props {
  styles: string;
  id: string;
  nonce: string;
}

@Component({
  selector: 'inlined-styles, InlinedStyles',
  template: ``,
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export default class InlinedStyles {
  styles = input.required<Props['styles']>();
  id = input.required<Props['id']>();
  nonce = input.required<Props['nonce']>();

  styleElement!: HTMLStyleElement;

  constructor(
    private renderer: Renderer2,
    private elRef: ElementRef
  ) {}

  ngOnChanges(changes) {
    if (changes.styles) {
      if (this.styleElement) {
        this.styleElement.textContent = this.styles();
      } else {
        this.styleElement = this.renderer.createElement('style');
        this.renderer.setAttribute(this.styleElement, 'data-id', this.id());
        this.renderer.appendChild(
          this.styleElement,
          this.renderer.createText(this.styles())
        );
        this.renderer.setAttribute(this.styleElement, 'nonce', this.nonce());
        this.renderer.appendChild(this.elRef.nativeElement, this.styleElement);
      }
    }
  }
}
