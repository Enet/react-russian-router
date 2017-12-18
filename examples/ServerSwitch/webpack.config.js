const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isServerEnvironment = process.env.NODE_ENV === 'server';
if (isServerEnvironment) {
    ExtractTextPlugin.extract = (options) => [{loader: options.fallback}].concat(options.use);
}

const webpackConfig = {
    entry: {
        index: path.join(__dirname, 'src', 'index.jsx'),
        IndexPage: path.join(__dirname, 'src', 'IndexPage.jsx'),
        UserPage: path.join(__dirname, 'src', 'UserPage.jsx')
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    output: {
        publicPath: '/out',
        path: path.join(__dirname, 'out'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            use: [{
                loader: 'babel-loader'
            }]
        }, {
            test: /\.css?$/,
            use: ExtractTextPlugin.extract({
                fallback: 'isomorphic-style-loader',
                use: [{
                    loader: 'css-loader'
                }]
            })
        }]
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
        new webpack.optimize.CommonsChunkPlugin('index')
    ],
    devServer: {
        historyApiFallback: true
    }
};

if (isServerEnvironment) {
    webpackConfig.entry = {
        AppServer: path.resolve(__dirname, 'src', 'AppServer.jsx')
    };
    webpackConfig.output.libraryTarget = 'umd';
    webpackConfig.plugins = [webpackConfig.plugins[0]];
}

module.exports = webpackConfig;
