import React from 'react';
import { shallow } from 'enzyme';
import Gravatar from './gravatar';

describe('Gravatar', () => {
  it('should create component', () => {
    const wrapper = shallow(<Gravatar email="lanchanagupta@gmail.com" />);
    expect(wrapper.exists()).toBe(true);
  });
});
