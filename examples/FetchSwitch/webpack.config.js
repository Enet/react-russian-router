const path = require('path');
const webpack = require('webpack');

module.exports = {
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
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader'
            }]
        }]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('index')
    ],
    devServer: {
        historyApiFallback: true
    }
};
