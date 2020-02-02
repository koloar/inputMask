import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appInputMask]'
})
export class InputMaskDirective implements OnInit, OnDestroy {
  @Input() readonly appInputMask: string;
  @Input() readonly autoPlaceholder = false;
  @Input() readonly allowedNumber = '[0-9]';
  @Input() readonly allowedLetter = '[a-zA-Z]';
  @Input() placeholder: string;

  myPlaceholder: string[] = [];
  defs: any;
  mask: string[] = [];

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.elRef.nativeElement.addEventListener('click', this.setDefaultValue.bind(this));
    this.elRef.nativeElement.addEventListener('blur', this.removeDefaultValue.bind(this));
    this.elRef.nativeElement.addEventListener('keydown', this.keyDown.bind(this));
    this.elRef.nativeElement.addEventListener('keypress', this.keyPress.bind(this));

    this.initInput();
  }

  ngOnDestroy(): void {
    this.elRef.nativeElement.removeEventListener('click', this.setDefaultValue);
    this.elRef.nativeElement.removeEventListener('blur', this.removeDefaultValue);
    this.elRef.nativeElement.removeEventListener('keydown', this.keyDown);
    this.elRef.nativeElement.removeEventListener('keypress', this.keyPress);
  }

  setDefaultValue(): void {
    const input = this.elRef.nativeElement as HTMLInputElement;

    if (input.value === '') {
      input.value = this.placeholder;
      input.selectionStart = 0;
      input.selectionEnd = 0;
    }
  }

  removeDefaultValue(): void {
    const input = this.elRef.nativeElement as HTMLInputElement;

    if (this.placeholder.match(input.value)) {
      input.value = '';
    }
  }

  initInput(): void {
    this.defs = {
      n: this.allowedNumber,
      a: this.allowedLetter,
      '*': this.allowedLetter.concat('|', this.allowedNumber)
    };

    for (let i = 0; i < this.appInputMask.length; i++) {
      if (this.appInputMask[i] === '/') {
        this.mask.push(this.defs[this.appInputMask[++i]]);

        if (this.defs[this.appInputMask[i]] !== undefined) {
          this.myPlaceholder.push('_');
        }
        else {
          this.myPlaceholder.push(this.appInputMask[i]);
        }
      }
      else {
        this.mask.push(undefined);
        this.myPlaceholder.push(this.appInputMask[i]);
      }
    }

    if (this.autoPlaceholder) {
      this.placeholder = this.myPlaceholder.join('');
      this.elRef.nativeElement.placeholder = this.placeholder;
    }
  }

  keyDown(e: KeyboardEvent): void {
    const key: number = e.keyCode || e.which;

    if (key === 8 || key === 46) {
      const input = this.elRef.nativeElement as HTMLInputElement;
      let pos = input.selectionStart;

      if (pos !== input.selectionEnd) {
        this.deleteRange(pos, input.selectionEnd);
      }

      if (key === 8) {
        if (0 >= pos) {
          e.preventDefault();
          return;
        }

        if (!this.mask[--pos]) {
          --pos;
        }

        input.value = input.value.substring(0, pos).concat('_', input.value.substring(pos + 1));
        input.selectionStart = pos;
        input.selectionEnd = pos;

        e.preventDefault();
      }
      else if (key === 46) {
        if (this.placeholder.length <= pos) {
          e.preventDefault();
          return;
        }

        if (!this.mask[pos]) {
          ++pos;
        }

        input.value = input.value.substring(0, pos).concat('_', input.value.substring(pos + 1));
        input.selectionStart = pos + 1;
        input.selectionEnd = pos + 1;

        e.preventDefault();
      }
    }
  }

  keyPress(e: KeyboardEvent): void {
    const key: number = e.keyCode || e.which;

    if (e.ctrlKey || e.altKey || e.metaKey || key < 32 || (key > 34 && key < 41)) {
      return;
    }

    this.setValue(e);

    e.preventDefault();
  }

  setValue(e: KeyboardEvent) {
    const input = this.elRef.nativeElement as HTMLInputElement;
    let pos = input.selectionStart;

    if (pos !== input.selectionEnd) {
      this.deleteRange(pos, input.selectionEnd);
    }

    if (this.placeholder.length <= pos) {
      e.preventDefault();
      return;
    }

    if (!this.mask[pos]) {
      input.selectionStart = ++pos;
      input.selectionEnd = pos;
    }

    if (e.key.match(this.mask[pos])) {
      input.value = input.value.substring(0, pos).concat(e.key, input.value.substring(++pos));
      input.selectionStart = pos;
      input.selectionEnd = pos;

      if (!this.mask[pos]) {
        input.selectionStart = pos + 1;
        input.selectionEnd = pos + 1;
      }
    }
  }

  deleteRange(begin: number, end: number) {
    const input = this.elRef.nativeElement as HTMLInputElement;

    input.value = input.value.substring(0, begin).concat(this.placeholder.substring(begin, end), input.value.substring(end));
    input.selectionStart = begin;
    input.selectionEnd = end;
  }
}
