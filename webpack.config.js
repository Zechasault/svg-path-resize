// webpack.config.js
module.exports = {
    entry: './index.js',
    output: {
        filename: './dist/svg-path-resize.js',
        libraryTarget: 'umd',
        library: 'resizePath'
    }
};