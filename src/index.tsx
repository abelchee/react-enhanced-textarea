import * as React from 'react';
import { RefObject } from 'react';

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
  onChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onKeyPress?: (event: React.KeyboardEvent) => void;
  onCopy?: (event: React.ClipboardEvent) => void;
  onCopyCapture?: (event: React.ClipboardEvent) => void;
  onPaste?: (event: React.ClipboardEvent) => void;
  onPasteCapture?: (event: React.ClipboardEvent) => void;
}

interface IEnhancedTextareaState {
  value?: string;
}

class EnhancedTextarea extends React.Component<IEnhancedTextareaProps, IEnhancedTextareaState> {
  public static defaultProps = {
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

  public get textarea(): HTMLTextAreaElement | null {
    return this.textareaRef.current;
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

  private textareaRef: RefObject<HTMLTextAreaElement>;

  constructor(props: IEnhancedTextareaProps) {
    super(props);
    this.textareaRef = React.createRef();
    this.state = {
      value: props.value || props.defaultValue,
    };
    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  public focus(): void {
    this.textarea!.focus();
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
    const { selectionStart } = this;
    if (this.selectedText === template) {
      this.replaceSelectedText('');
    } else {
      this.replaceSelectedText(template);
      this.select({
        from: selectionStart,
        length: template.length,
      });
    }
  }

  public toggleMultipleLineTemplate(template: string) {
    this.focus();
    const { selectionStart } = this;
    if (this.selectedText === template) {
      this.replaceSelectedText('');
      this.replaceText({
        from: selectionStart - 1,
        text: '',
        to: template.length + 2,
      });
    } else {
      this.replaceSelectedText(`\n${template}\n`);
      this.select({
        from: selectionStart + 1,
        length: template.length,
      });
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

  public append(content: string) {
    this.value += content;
  }

  public toggleLineMarker(marker: string) {
    this.focus();
    const text = this.value;
    const { selectionStart, selectionEnd } = this;
    const firstLineStart = text.substring(0, selectionStart).lastIndexOf('\n') + 1;
    const otherLineMarkers = (this.props.lineMarkers || []).filter((it) => it !== marker);
    const newText = text
      .substring(firstLineStart, selectionEnd)
      .split('\n')
      .map((line) => {
        if (line.indexOf(marker) === 0) {
          return line.substring(marker.length);
        }

        const currentMarker = otherLineMarkers.find((it) => line.indexOf(it) === 0);
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

  public render() {
    const props = this.props;
    const rows = Math.max((this.state.value || '').split('\n').length, props.rows || 0);
    return (
      <textarea
        id={props.id}
        className={props.className}
        ref={this.textareaRef}
        style={props.style}
        rows={rows}
        wrap="virtual"
        autoComplete="off"
        defaultValue={props.defaultValue}
        value={props.value}
        onKeyPress={props.onKeyPress}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        autoFocus={props.autoFocus}
        placeholder={props.placeholder}
        onPaste={props.onPaste}
        onPasteCapture={props.onPasteCapture}
        onCopy={props.onCopy}
        onCopyCapture={props.onCopyCapture}
      />
    );
  }

  private onChange() {
    if (this.props.onChange) {
      this.props.onChange(this.textareaRef.current!.value);
    }
    this.setState({
      value: this.textareaRef.current!.value,
    });
  }

  private onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      const startText = this.selectedFromLineStart;
      const marker = (this.props.lineMarkers || []).find((m) => startText.startsWith(m));
      if (marker) {
        this.replaceSelectedText(`\n${marker}`);
        e.preventDefault();
      }
    } else {
      if (this.props.onKeyDown) {
        this.props.onKeyDown(e);
      }
    }
  }
}

export default EnhancedTextarea;
