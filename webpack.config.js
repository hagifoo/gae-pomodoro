var path = require('path');

module.exports = {
    context: path.join(__dirname, 'webapp', 'src'),
    entry: {
        main: './main.js' ,
//        html: './index.html'
    },
    output: {
        path: path.join(__dirname, 'app', 'assets'),
        filename: '[name].js',
        publicPath: ''
    },
    resolve: {
        root: path.join(__dirname, 'webapp', 'src')
    },
    devtool: "#source-map",
    devServer: {
        contentBase: path.join(__dirname, 'app', 'assets'),
        port: 8090,
        proxy: {
            '/api/': {
                target: 'http://localhost:8080/',
                secure: false
            },
            '/invitation/': {
                target: 'http://localhost:8080/',
                secure: false
            },
            '/signin/': {
                target: 'http://localhost:8080/',
                secure: false
            },
            '/auth/': {
                target: 'http://localhost:8080/',
                secure: false
            }
        }
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
    externals: {
        firebase: 'firebase',
        jquery: 'jQuery'
    }
}
