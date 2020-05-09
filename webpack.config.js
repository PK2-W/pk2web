const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const to = p => path.resolve(__dirname, 'src', p);

module.exports = {
    entry: to('pk2w.ts'),
    mode: 'development',
    watch: true,
    devtool: 'source-map',
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
    },
    output: {
        pathinfo: false,
        path: path.join(__dirname, 'dist/pk2w'),
        filename: 'pk2web.min.js',
        libraryTarget: 'umd'
    },
    resolve: {
        alias: {
            '@game': to('./game'),
            //     '@s:be': to('../src/backend'),
            //     '@s:fe': to('../src/frontend'),
            '@ng': to('./engine'),
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
            { test: /\.tsx?$/, loader: 'ts-loader', options: { transpileOnly: true } }
            //{test: /\.(vert|frag)$/, loader: 'glslx-loader'}
        ]
    },
    plugins: [
        new WebpackNotifierPlugin({
            title: 'Pekka Kana 2 Web',
            alwaysNotify: true,
            sound: 'Pop'
        }),
        new ForkTsCheckerWebpackPlugin({ tsconfig: to('tsconfig.json') })
    ],
    externals: {
        'pixi.js': 'PIXI'
    }
};
