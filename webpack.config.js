const os = require('os')
const { resolve } = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpackBundleAnalyzer = require('webpack-bundle-analyzer')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const postcssNormalize = require('postcss-normalize')

const { BundleAnalyzerPlugin } = webpackBundleAnalyzer
const ROOT_PATH = resolve(process.cwd())
const babelConfig = resolve(ROOT_PATH, 'babel.config.js')

const threadLoader = {
    loader: 'thread-loader',
    options: {
        workers: os.cpus().length
    }
}
const rules = [
    {
        test: /\.(js|jsx|ts|tsx)?$/,
        include: [resolve(ROOT_PATH, 'src'), resolve(ROOT_PATH, 'abi')],
        use: [
            threadLoader,
            {
                loader: 'babel-loader',
                options: {
                    caller: 'web',
                    cacheDirectory: true,
                    configFile: babelConfig
                }
            }
        ]
    },
    {
        test: /\.(css|scss)?$/,
        use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
                loader: 'postcss-loader',
                options: {
                    postcssOptions: {
                        plugins: [
                            postcssPresetEnv({
                                autoprefixer: {
                                    grid: 'autoplace',
                                    flexbox: 'no-2009'
                                },
                                stage: 3
                            }),
                            postcssNormalize
                        ].filter(Boolean)
                    }
                }
            }
        ]
    },
    {
        test: /\.(json)?$/,
        type: 'javascript/auto',
        use: [threadLoader, 'json-loader']
    },
    {
        test: /\.(png|jpg|jpeg|gif|ico|eot|ttf|woff|woff2|svg|svgz)?$/,
        include: [ROOT_PATH],
        use: [
            {
                loader: 'url-loader',
                options: {
                    limit: false,
                    name: '[name].[ext]'
                }
            }
        ]
    }
]

// --------------------------------------plugins--------------------------------------
const plugins = [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.ProvidePlugin({
        process: 'process/browser', // npm install process 解决浏览器端process is not a function
        Buffer: ['buffer', 'Buffer'] // 解决浏览器端process is not a function
    }),
    new MiniCssExtractPlugin({
        filename: '[name].css'
    }),
    new BundleAnalyzerPlugin()
]

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: { index: resolve(ROOT_PATH, 'src/index.ts') },
    output: {
        path: resolve(ROOT_PATH, 'dist'),
        filename: 'element-js.js',
        publicPath: `/`
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserJSPlugin(), new OptimizeCssAssetsPlugin({})]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.scss'],
        fallback: {
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            os: require.resolve('os-browserify/browser'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify')
        }
    },
    module: {
        rules
    },
    plugins: plugins
}
