import { api } from "./api";
import { charts } from "./charts";
import { start } from "./start";

export { doc }

class doc {
	static feedbackTable = null;
	static logTable = null;
	static logSearches = null;

	static feedback(r) {
		var data = [];
		for (var i = 1; i < r.length; i++) {
			data.push(api.convert(r[0], r[i]));
			data[i - 1].createdAt = start.getDisplayDate(data[i - 1].createdAt);
		}
		// prepare table
		if (doc.feedbackTable)
			doc.feedbackTable.destroy();
		var e = $('#feedback')[0];
		e.parentNode.replaceChild(e.cloneNode(true), e);
		$('#feedback').css('display', 'block');
		$('#feedback_wrapper').css('display', 'block');
		doc.feedbackTable = $('#feedback').DataTable({
			'data': data,
			'columns': [
				{
					'className': 'details-control',
					'orderable': false,
					'data': null,
					'defaultContent': '',
					'width': '5%'
				},
				{ 'data': 'id', 'width': '10%' },
				{ 'data': 'createdAt', 'width': '15%' },
				{ 'data': 'pseudonym', 'width': '20%' },
				{ 'data': 'version', 'width': '15%' },
				{ 'data': 'device', 'width': '15%' },
				{ 'data': 'lang', 'width': '15%' },
				{ 'data': 'status', 'width': '10%' }
			],
			'paging': false
		});
		$('#feedback tbody').on('click', 'td.details-control', function () {
			var tr = $(this).closest('tr');
			var row = doc.feedbackTable.row(tr);

			if (row.child.isShown()) {
				row.child.hide();
				tr.removeClass('shown');
			} else {
				row.child(doc.showDetails(row.data())).show();
				tr.addClass('shown');
			}
		});
		doc.feedbackTable.on('draw.dt', function () {
			var fil = $('#feedback tbody>tr').length;
			var tot = data.length;
			$('filtered').text(fil == tot ? '' : ' ' + fil + '/' + tot);
		});
	}
	static listLog(event) {
		if (event.keyCode == 13) {
			var s = $('input.log_search').val(), d = new Date();
			s = s.replace(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), '{date}');
			while ((i = s.indexOf('\'202')) > -1) {
				var date = s.substring(i + 1, s.indexOf('\'', i + 1));
				var d2 = new Date();
				d2.setFullYear(date.split('-')[0]);
				d2.setMonth(date.split('-')[1] - 1);
				d2.setDate(date.split('-')[2]);
				s = s.replace(d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-' + d2.getDate(), '{date' + Math.floor((d2 - d) / (1000 * 60 * 60 * 24)) + '}');
			}
			doc.logSearches.unshift(s);
			for (var i = doc.logSearches.length - 1; i > 0; i--) {
				if (doc.logSearches[i] == s)
					doc.logSearches.splice(i, 1);
			}
			if (doc.logSearches.length > 20)
				doc.logSearches.splice(20, doc.logSearches.length);
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
			api.logSearches();
		else
			$('#log_wrapper').css('display', 'block');
	}
	static log(r) {
		var data = [];
		for (var i = 1; i < r.length; i++) {
			data.push(api.convert(r[0], r[i]));
			data[i - 1].createdAt = start.getDisplayDate(data[i - 1].createdAt);
			data[i - 1].modifiedAt = start.getDisplayDate(data[i - 1].modifiedAt);
		}
		// prepare table
		if (doc.logTable)
			doc.logTable.destroy();
		var e = $('#log')[0];
		e.parentNode.replaceChild(e.cloneNode(true), e);
		$('#log').css('display', 'block');
		$('#log_wrapper').css('display', 'block');
		doc.logTable = $('#log').DataTable({
			'data': data,
			'columns': [
				{
					'className': 'details-control',
					'orderable': false,
					'data': null,
					'defaultContent': '',
					'width': '5%'
				},
				{ 'data': 'createdAt', 'width': '10%' },
				{ 'data': 'method', 'width': '10%' },
				{ 'data': 'uri', 'width': '25%' },
				{ 'data': 'contactId', 'width': '20%' },
				{ 'data': 'time', 'width': '10%' },
				{ 'data': 'status', 'width': '10%' }
			],
			'paging': false
		});
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
			$('#log_wrapper')[0].insertBefore(e3, null);
			e3 = document.createElement('div');
			e3.setAttribute('class', 'log_searchInputHelper');
			$('#log_wrapper')[0].insertBefore(e3, null);
			$('.log_search').on('focus', doc.showLogInputHelper);
		}
	}
	static logSearch(i) {
		doc.logSearches.unshift(doc.logSearches.splice(i, 1)[0]);
		api.log();
	}
	static closePopup(tag) {
		document.getElementsByTagName(tag)[0].style.display = 'none';
	}
	static showLogInputHelper() {
		var s = '';
		for (var i = 0; i < doc.logSearches.length; i++)
			s += '<li onclick="doc.logSearch(' + i + ')">' + doc.logSearches[i] + '</li>';
		var e = $('.log_searchInputHelper');
		e.html('<ul>' + s + '</ul>');
		e.css('display', 'inline-block');
	}
	static showDetails(row) {
		var s = '';
		for (var n in row) {
			if (row[n] && (n.indexOf('Display') < 0 || n == 'idDisplay') && n != 'actions')
				s += '<label>' + n + '</label><value>' + row[n] + '</value><br/>';
		}
		if (row.idDisplay)
			s += '<buttons><button onclick="api.delete(' + row.id + ')">L&ouml;schen</button>'
				+ (row.verified ? '' : '<button onclick="api.resend(' + row.id + ')">Email wieder senden</button>')
				+ '</buttons>';
		return '<entry>' + s + '</entry>';
	}
	static search() {
		$('drillDownTitle').text('');
		charts.filter = null;
		if (doc.getComparator())
			$('#contacts').DataTable().search('').draw();
		else
			$('#contacts').DataTable().search($('input#search').val()).draw();
	}
	static searchLabel(label) {
		$('#search').val(label == $('#search').val() ? '' : label);
		doc.search();
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
		var search = $('input#search').val();
		if (search.length < 2 ||
			(search.charAt(0) != '>' && search.charAt(0) != '<' && search.charAt(0) != '='))
			return;
		var comparator = parseFloat(search.substring(1));
		if (isNaN(comparator))
			return;
		return comparator;
	}
}
