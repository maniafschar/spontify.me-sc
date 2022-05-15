import { api } from "./api";
import { charts } from "./charts";
import { start } from "./start";

export { doc }

class doc {
	static feedbackTable = null;
	static logTable = null;
	static logSearch = null;

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
			doc.logSearch = $('input.log_search').val();
			api.log();
		}
	}
	static toggleLog() {
		var e = $('#log_wrapper');
		if (e.length && e.css('display') != 'none') {
			e.css('display', 'none');
			return;
		}
		if (doc.logSearch == null) {
			var d = new Date()
			doc.logSearch = 'log.createdAt > \'' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + '\'';
			api.log();
		} else
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
			e3.setAttribute('value', doc.logSearch);
			$('#log_wrapper')[0].insertBefore(e3, null);
		}
	}
	static closePopup(tag) {
		document.getElementsByTagName(tag)[0].style.display = 'none';
	}
	static showDetails(row) {
		var s = '';
		for (var n in row) {
			if (row[n] != null && n.indexOf('Display') < 0 && n != 'actions')
				s += '<label>' + n + '</label><value>' + row[n] + '</value><br/>';
		}
		if (row.verified == 0)
			s += '<buttons>'
				+ '<button onclick="api.resendRegistrationEmail(' + row.id + ')">Reg.-Email senden</button>'
				+ '<button onclick="api.delete(' + row.id + ')">L&ouml;schen</button>'
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
	static toggleNotification(event) {
		var e = $('notification');
		e.css('display', e.css('display') == 'block' ? 'none' : 'block');
	}
	static toggleSelect(id) {
		var e = $('#' + id).parents('tr').children('td').first();
		e.html(e.text() ? '' : '<selection>⚫</selection>');
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
