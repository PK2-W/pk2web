const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');

const to = p => path.resolve(__dirname, p);

module.exports = {
    entry: path.join(__dirname, 'pk2w.ts'),
    mode: 'development',
    watch: true,
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, '../dist/pk2w'),
        filename: 'pk2web.min.js',
        libraryTarget: 'umd'
    },
    resolve: {
        alias: {
            //     '@s:app': to('../src/app'),
            //     '@s:be': to('../src/backend'),
            //     '@s:fe': to('../src/frontend'),
            //     '@s:ng': to('../src/backend/_engine'),
            //     '@s:sp': to('../src/support'),
            //
            //     '@c:app': to('./app'),
            //     '@c:be': to('./backend'),
            //     '@c:fe': to('./frontend'),
            //     '@c:sp': to('./support'),
            //
            '@vendor': to('./vendor')
        },
        extensions: ['.ts', '.js', '.min.js', '.json', '.vert', '.frag']
    },
    module: {
        rules: [
            {test: /\.tsx?$/, loader: 'ts-loader'}
            //{test: /\.(vert|frag)$/, loader: 'glslx-loader'}
        ]
    },
    plugins: [
        new WebpackNotifierPlugin({alwaysNotify: true, skipFirstNotification: true})
    ],
    externals: {}
};

