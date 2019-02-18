const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: path.join(__dirname, '/js/index.jsx'),
    mode: 'development',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: [".js", ".jsx", ".css"]
    },
    cache: false,
    module: {
        rules: [
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, '/'),
        port: 9000
    }
};

