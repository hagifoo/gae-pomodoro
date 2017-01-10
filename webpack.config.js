var path = require('path');

module.exports = {
    context: path.join(__dirname, 'webapp'),
    entry: {
        main: './main.js' ,
        html: './index.html'
    },
    output: {
        path: path.join(__dirname, 'app', 'assets'),
        filename: '[name].js',
        publicPath: 'assets'
    },
    devtool: "#source-map",
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'file?name=[path][name].[ext]'
            }
        ]
    }
}
