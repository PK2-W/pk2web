const path = require('path');
const WebpackNotifierPlugin = require('webpack-notifier');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const {exec, spawn} = require('child_process');

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
            '@fwk': to('./engine'),
            //     '@s:sp': to('../src/support'),
            //
            //     '@c:app': to('./app'),
            //     '@c:be': to('./backend'),
            //     '@c:fe': to('./frontend'),
            '@sp': to('./support'),
            //
            '@vendor': to('./vendor')
        },
        extensions: ['.ts', '.js', '.min.js', '.json', '.vert', '.frag']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/, use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        //silent: true,
                        experimentalFileCaching: true
                    }
                }
            }
            //{test: /\.(vert|frag)$/, loader: 'glslx-loader'}
        ]
    },
    plugins: [
        {
            apply: (compiler) => {
                compiler.hooks.done.tap('CustomPlugin', (stats) => {
                    if (stats.compilation.errors.length > 0) {
                        exec('C:/Directos/ffmpeg/bin/ffplay.exe -loglevel quiet -hide_banner -nodisp -autoexit "C:/Users/Juande Martos/Music/failed.mp3"');
                    } else {
                        exec('C:/Directos/ffmpeg/bin/ffplay.exe -loglevel quiet -hide_banner -nodisp -autoexit "C:/Users/Juande Martos/Music/success.mp3"');
                    }
                });
            }
        }
        // new WebpackNotifierPlugin({
        //     title: 'Pekka Kana 2 Web',
        //     alwaysNotify: true,
        //     sound: 'Pop'
        // })
        //new ForkTsCheckerWebpackPlugin({ tsconfig: to('tsconfig.json') })
    ],
    externals: {
        'pixi.js': 'PIXI',
        'ft2.js': 'Fasttracker'
    }
};
