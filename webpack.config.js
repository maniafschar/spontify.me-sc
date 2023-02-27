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
				compiler.hooks.afterEmit.tap('webCalls', () => {
					var fs = require('fs'), dir = '../web/src/js/';
					var files = fs.readdirSync(dir);
					var map = [];
					var method = function (s) {
						var i = s.indexOf('method:');
						if (i > 0) {
							s = s.substring(i + 7, s.indexOf(',', i)).replace(/'/g, '').trim();
							return s.indexOf('?') > -1 ? s.substring(s.indexOf('?') + 1).trim().replace(' : ', '|') : s;
						}
						return 'GET';
					}
					var body = function (s) {
						var i = s.indexOf('body: {');
						if (i > 0) {
							var i2 = s.indexOf('},', i);
							if (i2 < 0)
								i2 = s.lastIndexOf('}\n');
							return s.substring(i + 5, i2 + 1).replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '').trim();
						}
					}
					var call = function (s) {
						var i = s.lastIndexOf('static', i2);
						var s2 = s.substring(i + 6, s.indexOf('{', i)).trim();
						if (s2.indexOf(' =') > 0) {
							s2 = s2.substring(0, s2.indexOf(' =')) + '.';
							s = s.substring(i + 6);
							i = s.lastIndexOf('},\n');
							if (i < 0)
								i = s.indexOf(' {\n');
							i += 3;
							s2 += s.substring(i, s.indexOf('{', i)).trim();
						}
						return s2;
					}
					for (var i = 0; i < files.length; i++) {
						if (files[i].indexOf('.js') > 0) {
							var s = fs.readFileSync(dir + files[i], 'utf8'), i2 = 0, e;
							while ((i2 = s.indexOf('communication.ajax', i2)) > -1) {
								e = {
									url: s.substring(s.indexOf('url:', i2) + 4, s.indexOf(',', i2)).replace('global.server +', '').trim(),
									method: method(s.substring(i2, s.indexOf('});', i2))),
									body: body(s.substring(i2, s.indexOf('});', i2))),
									call: files[i].substring(0, files[i].length - 3) + '.' + call(s.substring(0, i2))
								}
								if (e.call.indexOf('lists.loadList(') != 0)
									map.push(e);
								i2++;
							}
							i2 = 0;
							while ((i2 = s.indexOf('lists.loadList', i2)) > -1) {
								e = {
									url: '\'db/list?' + s.substring(i2 + 16, s.indexOf(',', i2)).trim(),
									method: 'GET',
									call: files[i].substring(0, files[i].length - 3) + '.' + call(s.substring(0, i2))
								}
								map.push(e);
								i2++;
							}
						}
					}
					fs.writeFileSync('src/webCalls.json', JSON.stringify(map));
				});
			}
		}
	]
}