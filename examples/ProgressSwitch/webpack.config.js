const path = require('path');

module.exports = {
    entry: path.join(__dirname, 'src', 'index.jsx'),
    resolve: {
        extensions: ['.js', '.jsx']
    },
    output: {
        publicPath: '/out',
        path: path.join(__dirname, 'out'),
        filename: 'index.js'
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
    devServer: {
        historyApiFallback: true
    }
};
