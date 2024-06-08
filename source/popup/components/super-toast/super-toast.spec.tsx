import React from 'react';
import { shallow } from 'enzyme';
import SuperToast from './super-toast';

describe('Super Toast Component', () => {
  const TestInput = {
    title: 'Really Old',
    caption: 'A long time ago in a galaxy far, far away...'
  };
  it('should create the component', () => {
    const wrapper = shallow(<SuperToast title={TestInput.title} caption={TestInput.caption} shopMode />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should display gradient toast for shopMode', () => {
    const wrapper = shallow(<SuperToast title={TestInput.title} caption={TestInput.caption} shopMode />);
    expect(wrapper.hasClass('super-toast--gradient')).toBeTruthy();
    expect(wrapper.find('#white').exists()).toBeTruthy();
    expect(wrapper.find('#blue').exists()).toBeFalsy();
    expect(wrapper.find('.super-toast__content__block__title').text()).toEqual(TestInput.title);
    expect(wrapper.find('.super-toast__content__block__caption').text()).toEqual(TestInput.caption);
  });

  it('should not display gradient for shopMode: false', () => {
    const wrapper = shallow(<SuperToast title={TestInput.title} caption={TestInput.caption} shopMode={false} />);
    expect(wrapper.hasClass('super-toast--gradient')).toBeFalsy();
    expect(wrapper.find('#white').exists()).toBeFalsy();
    expect(wrapper.find('#blue').exists()).toBeTruthy();
    expect(wrapper.find('.super-toast__content__block__title').text()).toEqual(TestInput.title);
    expect(wrapper.find('.super-toast__content__block__caption').text()).toEqual(TestInput.caption);
  });
});
