import * as React from 'react';
import { ChangeEvent, RefObject } from 'react';

export interface IEnhancedTextareaProps {
  id: string | undefined;
  className: string | undefined;
  style: object | undefined;
  rows: number;
  defaultValue: string | undefined;
  value: string | undefined;
  autoFocus: boolean;
  onChange: (value: string) => {} | undefined;
  onKeyDown: (event: React.KeyboardEvent) => {} | undefined;
  onKeyPress: (event: React.KeyboardEvent) => {} | undefined;
}

export default class EnhancedTextarea extends React.Component<IEnhancedTextareaProps> {
  public static defaultProps = {
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

  private textareaRef: RefObject<HTMLTextAreaElement>;

  constructor(props: IEnhancedTextareaProps) {
    super(props);
    this.textareaRef = React.createRef();
  }

  public get textarea(): HTMLTextAreaElement {
    return this.textareaRef.current!;
  }

  public get value() {
    return this.textarea.value;
  }

  public set value(v) {
    this.textarea.value = v;
    this.props.onChange(v);
  }

  public get selectedText() {
    return this.textarea.value.substring(this.textarea.selectionStart, this.textarea.selectionEnd);
  }

  public get selectedFromLineStart() {
    const lineStart = this.value.substring(0, this.selectionStart).lastIndexOf('\n') + 1;
    return this.value.substring(lineStart, this.selectionStart);
  }

  public get selectionStart() {
    return this.textarea.selectionStart;
  }

  public set selectionStart(position) {
    this.textarea.selectionStart = position;
  }

  public get selectionEnd() {
    return this.textarea.selectionEnd;
  }

  public set selectionEnd(position) {
    this.textarea.selectionEnd = position;
  }

  public replaceSelectedText(text: string) {
    const originalSelectionStart = this.textarea.selectionStart;
    const originalSelectionEnd = this.textarea.selectionEnd;
    this.replaceText({
      from: originalSelectionStart,
      text,
      to: originalSelectionEnd,
    });
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
    this.textarea.setSelectionRange(from, to || from + (length || 0));
  }

  public putCursorTo(location: number) {
    this.textarea.selectionEnd = location || 0;
  }

  public replaceText({ text, from, to }: { text: string; from: number; to: number }) {
    const textLeft = this.textarea.value.substring(0, from);
    const textRight = this.textarea.value.substring(to);
    this.textarea.value = `${textLeft}${text}${textRight}`;
    this.textarea.selectionEnd = from + text.length;
    if (this.props.onChange) {
      this.props.onChange(this.textarea.value);
    }
  }

  public focus() {
    this.textarea.focus();
  }

  public render() {
    return (
      <textarea
        id={this.props.id}
        className={this.props.className}
        ref={this.textareaRef}
        style={this.props.style}
        rows={this.props.rows}
        wrap="virtual"
        autoComplete="off"
        defaultValue={this.props.defaultValue}
        value={this.props.value}
        onKeyPress={this.props.onKeyPress}
        onKeyDown={this.props.onKeyDown}
        onChange={this.onChange}
        autoFocus={this.props.autoFocus}
        placeholder="Please enter in 'Markdown' syntax"
      />
    );
  }

  private onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    this.props.onChange(event.target.value);
  }
}
