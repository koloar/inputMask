import { Directive, Input, ElementRef, OnInit, OnDestroy, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export const INPUTMASK_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InputMaskDirective),
  multi: true
};

interface Position {
  start: number;
  end: number;
}

@Directive({
  selector: '[appInputMask]'
})
export class InputMaskDirective implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() readonly appInputMask: string;
  @Input() readonly autoPlaceholder = false;
  @Input() readonly allowedNumber = '[0-9]';
  @Input() readonly allowedLetter = '[a-zA-Z]';
  @Input() placeholder: string;
  @Input() autoFillChar = '_';

  readonly ENTER = 'Enter';
  readonly DELETE = 'Delete';
  readonly ESCAPE = 'Escape';
  readonly BACKSPACE = 'Backspace';

  myPlaceholder: string[] = [];
  defs: any;
  test: string[] = [];
  myValue: string[] = [];
  firstUnMaskPos: number;
  lastUnMaskPos: number;
  length: number;

  modelChanged: (_: any) => void = () => { };
  modelTouched: () => void = () => { };

  constructor(private elRef: ElementRef) { }

  ngOnInit(): void {
    this.elRef.nativeElement.addEventListener('focus', this.setDefaultValue.bind(this));
    this.elRef.nativeElement.addEventListener('blur', this.removeDefaultValue.bind(this));
    this.elRef.nativeElement.addEventListener('keydown', this.keyDown.bind(this));
    this.elRef.nativeElement.addEventListener('keypress', this.keyPress.bind(this));
    this.elRef.nativeElement.addEventListener('cut', this.cut.bind(this));
    this.elRef.nativeElement.addEventListener('input', this.inputChange.bind(this));
    this.elRef.nativeElement.addEventListener('paste', this.paste.bind(this));

    this.initMask();
  }

  ngOnDestroy(): void {
    this.elRef.nativeElement.removeEventListener('focus', this.setDefaultValue);
    this.elRef.nativeElement.removeEventListener('blur', this.removeDefaultValue);
    this.elRef.nativeElement.removeEventListener('keydown', this.keyDown);
    this.elRef.nativeElement.removeEventListener('keypress', this.keyPress);
    this.elRef.nativeElement.removeEventListener('cut', this.cut.bind(this));
    this.elRef.nativeElement.removeEventListener('input', this.inputChange.bind(this));
    this.elRef.nativeElement.removeEventListener('paste', this.paste.bind(this));
  }

  writeValue(value: string): void {
    if (value === null || value === undefined) {
      this.elRef.nativeElement.value = '';
    } else {
      this.elRef.nativeElement.value = value;
    }
    this.modelChanged(value);
  }

  registerOnChange(fn: (_: any) => void): void {
    this.modelChanged = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.modelTouched = fn;
  }

  initMask() {
    this.defs = {
      n: this.allowedNumber,
      a: this.allowedLetter,
      '*': `${this.allowedLetter}|${this.allowedNumber}`
    };

    for (let i = 0; i < this.appInputMask.length; i++) {
      if (this.appInputMask[i] === '/') {
        ++i;

        if (this.defs[this.appInputMask[i]]) {
          this.test.push(this.defs[this.appInputMask[i]]);
          this.myPlaceholder.push('_');

          if (this.firstUnMaskPos === undefined) {
            this.firstUnMaskPos = this.myPlaceholder.length - 1;
          }

          this.lastUnMaskPos = this.myPlaceholder.length - 1;
        } else {
          this.test.push(null);
          this.myPlaceholder.push(this.appInputMask[i]);
        }
      } else {
        this.test.push(null);
        this.myPlaceholder.push(this.appInputMask[i]);
      }
    }

    if (this.autoPlaceholder) {
      this.placeholder = this.myPlaceholder.join('');
      this.elRef.nativeElement.placeholder = this.placeholder;
    }

    this.length = this.myPlaceholder.length;
  }

  selectedPos(start?: number, end?: number): void | Position {
    const input = this.elRef.nativeElement as HTMLInputElement;

    if (start !== undefined) {
      setTimeout(() => input.setSelectionRange(start, end !== undefined ? end : start), 0);
    } else {
      start = input.selectionStart;
      end = input.selectionEnd;
      return { start, end } as Position;
    }
  }

  seekNext(pos: number): number {
    while (++pos < this.length && !this.test[pos]) { }
    return pos < this.length ? pos : null;
  }

  seekPrev(pos: number): number {
    while (pos-- >= 0 && !this.test[pos]) { }
    return pos >= 0 ? pos : null;
  }

  removeValue(start: number, end: number): void {
    if (start >= 0 && start < end && end <= this.length) {
      for (let i = start; i < end; i++) {
        this.myValue[i] = this.myPlaceholder[i];
      }
    }
  }

  setDefaultValue(): void {
    if (this.elRef.nativeElement.readonly) {
      return;
    }

    if (this.myValue.length === 0) {
      this.myValue = this.placeholder.split('');
      this.writeValue(this.placeholder);
      this.selectedPos(0);
    }

    this.modelTouched();

    console.log(this.elRef.nativeElement.value);
  }

  removeDefaultValue(): void {
    if (this.elRef.nativeElement.readonly) {
      return;
    }

    if (this.myValue.join('') === this.placeholder) {
      this.myValue = [];
      this.writeValue('');
    }

    console.log(this.elRef.nativeElement.value);
  }

  keyDown(e: KeyboardEvent): void {
    if (this.elRef.nativeElement.readonly) {
      return;
    }

    if (e.key === this.DELETE || e.key === this.BACKSPACE) {
      const pos = this.selectedPos() as Position;
      let start = pos.start;
      let end = pos.end;

      if (end - start === 0) {
        start = e.key === this.BACKSPACE ? this.seekPrev(start) : this.seekNext(start - 1);
        end = start + 1;
      }

      this.removeValue(start, end);
      this.selectedPos(start);

      this.writeValue(this.myValue.join(''));
      e.preventDefault();
    } else if (e.key === this.ENTER) {
      for (let i = 0; i < this.length; i++) {
        this.myValue[i] = this.myValue[i].replace('_', this.autoFillChar);
      }
      this.selectedPos(0);

      this.modelTouched();
      this.writeValue(this.myValue.join(''));
      e.preventDefault();
    } else if (e.key === this.ESCAPE) {
      for (let i = 0; i < this.length; i++) {
        this.myValue[i] = this.myPlaceholder[i];
      }
      this.selectedPos(0);

      this.modelTouched();
      this.writeValue(this.myValue.join(''));
      e.preventDefault();
    }
  }

  keyPress(e: KeyboardEvent): void {
    if (this.elRef.nativeElement.readonly ||
      e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    const pos = this.selectedPos() as Position;
    pos.start = this.seekNext(pos.start - 1);
    if (e.key.match(this.test[pos.start])) {
      this.removeValue(pos.start, pos.end);

      this.myValue[pos.start] = e.key;
      this.writeValue(this.myValue.join(''));
      this.selectedPos(this.seekNext(pos.start));
    }

    e.preventDefault();
  }

  cut(): void {
    const pos = this.selectedPos() as Position;
    this.removeValue(pos.start, pos.end);
  }

  inputChange(): void {
    this.writeValue(this.myValue.join(''));
  }

  paste(e: ClipboardEvent): void {
    let value = e.clipboardData.getData('text');
    const lastMask = this.placeholder.substring(this.lastUnMaskPos + 1);

    if (lastMask === value.substring(value.length - lastMask.length)) {
      value = value.substring(0, value.length - lastMask.length);
    }

    let j = this.lastUnMaskPos;
    for (let i = value.length - 1; i >= 0; i--) {
      while (j >= this.firstUnMaskPos) {
        if (value[i].match(this.test[j])) {
          this.myValue[j] = value[i];
          j--;
          break;
        } else if (!this.test[j] && this.myPlaceholder[j] === value[i]) {
          this.myValue[j] = value[i];
          j--;
          break;
        } else {
          this.myValue[j] = this.autoFillChar;
          j--;
        }
      }
    }

    while (j >= this.firstUnMaskPos) {
      this.myValue[j] = this.autoFillChar;
      j--;
    }

    this.repairMask();
  }

  repairMask() {
    for (let i = 0; i < this.length; i++) {
      if (!this.test[i]) {
        this.myValue[i] = this.myPlaceholder[i];
      }
    }
  }
}
