const webpack = require('webpack');

module.exports = {
    entry: './src/index.jsx',
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [{
            test: /\.jsx$/,
            use: 'babel-loader'
        }]
    },
    externals: [{
        'react': {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'react',
            root: 'React'
        },
        'browser-russian-router': {
            commonjs: 'browser-russian-router',
            commonjs2: 'browser-russian-router',
            amd: 'BrowserRussianRouter',
            root: 'BrowserRussianRouter'
        },
        'server-russian-router': {
            commonjs: 'server-russian-router',
            commonjs2: 'server-russian-router',
            amd: 'ServerRussianRouter',
            root: 'ServerRussianRouter'
        }
    }],
    output: {
        filename: 'dist/react-russian-router.js',
        libraryTarget: 'umd',
        library: 'ReactRussianRouter',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        })
    ]
};
