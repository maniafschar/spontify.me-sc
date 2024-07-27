import { doc } from "./doc";
import { lists } from "./lists";
import { sha256, start } from "./start";

export { api };

class api {
	static url = 'https://skills.community/rest/support/';

	static beforeServerCall(xhr) {
		var salt = ('' + new Date().getTime() + Math.random()).replace(/[01]\./, '.');
		xhr.setRequestHeader('clientId', 4);
		xhr.setRequestHeader('secret', start.secret);
		xhr.setRequestHeader('salt', salt);
		xhr.setRequestHeader('password', sha256.hash(start.password + salt + start.user));
	}
	static build(path) {
		var out = $('build code.output');
		out.html('Running.');
		var time = new Date().getTime();
		var ping = function () {
			pingId = setTimeout(ping, 1000);
			out.html(out.html() + '.');
		}
		var pingId = setTimeout(ping, 1000);
		$.ajax({
			url: api.url + 'build/' + path,
			type: 'POST',
			error(r) {
				if (r.responseText) {
					clearTimeout(pingId);
					out.html(r.responseText);
				} else {
					var restart = function () {
						$.ajax({
							url: api.url + 'metrics',
							error(r) {
								clearTimeout(pingId);
								out.html('');
							},
							success(r2) {
								if (time > r2['process.start.time']['measurements'][0].value * 1000)
									setTimeout(restart, 1000);
								else {
									clearTimeout(pingId);
									r2['started'] = start.getDisplayDate(r2['process.start.time']['measurements'][0].value * 1000);
									out.html('');
									doc.renderJson(r2, out[0]);
								}
							}
						});
					};
					setTimeout(restart, 5000);
				}
			},
			success(r) {
				clearTimeout(pingId);
				out.html(r);
			}
		});
	}
	static convert(fields, values) {
		var o = {};
		for (var i = 0; i < fields.length; i++) {
			if (fields[i].indexOf('.') > -1)
				o[fields[i].substring(fields[i].indexOf('.') + 1)] = values[i];
		}
		return o;
	}
	static delete(id) {
		var highlight = $('#' + id).parents('tr');
		highlight.css('background', 'yellow');
		setTimeout(function () {
			if (!confirm('Möchtest Du den Kontakt löschen?')) {
				highlight.css('background', '');
				return;
			}
			$.ajax({
				url: api.url + 'user/' + id,
				type: 'DELETE',
				success() {
					highlight[0].nextSibling.remove();
					highlight.remove();
				}
			});
		}, 50);
	}
	static importLocation(e, id) {
		$.ajax({
			url: api.url + 'location/import/' + id + '/' + e.previousSibling.value,
			type: 'POST',
			success(r) {
				if (r) {
					e.previousSibling.outerHTML = '';
					e.outerHTML = r;
				} else
					e.parentElement.innerHTML = 'success';
			}
		});
	}
	static report() {
		$.ajax({
			url: api.url + 'report/7',
			type: 'GET',
			success(r) {
				var s = '<div>', dates = [];
				for (var client in r) {
					for (var date in r[client].anonym) {
						if (dates.indexOf(date) < 0)
							dates.push(date);
					}
				}
				dates.sort();
				for (var client in r) {
					s += '<table><tr><td><b>Client ' + client + '</b></td><td><b>anonym</b></td><td><b>login</b></td><td><b>teaser</b></td></tr>';
					for (var i = 0; i < dates.length; i++)
						s += '<tr><td>' + dates[i] + '</td><td>' + r[client].anonym[dates[i]]?.length + '</td><td>' + r[client].login[dates[i]]?.length + '</td><td>' + r[client].teaser[dates[i]]?.length + '</td></tr>';
					s += '</table><br/><br/>';
				}
				$('charts').html(s.replace(/undefined/g, '-') + '</div>');
			}
		});
	}
	static reportApi() {
		$.ajax({
			url: api.url + 'report/90/api',
			type: 'GET',
			success(r) {
				var s = '', keys = [];
				for (var e in r)
					keys.push(e);
				keys.sort();
				for (var e in keys)
					s += '<tr><td><b>' + e + '</b></td><td>' + r[e] + '</td></tr>';
				$('charts').html('<div><table>' + s + '</table></div>');
			}
		});
	}
	static ticketDelete(id, event) {
		$.ajax({
			url: api.url + 'ticket/' + id,
			type: 'DELETE',
			success(r) {
				var row = $(event.target).parents('tr');
				row[0].previousSibling.remove();
				row.remove();
			}
		});
	}
	static list() {
		var sql = $('input.log_search').val();
		$.ajax({
			url: api.url + (sql.indexOf('ticket.') > -1 ? 'ticket' : 'log') + '?search=' + encodeURIComponent(sql),
			type: 'GET',
			error(r) {
				alert(r.responseText);
			},
			success(r) {
				lists.data(r);
			}
		});
	}
	static resend(id) {
		var highlight = $('#' + id).parents('tr');
		highlight.css('background', 'yellow');
		setTimeout(function () {
			$.ajax({
				url: api.url + 'resend/' + id,
				type: 'PUT',
				success(r) {
					highlight.css('background', '');
				}
			});
		}, 50);
	}
	static init() {
		if ($('login input')[0].value) {
			start.user = $('login input')[0].value;
			start.password = $('login input')[1].value;
			start.secret = $('login input')[2].value;
		}
		$.ajax({
			url: api.url + 'user',
			type: 'GET',
			success(r) {
				start.data = [];
				for (var i = 1; i < r.length; i++)
					start.data.push(api.convert(r[0], r[i]));
				if (start.user && start.password && start.secret)
					window.localStorage.setItem('credentials', start.user + '\u0015' + start.password + '\u0015' + start.secret);
				start.init();
			}
		});
	}
}
