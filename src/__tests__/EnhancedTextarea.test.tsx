import * as React from 'react';
import * as renderer from 'react-test-renderer';
import EnhancedTextarea from '../EnhancedTextarea';

test("Component should show 'red' text 'Hello World'", () => {
  const component = renderer.create(<EnhancedTextarea text="World" />);
  const testInstance = component.root;

  expect(testInstance.findByType(EnhancedTextarea).props.text).toBe('World');

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
