// webpack.config.js
module.exports = {
    entry: './index.js',
    output: {
        filename: './svg-path-resize.js',
        libraryTarget: 'umd',
        library: 'resizePath'
    }
};