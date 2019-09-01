import * as React from 'react';
import { forwardRef, RefObject, useImperativeHandle, useRef } from 'react';

export interface IEnhancedTextareaProps {
  id?: string | undefined;
  className?: string | undefined;
  style?: object | undefined;
  rows?: number;
  defaultValue?: string | undefined;
  value?: string | undefined;
  autoFocus?: boolean;
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
}

class EnhancedTextareaHandles implements IEnhancedTextareaHandles {
  private textareaRef: RefObject<HTMLTextAreaElement>;
  private onChange: () => void;

  constructor(textareaRef: RefObject<HTMLTextAreaElement>, onChange: () => void) {
    this.textareaRef = textareaRef;
    this.onChange = onChange;
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
}

const EnhancedTextarea: React.RefForwardingComponent<IEnhancedTextareaHandles, IEnhancedTextareaProps> = (
  props,
  ref,
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  function onChange() {
    if (props.onChange) {
      props.onChange(textareaRef.current!);
    }
  }
  useImperativeHandle(ref, () => new EnhancedTextareaHandles(textareaRef, onChange));
  return (
    <textarea
      id={props.id}
      className={props.className}
      ref={textareaRef}
      style={props.style}
      rows={props.rows}
      wrap="virtual"
      autoComplete="off"
      defaultValue={props.defaultValue}
      value={props.value}
      onKeyPress={props.onKeyPress}
      onKeyDown={props.onKeyDown}
      onChange={onChange}
      autoFocus={props.autoFocus}
      placeholder="Please enter in 'Markdown' syntax"
    />
  );
};

EnhancedTextarea.defaultProps = {
  autoFocus: false,
  className: undefined,
  defaultValue: undefined,
  id: undefined,
  onChange: undefined,
  onKeyDown: undefined,
  onKeyPress: undefined,
  rows: 5,
  style: undefined,
  value: undefined,
};

export default forwardRef(EnhancedTextarea);
