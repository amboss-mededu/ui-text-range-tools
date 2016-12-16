var path = require('path');

module.exports = {
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
};