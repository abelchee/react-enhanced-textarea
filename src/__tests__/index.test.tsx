import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import EnhancedTextarea from '../index';

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

  test('EnhancedTextarea value should be set', () => {
    const wrapper = mount(<EnhancedTextarea value="123" />);
    const comp = wrapper.instance() as EnhancedTextarea;
    expect(comp.value).toBe('123');
    wrapper.setProps({
      value: '456',
    });
    wrapper.update();
    expect(comp.value).toBe('456');
  });

  test('EnhancedTextarea default value should be set once', () => {
    const wrapper = mount(<EnhancedTextarea defaultValue="123" />);
    const comp = wrapper.instance() as EnhancedTextarea;
    expect(comp.value).toBe('123');
    wrapper.setProps({
      defaultValue: '456',
    });
    wrapper.update();
    expect(comp.value).toBe('123');
  });

  test('EnhancedTextarea select start and end', () => {
    const wrapper = mount(<EnhancedTextarea defaultValue="AAA*BBBB*CCC" />);
    const comp = wrapper.instance() as EnhancedTextarea;
    comp.selectionStart = 4;
    comp.selectionEnd = 8;
    expect(comp.selectedText).toBe('BBBB');
    comp.replaceSelectedText('GGGG');
    expect(comp.value).toBe('AAA*GGGG*CCC');
    comp.select({ from: 4, to: 8 });
    expect(comp.selectedText).toBe('GGGG');
    comp.select({ from: 4, length: 8 });
    expect(comp.selectedText).toBe('GGGG*CCC');
  });
});
