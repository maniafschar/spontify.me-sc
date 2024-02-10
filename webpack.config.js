const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: './src/js/main.js',
	mode: 'production',
	output: {
		globalObject: 'this',
		filename: 'js/main.js',
		path: path.resolve(__dirname, 'dist'),
	},
	optimization: {
		minimize: true
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-transform-runtime']
					}
				}
			}
		]
	},
	experiments: {
		topLevelAwait: true
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery'
		})
	]
}