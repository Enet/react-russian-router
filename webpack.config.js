const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './src/index.jsx',
    module: {
        rules: [{
            test: /\.jsx$/,
            use: 'babel-loader'
        }]
    },
    externals: [{
        react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react'
        }
    }],
    output: {
        filename: 'dist/react-russian-router.js',
        libraryTarget: 'umd',
        library: 'react-russian-router',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        })
    ]
};
