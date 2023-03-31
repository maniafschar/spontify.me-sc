import { charts } from "./charts";

export { doc }

class doc {
	static closePopup(tag) {
		document.getElementsByTagName(tag)[0].style.display = 'none';
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
		else if (row.type == 'ERROR')
			s += '<buttons><button onclick="api.ticketDelete(' + row.id + ',event)">L&ouml;schen</button></buttons>';
		else if (row.type == 'LOCATION' && row.subject != 'import')
			s += '<buttons><select>' +
				'<option value="0"' + (row.subject.indexOf('0 ') == 0 ? ' selected' : '') + '>Shopping</option>' +
				'<option value="1"' + (row.subject.indexOf('1 ') == 0 ? ' selected' : '') + '>Kultur</option>' +
				'<option value="2"' + (row.subject.indexOf('2 ') == 0 ? ' selected' : '') + '>Restaurant</option>' +
				'<option value="3"' + (row.subject.indexOf('3 ') == 0 ? ' selected' : '') + '>Attraktion</option>' +
				'<option value="4"' + (row.subject.indexOf('4 ') == 0 ? ' selected' : '') + '>Nachtleben</option>' +
				'<option value="5"' + (row.subject.indexOf('5 ') == 0 ? ' selected' : '') + '>Sport/Hobby</option>' +
				'</select><button onclick="api.importLocation(this,' + row.id + ')">Importieren</button><button onclick="api.ticketDelete(' + row.id + ',event)">L&ouml;schen</button></buttons>';
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
