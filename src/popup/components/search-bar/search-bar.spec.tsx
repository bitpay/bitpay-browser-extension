import React from 'react';
import { shallow } from 'enzyme';
import SearchBar from './search-bar';

describe('Search Bar', () => {
  it('should create the component', () => {
    const wrapper = shallow(<SearchBar />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it('should change icons based on input value', () => {
    const wrapper = shallow(<SearchBar />);
    wrapper.setProps({
      output: (val: any) => {
        wrapper.setProps({ value: val });
      }
    });
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
    wrapper.setProps({
      output: (val: any) => {
        wrapper.setProps({ value: val });
      }
    });
    wrapper.find('input').simulate('change', { currentTarget: { value: 'amazon' } });
    expect(wrapper.find('input').prop('value')).toBe('amazon');
    wrapper.find('button').simulate('click');
    expect(wrapper.find('input').prop('value')).toBe('');
  });
});
