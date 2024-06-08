const path = require('path');
const webpack = require('webpack');
const FilemanagerPlugin = require('filemanager-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtensionReloader = require('webpack-ext-reloader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WextManifestWebpackPlugin = require('wext-manifest-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WriteWebpackPlugin = require('write-webpack-plugin');
const wextManifest = require('wext-manifest');
require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.defaults'
      : `.env.${process.env.NODE_ENV}`
});

const viewsPath = path.join(__dirname, 'views');
const sourcePath = path.join(__dirname, 'source');
const destPath = path.join(__dirname, 'extension');
const nodeEnv = process.env.NODE_ENV || 'development';
const targetBrowser = process.env.TARGET_BROWSER;

const manifestVersion = targetBrowser === 'firefox' || nodeEnv === 'development' ? 2 : 3;
const manifestFileName = `v${manifestVersion}.js`;
const manifestInput = require(`./source/manifest/${manifestFileName}`);

const manifest = wextManifest[targetBrowser](manifestInput);

const extensionReloaderPlugin =
  nodeEnv === 'development'
    ? new ExtensionReloader({
        port: 9090, // Which port use to create the server
        reloadPage: true, // Force the reload of the page also
        entries: {
          // TODO: reload manifest on update
          contentScript: 'contentScript',
          background: 'background',
          extensionPage: ['popup', 'options']
        }
      })
    : () => {
        this.apply = () => {};
      };

const getExtensionFileType = browser => {
  if (browser === 'opera') {
    return 'crx';
  }

  if (browser === 'firefox') {
    return 'xpi';
  }

  return 'zip';
};

module.exports = {
  devtool: false, // https://github.com/webpack/webpack/issues/1194#issuecomment-560382342

  stats: {
    all: false,
    builtAt: true,
    errors: true,
    hash: true
  },

  mode: nodeEnv,

  entry: {
    manifest: path.join(sourcePath, 'manifest', manifestFileName),
    background: path.join(sourcePath, 'background', 'index.ts'),
    contentScript: path.join(sourcePath, 'content-script', 'index.ts'),
    popup: path.join(sourcePath, 'popup', 'index.tsx'),
    options: path.join(sourcePath, 'options', 'index.tsx')
  },

  output: {
    path: path.join(destPath, targetBrowser),
    filename: 'js/[name].bundle.js'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      'webextension-polyfill-ts': path.resolve(
        path.join(__dirname, 'node_modules', 'webextension-polyfill-ts')
      )
    },
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify')
    }
  },

  module: {
    rules: [
      {
        type: 'javascript/auto', // prevent webpack handling json with its own loaders,
        test: /manifest\.json$/,
        use: {
          loader: 'wext-manifest-loader',
          options: {
            usePackageJSONVersion: true // set to false to not use package.json version for manifest
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.(js|ts)x?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader // It creates a CSS file per JS file which contains CSS
          },
          {
            loader: 'css-loader', // Takes the CSS files and returns the CSS with imports and url(...) for Webpack
            options: {
              url: false,
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'autoprefixer',
                    {
                      // Options
                    }
                  ]
                ]
              }
            }
          },
          'resolve-url-loader', // Rewrites relative paths in url() statements
          'sass-loader' // Takes the Sass/SCSS file and compiles to the CSS
        ]
      }
    ]
  },

  plugins: [
    // Plugin to not generate js bundle for manifest entry
    new WextManifestWebpackPlugin(),
    // Generate sourcemaps
    new webpack.SourceMapDevToolPlugin({ filename: false }),
    new ForkTsCheckerWebpackPlugin(),
    // environmental variables
    new webpack.EnvironmentPlugin(['NODE_ENV', 'TARGET_BROWSER']),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
    // write manifest.json
    new WriteWebpackPlugin([
      {
        name: manifest.name,
        data: Buffer.from(manifest.content)
      }
    ]),
    // delete previous build files
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), `extension/${targetBrowser}`),
        path.join(
          process.cwd(),
          `extension/${targetBrowser}.${getExtensionFileType(targetBrowser)}`
        )
      ],
      cleanStaleWebpackAssets: false,
      verbose: true
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'popup.html'),
      inject: 'body',
      chunks: ['popup'],
      hash: true,
      filename: 'popup.html'
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'options.html'),
      inject: 'body',
      chunks: ['options'],
      hash: true,
      filename: 'options.html'
    }),
    // write css file(s) to build folder
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    // copy static assets
    new CopyWebpackPlugin({
      patterns: [{ from: 'source/assets', to: 'assets' }]
    }),
    // plugin to enable browser reloading in development mode
    extensionReloaderPlugin
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          format: {
            comments: false
          }
        },
        extractComments: false
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }]
        }
      }),
      new FilemanagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                format: 'zip',
                source: path.join(destPath, targetBrowser),
                destination: `${path.join(destPath, targetBrowser)}.${getExtensionFileType(targetBrowser)}`,
                options: { zlib: { level: 6 } }
              }
            ]
          }
        }
      })
    ]
  }
};
