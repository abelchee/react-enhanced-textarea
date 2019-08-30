import * as React from 'react';
import * as renderer from 'react-test-renderer';
import EnhancedTextarea from '../EnhancedTextarea';

describe('EnhancedTextarea', () => {
  test('EnhancedTextarea should initialize as it is', () => {
    const component = renderer.create(
      <EnhancedTextarea id="123" className="test-class" rows={5} autoFocus value="ABC" />,
    );
    const testInstance = component.root;
    const { props } = testInstance.findByType(EnhancedTextarea);

    expect(props.className).toBe('test-class');
    expect(props.rows).toBe(5);
    expect(props.value).toBe('ABC');
    expect(props.id).toBe('123');

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
