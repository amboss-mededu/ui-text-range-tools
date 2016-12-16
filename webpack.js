var path = require('path');

module.exports = [
  {
    name: 'library',
    entry: "./index.js",
    output: {
      path: path.join(__dirname, 'dist'),
      filename: "index.js",
      library: 'text-range-tools',
      libraryTarget: 'commonjs2'
    },
    module: {
      loaders: [
        { test: /\.js/, loader: "babel" }
      ]
    }
  },
  {
    name: 'test-globals',
    entry: "./index.js",
    output: {
      path: path.join(__dirname, 'test'),
      filename: "test.js",
      library: 'textRangeTools',
      libraryTarget: 'var'
    },
    module: {
      loaders: [
        { test: /\.js/, loader: "babel" }
      ]
    }
  }
];