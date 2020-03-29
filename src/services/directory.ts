export interface DirectIntegrationApiObject {
  displayName: string;
  caption: string;
  logo: string;
  link: string;
  displayLink: string;
  tags: string[];
  domains: string[];
  discount?: {
    type: string;
    amount: number;
  };
  theme: string;
  instructions: string;
}

export interface DirectIntegration extends DirectIntegrationApiObject {
  name: string;
}

export const directoryResponse = {
  expressVPN: {
    displayName: 'ExpressVPN',
    caption: 'Buy a VPN for Windows, Mac, & more ',
    logo: 'express-vpn_avatar.svg',
    link: 'https://www.expressvpn.com/',
    displayLink: 'expressvpn.com',
    tags: ['privacy', 'security', 'vpn', 'software'],
    domains: ['https://www.expressvpn.com/'],
    theme: '#C8252C',
    instructions: 'Just choose BitPay at checkout to pay for your VPN subscription using BTC, BCH, ETH, USDC, and more.'
  },
  newegg: {
    displayName: 'Newegg',
    caption: 'Shop computer parts, games, & more',
    logo: 'newegg_avatar.svg',
    link: 'https://www.newegg.com',
    displayLink: 'newegg.com',
    tags: ['electronics', 'hardware', 'gaming', 'software'],
    domains: ['https://www.newegg.com', 'https://www.newegg.ca/'],
    theme: '#CC4E00',
    instructions:
      "Geek out using BTC, BCH, ETH, USDC, and more. Select 'Bitcoin / Bitcoin Cash' as a payment method during checkout to pay with BitPay."
  },
  scanUK: {
    displayName: 'SCAN UK',
    caption: 'Shop computer parts, games, & more',
    logo: 'scan-computer_avatar.svg',
    link: 'https://www.scan.co.uk/',
    displayLink: 'scan.co.uk',
    tags: ['electronics', 'hardware', 'gaming', 'software'],
    domains: ['https://www.scan.co.uk/'],
    theme: '#1766A6',
    instructions:
      "Geek out using BTC, BCH, ETH, USDC, and more. Select 'Bitcoin' as a payment method during checkout. Then click 'Complete order with bitcoin' to pay with BitPay."
  },
  twitch: {
    displayName: 'Twitch',
    caption: 'Watch Fortnite, PUBG & IRL TV for free',
    logo: 'twitch_avatar.svg',
    link: 'https://www.twitch.tv/',
    displayLink: 'twitch.tv',
    tags: ['entertainment', 'gaming', 'streaming', 'donation'],
    domains: ['https://www.twitch.tv'],
    theme: '#9146FF',
    instructions:
      'Top up your bits using BTC, BCH, ETH, USDC, and more. Choose “+ More” then “Show More Methods”. Then select the bitcoin logo to pay with BitPay.'
  },
  wikimedia: {
    displayName: 'Wikimedia',
    caption: 'Support free and open knowledge for everyone',
    logo: 'wikimedia_avatar.svg',
    link: 'https://wikimediafoundation.org/',
    displayLink: 'wikimedia.org',
    tags: ['nonprofit', 'charity', 'donation'],
    domains: ['https://www.wikimedia.org/', 'https://www.wikipedia.org/', 'https://wikimediafoundation.org/'],
    cta: {
      displayText: 'Donate with Crypto',
      link: 'https://donate.wikimedia.org/wiki/Ways_to_Give#Cryptocurrency'
    },
    theme: '#339966',
    instructions:
      'Donate to Wikipedia using BTC, BCH, ETH, USDC, and more. The Wkimedia Foundation uses BitPay’s donation page to accept cryptocurrency. Use the button below to support free and open knowledge for everyone.'
  },
  apmex: {
    displayName: 'APMEX',
    caption: 'Buy Gold, Silver, Platinum & Palladium Bullion online',
    logo: 'apmex_avatar.svg',
    link: 'https://www.apmex.com/',
    displayLink: 'apmex.com',
    tags: ['precious metals'],
    domains: ['https://www.apmex.com/'],
    discount: {
      type: 'percentage',
      amount: 3
    },
    theme: '#24A186',
    instructions:
      'Purchase precious metals using BTC, BCH, ETH, USDC, and more. Select ‘Bitcoin/Bitcoin Cash’ as your payment method during checkout to pay with BitPay.'
  },
  providentMetals: {
    displayName: 'Provident Metals',
    caption: 'Buy Gold, Silver, Platinum & Palladium Bullion online',
    logo: 'provident-metals_avatar.svg',
    link: 'https://www.providentmetals.com/',
    displayLink: 'providentmetals.com',
    tags: ['precious metals'],
    domains: ['https://www.providentmetals.com/'],
    discount: {
      type: 'percentage',
      amount: 3
    },
    theme: '#119CB6',
    instructions:
      'Purchase precious metals using BTC, BCH, ETH, USDC, and more. Select ‘Bitcoin’ as your payment method during checkout to pay with BitPay.'
  }
};

export const getDirectIntegrations = (
  res: { [name: string]: DirectIntegrationApiObject } = directoryResponse
): DirectIntegration[] => Object.keys(res).map(name => ({ ...res[name], name }));
