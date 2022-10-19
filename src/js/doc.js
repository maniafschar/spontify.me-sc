import { api } from "./api";
import { charts } from "./charts";
import { start } from "./start";

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
		if (row.type == 'ERROR')
			s += '<buttons><button onclick="api.ticketDelete(' + row.id + ',event)">L&ouml;schen</button></buttons>';
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
	static toggleMarketing() {
		var e = $('marketing');
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
