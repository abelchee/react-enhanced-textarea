import * as React from 'react';
import { forwardRef, RefObject, useImperativeHandle, useRef, useState } from 'react';

export interface IEnhancedTextareaProps {
  id?: string | undefined;
  className?: string | undefined;
  style?: object | undefined;
  rows?: number;
  defaultValue?: string | undefined;
  value?: string | undefined;
  placeholder?: string | undefined;
  autoFocus?: boolean;
  lineMarkers?: string[] | undefined;
  onChange?: (textarea?: HTMLTextAreaElement) => {} | undefined;
  onKeyDown?: (event: React.KeyboardEvent) => {} | undefined;
  onKeyPress?: (event: React.KeyboardEvent) => {} | undefined;
}

export interface IEnhancedTextareaHandles {
  readonly textarea: HTMLTextAreaElement | null;
  readonly selectedText: string;
  readonly selectedFromLineStart: string;
  selectionStart: number;
  selectionEnd: number;
  value: string;

  focus(): void;

  replaceSelectedText(text: string): void;

  select({
    from,
    to,
    length,
  }: {
    from: number;
    to?: number | null | undefined;
    length?: number | null | undefined;
  }): void;

  putCursorTo(location: number): void;

  replaceText({ text, from, to }: { text: string; from: number; to: number }): void;

  toggleMarker({ prefix, suffix, defaultText }: { prefix: string; suffix: string; defaultText: string }): void;
  toggleMultipleLineMarker({
    prefix,
    suffix,
    defaultText,
  }: {
    prefix: string;
    suffix: string;
    defaultText: string;
  }): void;

  toggleLineMarker(marker: string): void;
}

class EnhancedTextareaHandles implements IEnhancedTextareaHandles {
  private textareaRef: RefObject<HTMLTextAreaElement>;
  private onChange: () => void;
  private lineMarkers: string[];

  constructor(textareaRef: RefObject<HTMLTextAreaElement>, onChange: () => void, lineMarkers: string[] | undefined) {
    this.textareaRef = textareaRef;
    this.onChange = onChange;
    this.lineMarkers = lineMarkers || [];
  }

  public get textarea(): HTMLTextAreaElement | null {
    return this.textareaRef.current;
  }

  public focus(): void {
    this.textarea!.focus();
  }

  public get value() {
    return this.textarea!.value;
  }

  public set value(v) {
    this.textarea!.value = v;
    this.onChange();
  }

  public get selectedText() {
    return this.textarea!.value.substring(this.textarea!.selectionStart, this.textarea!.selectionEnd);
  }

  public get selectedFromLineStart() {
    const lineStart = this.value.substring(0, this.selectionStart).lastIndexOf('\n') + 1;
    return this.value.substring(lineStart, this.selectionStart);
  }

  public get selectionStart() {
    return this.textarea!.selectionStart;
  }

  public set selectionStart(position) {
    this.textarea!.selectionStart = position;
  }

  public get selectionEnd() {
    return this.textarea!.selectionEnd;
  }

  public set selectionEnd(position) {
    this.textarea!.selectionEnd = position;
  }

  public replaceSelectedText(text: string) {
    const originalSelectionStart = this.textarea!.selectionStart;
    const originalSelectionEnd = this.textarea!.selectionEnd;
    this.replaceText({
      from: originalSelectionStart,
      text,
      to: originalSelectionEnd,
    });
    this.onChange();
  }

  public select({
    from,
    to,
    length,
  }: {
    from: number;
    to?: number | null | undefined;
    length?: number | null | undefined;
  }) {
    this.textarea!.setSelectionRange(from, to || from + (length || 0));
  }

  public putCursorTo(location: number) {
    this.textarea!.selectionEnd = location || 0;
  }

  public replaceText({ text, from, to }: { text: string; from: number; to: number }) {
    const textLeft = this.textarea!.value.substring(0, from);
    const textRight = this.textarea!.value.substring(to);
    this.textarea!.value = `${textLeft}${text}${textRight}`;
    this.textarea!.selectionEnd = from + text.length;
    this.onChange();
  }

  public toggleTemplate(template: string) {
    this.focus();
    if (this.selectedText === template) {
      this.replaceSelectedText('');
    } else {
      this.replaceSelectedText(template);
    }
  }

  public toggleMultipleLineTemplate(template: string) {
    this.focus();
    if (this.selectedText === `\n${template}\n`) {
      this.replaceSelectedText('');
    } else {
      this.replaceSelectedText(`\n${template}\n`);
    }
  }

