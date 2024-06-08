/* eslint-disable @typescript-eslint/no-var-requires */
const pkg = require('../../package.json');
const csp = require('../../csp.js');

const manifestInput = {
  manifest_version: 3,
  name: 'Pay with BitPay',
  version: pkg.version,

  icons: {
    16: 'assets/icons/favicon-16.png',
    32: 'assets/icons/favicon-32.png',
    48: 'assets/icons/favicon-48.png',
    128: 'assets/icons/favicon-128.png'
  },

  description: 'Spend crypto instantly',
  homepage_url: 'https://github.com/bitpay/bitpay-browser-extension',
  short_name: 'BitPay',

  permissions: ['activeTab', 'storage', 'scripting'],
  host_permissions: ['http://*/*', 'https://*/*'],

  content_security_policy: {
    extension_pages: csp.cspString
  },

  '__chrome|firefox__author': 'BitPay',
  __opera__developer: {
    name: 'BitPay'
  },

  __firefox__applications: {
    gecko: {
      id: '{854FB1AD-CC3B-4856-B6A0-7786F8CA9D17}'
    }
  },

  __chrome__minimum_chrome_version: '88',
  __opera__minimum_opera_version: '36',

  action: {
    default_icon: {
      16: 'assets/icons/favicon-16.png',
      32: 'assets/icons/favicon-32.png',
      48: 'assets/icons/favicon-48.png',
      128: 'assets/icons/favicon-128.png'
    },
    default_title: 'Pay with BitPay',
    '__chrome|opera__chrome_style': false,
    __firefox__browser_style: false
  },

  background: {
    service_worker: 'js/background.bundle.js',
    type: 'module'
  },

  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['js/contentScript.bundle.js']
    }
  ],

  web_accessible_resources: [
    {
      resources: ['popup.html'],
      matches: ['*://*/*']
    }
  ]
};

module.exports = manifestInput;
