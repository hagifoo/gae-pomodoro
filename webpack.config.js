var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: path.join(__dirname, 'webapp', 'src'),
    entry: {
        main: './index.js'
    },
    output: {
        path: path.join(__dirname, 'app', 'assets'),
        filename: '[name].[hash].js',
        publicPath: '/'
    },
    resolve: {
        root: path.join(__dirname, 'webapp', 'src')
    },
    devtool: "#source-map",
    devServer: {
        contentBase: path.join(__dirname, 'app', 'assets'),
        port: 8090,
        proxy: [{
            context: ['/api/', '/invitation/', '/signin/', '/integrate/', '/auth/'],
            target: 'http://localhost:8080/',
            secure: false
        }]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query:{
                    presets: ['es2015']
                }
            },
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
        title: 'Custom template',
        template: 'index.hbs',
    })
    ],
    externals: {
        firebase: 'firebase',
        jquery: 'jQuery'
    }
}
