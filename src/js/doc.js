import { api } from "./api";
import { charts } from "./charts";
import { start } from "./start";

export { doc }

class doc {
	static ticketTable = null;
	static logTable = null;
	static logSearches = null;

	static ticket(r) {
		var data = [];
		for (var i = 1; i < r.length; i++) {
			data.push(api.convert(r[0], r[i]));
			data[i - 1].createdAt = start.getDisplayDate(data[i - 1].createdAt);
		}
		// prepare table
		if (doc.ticketTable)
			doc.ticketTable.destroy();
		var e = $('#ticket')[0];
		e.parentNode.replaceChild(e.cloneNode(true), e);
		$('#ticket').css('display', 'block');
		$('#ticket_wrapper').css('display', 'block');
		doc.ticketTable = $('#ticket').DataTable({
			data: data,
			'columns': [
				{
					className: 'details-control',
					orderable: false,
					data: null,
					defaultContent: '',
					width: '5%'
				},
				{ data: 'createdAt', title: 'createdAt', width: '15%' },
				{ data: 'type', title: 'type', width: '10%' },
				{ data: 'subject', title: 'subject', width: '20%' },
				{ data: 'note', title: 'note', width: '50%' }
			],
			'paging': false
		});
		$('#ticket tbody').on('click', 'td.details-control', function () {
			var tr = $(this).closest('tr');
			var row = doc.ticketTable.row(tr);

			if (row.child.isShown()) {
				row.child.hide();
				tr.removeClass('shown');
			} else {
				row.child(doc.showDetails(row.data())).show();
				tr.addClass('shown');
			}
		});
		doc.ticketTable.on('draw.dt', function () {
			var fil = $('#ticket tbody>tr').length;
			var tot = data.length;
			$('filtered').text(fil == tot ? '' : ' ' + fil + '/' + tot);
		});
	}
	static listLog(event) {
		if (event.keyCode == 13) {
			var s = $('input.log_search').val().trim(), d = new Date(), i = -1;
			s = s.replace(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), '{date}');
			while ((i = s.indexOf('\'202', i + 1)) > -1) {
				var date = s.substring(i + 1, s.indexOf('\'', i + 1)).split('-');
				if (date.length > 2) {
					var d2 = new Date();
					d2.setFullYear(date[0]);
					d2.setMonth(date[1] - 1);
					d2.setDate(date[2]);
					s = s.replace(d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-' + d2.getDate(), '{date' + Math.floor((d2 - d) / (1000 * 60 * 60 * 24)) + '}');
				}
			}
			var found = false;
			for (i = 0; i < doc.logSearches.length; i++) {
				if (doc.logSearches[i].s == s) {
					doc.logSearches[i].i++;
					found = true;
					break;
				}
			}
			doc.logSearches.sort(function (e1, e2) { return e2.i - e1.i })
			if (!found && s.indexOf(' ') > 0) {
				if (doc.logSearches.length > 9)
					doc.logSearches.splice(9, doc.logSearches.length);
				doc.logSearches.push({ i: 1, s: s });
			}
			api.log();
		}
	}
	static toggleLog() {
		var e = $('#log_wrapper');
		if (e.length && e.css('display') != 'none') {
			e.css('display', 'none');
			return;
		}
		if (doc.logSearches == null)
			api.logInit();
		else
			$('#log_wrapper').css('display', 'block');
	}
	static log(r) {
		var data = [], differentValuesInColumn = {};
		for (var i = 1; i < r.length; i++) {
			data.push(api.convert(r[0], r[i]));
			for (var i2 = 0; i2 < r[i].length; i2++) {
				if (r[1][i2] != r[i][i2])
					differentValuesInColumn[r[0][i2].substring(r[0][i2].indexOf('.') + 1)] = true;
			}
			data[i - 1].createdAt = start.getDisplayDate(data[i - 1].createdAt);
			data[i - 1].modifiedAt = start.getDisplayDate(data[i - 1].modifiedAt);
			data[i - 1].ip = start.getDisplayIp(data[i - 1].ip);
		}
		// prepare table
		var search = $('.log_search').val();
		if (doc.logTable) {
			doc.logTable.destroy();
			$('#log').empty();
		}
		var e = $('#log')[0];
		e.parentNode.replaceChild(e.cloneNode(true), e);
		$('#log').css('display', 'block');
		$('#log_wrapper').css('display', 'block');
		var config = {
			data: data,
			columns: [
				{
					className: 'details-control',
					orderable: false,
					data: null,
					defaultContent: '',
					width: '5%'
				},
			],
			autoWidth: false,
			paging: false
		};
		var widthTotal = parseInt(config.columns[0].width);
		var addColumn = function (name, width) {
			if (widthTotal < 100 && differentValuesInColumn[name]) {
				config.columns.push({ data: name, title: name, width: (widthTotal + width > 100 ? 100 - widthTotal : width) + '%' });
				widthTotal += width;
			}
		};
		addColumn('createdAt', 10);
		addColumn('method', 10);
		addColumn('uri', 35);
		addColumn('contactId', 20);
		addColumn('time', 10);
		addColumn('status', 10);
		addColumn('ip', 10);
		addColumn('referer', 15);
		addColumn('query', 15);
		doc.logTable = $('#log').DataTable(config);
		$('#log tbody').on('click', 'td.details-control', function () {
			var tr = $(this).closest('tr');
			var row = doc.logTable.row(tr);

			if (row.child.isShown()) {
				row.child.hide();
				tr.removeClass('shown');
			} else {
				row.child(doc.showDetails(row.data())).show();
				tr.addClass('shown');
			}
		});
		doc.logTable.on('draw.dt', function () {
			var fil = $('#log tbody>tr').length;
			var tot = data.length;
			$('filtered').text(fil == tot ? '' : ' ' + fil + '/' + tot);
		});
		if (!$('input.log_search').length) {
			var e3 = document.createElement('input');
			e3.setAttribute('class', 'log_search');
			e3.setAttribute('onkeyup', 'doc.listLog(event)');
			e3.setAttribute('onblur', 'doc.logCloseSearch()');
			$('#log_wrapper')[0].insertBefore(e3, null);
			e3 = document.createElement('div');
			e3.setAttribute('class', 'log_searchInputHelper');
			$('#log_wrapper')[0].insertBefore(e3, null);
			$('.log_search').on('focus', doc.showLogInputHelper);
			$('.log_search').val(search);
		}
	}
	static logCloseSearch(event, search) {
		if (search) {
			var d = new Date(), i;
			search = search.replace('{date}', d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate());
			while ((i = search.indexOf('{date')) > -1) {
				var days = search.substring(i + 6, search.indexOf('}'));
				var d2 = new Date();
				d2.setDate(d.getDate() - days);
				search = search.replace('{date-' + days + '}', d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-' + d2.getDate());
			}
			$('input.log_search').val(search);
			if (!event.shiftKey)
				api.log();
		}
		setTimeout(function () {
			$('.log_searchInputHelper').css('display', 'none');
		}, 500);
	}
	static logSearch(event, i) {
		doc.logCloseSearch(event, doc.logSearches[i].s);
		setTimeout(() => {
			$('input.log_search').focus();
		}, 50);
	}
	static closePopup(tag) {
		document.getElementsByTagName(tag)[0].style.display = 'none';
	}
	static showLogInputHelper() {
		var s = '';
		for (var i = 0; i < doc.logSearches.length; i++)
			s += '<li onclick="doc.logSearch(event, ' + i + ')">' + doc.logSearches[i].s + '<span>' + doc.logSearches[i].i + '</span></li>';
		var e = $('.log_searchInputHelper');
		e.html('<ul>' + s + '</ul>');
		e.css('display', 'inline-block');
	}
	static showDetails(row) {
		var s = '';
		for (var n in row) {
			if (row[n] && (n.indexOf('Display') < 0 || n == 'idDisplay') && n != 'actions')
				s += '<label>' + n + '</label><value>' + (row[n].replace ? row[n].trim().replace(/\n/g, '<br/>').replace(/\t/g, '    ').replace(/ /g, '&nbsp;') : row[n]) + '</value><br/>';
		}
		if (row.idDisplay)
			s += '<buttons><button onclick="api.delete(' + row.id + ')">L&ouml;schen</button>'
				+ (row.verified ? '' : '<button onclick="api.resend(' + row.id + ')">Email wieder senden</button>')
				+ '</buttons>';
		return '<entry>' + s + '</entry>';
	}
	static filter() {
		$('drillDownTitle').text('');
		charts.filter = null;
		if (doc.getComparator())
			$('#contacts').DataTable().search('').draw();
		else
			$('#contacts').DataTable().search($('input#filter').val()).draw();
	}
	static filterLabel(label) {
		$('#filter').val(label == $('#filter').val() ? '' : label);
		doc.filter();
	}
	static toggleChat() {
		var e = $('chat');
		e.css('display', e.css('display') == 'block' ? 'none' : 'block');
	}
	static toggleSelect(id) {
		var e = $('#' + id).parents('tr').children('td').first();
		e.html(e.text() ? '' : '<selection>⚫</selection>');
		var s = '';
		var selection = $('selection').parents('tr');
		for (var i = 0; i < selection.length; i++)
			s += ', ' + selection[i].childNodes[2].firstChild.innerText;
		$('users').text(s.substring(2));
	}
	static getComparator() {
		var filter = $('input#filter').val();
		if (filter.length < 2 ||
			(filter.charAt(0) != '>' && filter.charAt(0) != '<' && filter.charAt(0) != '='))
			return;
		var comparator = parseFloat(filter.substring(1));
		if (isNaN(comparator))
			return;
		return comparator;
	}
}
