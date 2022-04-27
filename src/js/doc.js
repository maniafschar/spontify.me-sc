import { api } from "./api";
import { charts } from "./charts";
import { start } from "./start";

export { doc }

class doc {
	static feedbackTable = null;
	static feedback(r) {
		var data = [];
		for (var i = 1; i < r.length; i++) {
			data.push(api.convert(r[0], r[i]));
			data[i - 1].createdAt = start.getDisplayDate(data[i - 1].createdAt);
			data[i - 1].type = data[i - 1].type ? data[i - 1].type.toLowerCase() : '';
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
				{ 'data': 'type', 'width': '10%' },
				{ 'data': 'createdAt', 'width': '15%' },
				{ 'data': 'pseudonym', 'width': '20%' },
				{ 'data': 'version', 'width': '10%' },
				{ 'data': 'device', 'width': '10%' },
				{ 'data': 'lang', 'width': '10%' },
				{ 'data': 'status', 'width': '10%' }
			],
			'paging': false,
			'order': [[1, 'desc']]
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
	static closePopup(tag) {
		document.getElementsByTagName(tag)[0].style.display = 'none';
	}
	static showDetails(row) {
		var s = '';
		for (var n in row) {
			if (row[n] && n.indexOf('Display') < 0 && n != 'actions')
				s += '<label>' + n + '</label><value>' + row[n] + '</value><br/>';
		}
		if (row.appname)
			s += '<buttons><button onclick="api.deleteFeedback(' + row.id + ')">Löschen</button></buttons>'
		else if (row.verified == 0)
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
