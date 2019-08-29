import * as React from 'react';

export interface IProps {
  text: string;
}

export default class EnhancedTextarea extends React.Component<IProps> {
  public render() {
    const { text } = this.props;

    return <div style={{ color: 'red' }}>Hello {text}</div>;
  }
}
