const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry:  __dirname + '/js/index.jsx',
    mode: 'development',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bundle.js',
    },
    resolve: {
        extensions: [".js", ".jsx", ".css"]
    },
    module: {
        rules: [
            {
				test: /\.jsx?/, 
				exclude: /node_modules/,
				use: 'babel-loader'
            }
        ]  
    },
    watch:true,
    devServer: {
        contentBase: path.join(__dirname, '/dist'),
        port: 9000
    }
};

