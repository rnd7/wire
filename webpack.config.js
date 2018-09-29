var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
        main: './src/client/js/client.js'
    },
    output: {
        path: path.resolve("./dist/client/js"),
        filename: 'client.js'
    },
    module: {
      loaders: [
        {
          loader: 'babel-loader',
          query: {presets: ['es2015']},
          exclude: /node_modules/
        }
      ]
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
          exclude: /node_modules/
        })
    ]
};
