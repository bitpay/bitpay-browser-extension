<p align="center">
  <img width="700" src="https://bitpay.com/assets/extension-banner.png" />
</p>
<h1 align="center">
  Discover new ways to use crypto
</h1>
<p align="center">
  Be alerted whenever a website you visit offers crypto as a payment option.
  <br/>
  Pay directly at checkout, or purchase and manage store credit through the app.
  <br/><br/>
</p>
<p align="center">
  <img width="375" src="https://bitpay.com/img/demos/extension-demo.gif" />
</p>

<hr />

## Browser Support

| [![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png)](https://chrome.google.com/webstore/detail/pay-with-bitpay/jkjgekcefbkpogohigkgooodolhdgcda) | [![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png)](https://addons.mozilla.org/en-US/firefox/addon/pay-with-bitpay/) | [![Brave](https://raw.github.com/alrra/browser-logos/master/src/brave/brave_48x48.png)](https://chrome.google.com/webstore/detail/pay-with-bitpay/jkjgekcefbkpogohigkgooodolhdgcda) | [![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png)](https://addons.opera.com/en/extensions/details/pay-with-bitpay/) |
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 49 & later ✔ | 52 & later ✔ | 36 & later ✔ | 79 & later ✔

## 🚀 Quick Start

Ensure you have 
- [Node.js](https://nodejs.org) 10 or later installed
- [Yarn](https://yarnpkg.com) v1 or v2 installed

Then run the following:
- `yarn install` to install dependencies.
- `yarn run dev:chrome` to start the development server for chrome extension
- `yarn run dev:firefox` to start the development server for firefox addon
- `yarn run dev:opera` to start the development server for opera extension
- `yarn run build:chrome` to build chrome extension
- `yarn run build:firefox` to build firefox addon
- `yarn run build:opera` to build opera extension
- `yarn run build` builds and packs extensions all at once to extension/ directory

### Development

- `yarn install` to install dependencies.
- To watch file changes in developement

  - Chrome
    - `yarn run dev:chrome`
  - Firefox
    - `yarn run dev:firefox`
  - Opera
    - `yarn run dev:opera`

- **Load extension in browser**

  - ### Chrome

    - Go to the browser address bar and type `chrome://extensions`
    - Check the `Developer Mode` button to enable it.
    - Click on the `Load Unpacked Extension…` button.
    - Select your extension’s extracted directory.

  - ### Firefox

    - Load the Add-on via `about:debugging` as temporary Add-on.
    - Choose the `manifest.json` file in the extracted directory

  - ### Opera

    - Load the extension via `opera:extensions`
    - Check the `Developer Mode` and load as unpacked from extension’s extracted directory.


### Enabling testnet payments
Change your `.env.development` file to the following:

```bash
API_ORIGIN=https://test.bitpay.com
```
   
### Generating browser specific manifest.json
See the original [README](https://github.com/abhijithvijayan/wext-manifest) of wext-manifest package for more details

### Production

- `yarn run build` builds the extension for all the browsers to `extension/BROWSER` directory respectively.

## Show your support

Give a ⭐️ if this project helped you!

## Licence

Code released under the [MIT License](LICENSE).
