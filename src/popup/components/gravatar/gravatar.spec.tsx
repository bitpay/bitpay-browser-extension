import React from 'react';
import { shallow } from 'enzyme';
import Gravatar from './gravatar';

describe('Gravatar', () => {
  it('should create component', () => {
    const wrapper = shallow(<Gravatar email="sio_bibblebibblebibble@gmail.com" />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should create the Gravatar url', () => {
    const testInputs = [
      {
        props: { email: 'sio_bibblebibblebibble@gmail.com' },
        expected: {
          src: `https://gravatar.com/avatar/435dc65470defec47a5117da43fccfb6.jpg?s=120&d=${process.env.API_ORIGIN}/img/wallet-logos/bitpay-wallet.png`,
          size: 30
        }
      },
      {
        props: { email: 'anakin_skywalker@gamil.com', size: 35 },
        expected: {
          src: `https://gravatar.com/avatar/760358ccdb2c7f111e52eccbbfa9b5ef.jpg?s=140&d=${process.env.API_ORIGIN}/img/wallet-logos/bitpay-wallet.png`,
          size: 35
        }
      }
    ];

    testInputs.forEach(input => {
      const wrapper = shallow(<Gravatar email={input.props.email} size={input.props.size} />);
      expect(wrapper.find('img').prop('src')).toEqual(input.expected.src);
      expect(wrapper.find('img').prop('width')).toEqual(input.expected.size);
      expect(wrapper.find('img').prop('height')).toEqual(input.expected.size);
    });
  });
});
