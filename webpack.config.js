const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer')


module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },

    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 8080,
        hot: true
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./public/css", to: "css" },
                { from: "./public/img", to: "img" },
            ],
        }),

        new HtmlWebpackPlugin({
            template: './public/index.html',
        })
    ],

    module: {
        rules: [
            // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.(ts)$/, 
              exclude: /node_modules/,
              loader: "ts-loader" },
        ]
      }
};