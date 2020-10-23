const apiOrigin = process.env.API_ORIGIN;
const isProd = process.env.NODE_ENV === 'production';
const isFirefox = process.env.TARGET_BROWSER === 'firefox';

const cspObject = {
  'default-src': ["'self'", apiOrigin],
  'base-uri': ["'self'"],
  'connect-src': [apiOrigin, ...(isFirefox ? [] : ['https://www.google-analytics.com']), ...(isProd ? [] : ['ws:'])],
  'img-src': ['https://gravatar.com', 'https://*.wp.com', apiOrigin],
  'font-src': ['https://fonts.gstatic.com'],
  'object-src': ["'self'"],
  'script-src': isProd ? ["'self'"] : ["'self'", "'unsafe-eval'"],
  'style-src': ["'self'", 'https://fonts.googleapis.com/', "'unsafe-inline'"]
};

const buildPolicy = policyObj =>
  Object.keys(policyObj)
    .map(key => `${key} ${policyObj[key].join(' ')}`)
    .join('; ');

const cspString = buildPolicy(cspObject);

module.exports = {
  cspObject,
  cspString
};
