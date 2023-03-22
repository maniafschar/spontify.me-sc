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
		}),
		{
			apply: compiler => {
				compiler.hooks.afterEmit.tap('client', () => {
					var fs = require('fs');
					fs.mkdirSync('dist/images');
					var logo = fs.readFileSync('../web/src/images/logo.svg', 'utf8');
					fs.writeFileSync('dist/images/logoOrg.svg', logo.replace('viewBox="0 0 1000 400"', 'viewBox="0 0 1000 400" width="1000" height="400"'));
					fs.writeFileSync('dist/images/logoSmall.svg', logo.replace('viewBox="0 0 1000 400"', 'viewBox="0 0 400 400" width="400" height="400"').replace('<g class="home">', '<g class="small">'));
					fs.writeFileSync('dist/images/logoIcon.svg', logo.replace('viewBox="0 0 1000 400"', 'viewBox="0 0 400 400" width="400" height="400"').replace('<g class="home">', '<g class="icon">'));
				})
			}
		}
	]
}