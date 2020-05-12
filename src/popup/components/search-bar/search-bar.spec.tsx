import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import SearchBar from './search-bar';

describe('Search Bar', () => {
  const setWrapperProps = (wrapper: ShallowWrapper): void => {
    wrapper.setProps({
      output: (val: string) => wrapper.setProps({ value: val }),
      tracking: {
        trackEvent: (): void => undefined
      }
    });
  };
  it('should create the component', () => {
    const wrapper = shallow(<SearchBar />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it('should change icons based on input value', () => {
    const wrapper = shallow(<SearchBar />);
    setWrapperProps(wrapper);
    expect(wrapper.find('#searchClearIcon').exists()).toBeFalsy();
    expect(wrapper.find('#searchIcon').exists()).toBeTruthy();
    wrapper.find('input').simulate('change', { currentTarget: { value: 'amazon' } });
    expect(wrapper.find('#searchClearIcon').exists()).toBeTruthy();
    expect(wrapper.find('#searchIcon').exists()).toBeFalsy();
    wrapper.find('button').simulate('click');
    expect(wrapper.find('#searchClearIcon').exists()).toBeFalsy();
    expect(wrapper.find('#searchIcon').exists()).toBeTruthy();
  });

  it('should clear input value on clicking clearSearchButton ', () => {
    const wrapper = shallow(<SearchBar />);
    setWrapperProps(wrapper);
    wrapper.find('input').simulate('change', { currentTarget: { value: 'amazon' } });
    expect(wrapper.find('input').prop('value')).toBe('amazon');
    wrapper.find('button').simulate('click');
    expect(wrapper.find('input').prop('value')).toBe('');
  });
});