  public toggleMultipleLineMarker({
    prefix,
    suffix,
    defaultText,
  }: {
    prefix: string;
    suffix: string;
    defaultText: string;
  }) {
    this.focus();
    const text = this.selectedText || defaultText;
    const { selectionStart, selectionEnd } = this;
    if (
      this.value.substr(selectionStart - prefix.length - 1, prefix.length) === prefix &&
      this.value.substr(selectionEnd + 1, suffix.length) === suffix
    ) {
      this.replaceText({
        from: selectionStart - prefix.length - 2,
        text: text === defaultText ? '' : text,
        to: selectionEnd + suffix.length + 2,
      });
      if (text !== defaultText) {
        this.select({
          from: selectionStart - prefix.length - 2,
          length: text.length,
        });
      }
    } else {
      this.replaceSelectedText(`\n${prefix}\n${text}\n${suffix}\n`);
      this.select({
        from: selectionStart + prefix.length + 2,
        length: text.length,
      });
    }
  }

  public toggleMarker({ prefix, suffix, defaultText }: { prefix: string; suffix: string; defaultText: string }) {
    this.focus();
    const text = this.selectedText || defaultText;
    const { selectionStart, selectionEnd } = this;
    if (
      this.value.substr(selectionStart - prefix.length, prefix.length) === prefix &&
      this.value.substr(selectionEnd, suffix.length) === suffix
    ) {
      this.replaceText({
        from: selectionStart - prefix.length,
        text: text === defaultText ? '' : text,
        to: selectionEnd + suffix.length,
      });
      if (text !== defaultText) {
        this.select({
          from: selectionStart - prefix.length,
          length: text.length,
        });
      }
    } else {
      this.replaceSelectedText(`${prefix}${text}${suffix}`);
      this.select({
        from: selectionStart + prefix.length,
        length: text.length,
      });
    }
  }

  public toggleLineMarker(marker: string) {
    this.focus();
    const text = this.value;
    const { selectionStart, selectionEnd } = this;
    const firstLineStart = text.substring(0, selectionStart).lastIndexOf('\n') + 1;
    const otherLineMarkers = this.lineMarkers.filter(it => it !== marker);
    const newText = text
      .substring(firstLineStart, selectionEnd)
      .split('\n')
      .map(line => {
        if (line.indexOf(marker) === 0) {
          return line.substring(marker.length);
        }

        const currentMarker = otherLineMarkers.find(it => line.indexOf(it) === 0);
        if (currentMarker) {
          return marker + line.substring(currentMarker.length);
        }

        return marker + line;
      })
      .join('\n');
    this.replaceText({
      from: firstLineStart,
      text: newText,
      to: selectionEnd,
    });
  }
}

const EnhancedTextarea: React.RefForwardingComponent<IEnhancedTextareaHandles, IEnhancedTextareaProps> = (
  props,
  ref,
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(props.value || props.defaultValue);

  function onChange() {
    if (props.onChange) {
      props.onChange(textareaRef.current!);
    }
    setValue(textareaRef.current!.value);
  }

  const handlers = new EnhancedTextareaHandles(textareaRef, onChange, props.lineMarkers);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      const startText = handlers.selectedFromLineStart;
      const marker = (props.lineMarkers || []).find(m => startText.startsWith(m));
      if (marker) {
        handlers.replaceSelectedText(`\n${marker}`);
        e.preventDefault();
      }
    } else {
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    }
  }

  useImperativeHandle(ref, () => handlers);

  const rows = Math.max((value || '').split('\n').length, props.rows || 0);

  return (
    <textarea
      id={props.id}
      className={props.className}
      ref={textareaRef}
      style={props.style}
      rows={rows}
      wrap="virtual"
      autoComplete="off"
      defaultValue={props.defaultValue}
      value={props.value}
      onKeyPress={props.onKeyPress}
      onKeyDown={onKeyDown}
      onChange={onChange}
      autoFocus={props.autoFocus}
      placeholder={props.placeholder}
    />
  );
};

EnhancedTextarea.defaultProps = {
  autoFocus: false,
  className: undefined,
  defaultValue: undefined,
  id: undefined,
  lineMarkers: [],
  onChange: undefined,
  onKeyDown: undefined,
  onKeyPress: undefined,
  placeholder: undefined,
  rows: 5,
  style: undefined,
  value: undefined,
};

export default forwardRef(EnhancedTextarea);
