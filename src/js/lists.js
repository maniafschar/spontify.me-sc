import { api } from "./api";
import { doc } from "./doc";
import { start } from "./start";

export { lists }

class lists {
	static logTable = null;

	static toggle() {
		var e = $('#log_wrapper');
		if (e.length && e.css('display') != 'none') {
			e.css('display', 'none');
			return;
		}
		e = $('#log_wrapper');
		if (e.css('display') != 'none')
			e.css('display', 'none');
		if (!$('input.log_search').length) {
			lists.logTable = $('#log').DataTable({
				data: null,
				columns: [{}],
				autoWidth: false,
				paging: false
			});
			lists.init();
		}
		$('#log_wrapper').css('display', 'block');
	}
	static init() {
		var e = document.createElement('input');
		e.setAttribute('class', 'log_search');
		e.setAttribute('onkeyup', 'lists.search(event)');
		$('#log_wrapper')[0].insertBefore(e, null);
		e = document.createElement('span');
		e.setAttribute('class', 'buttons');
		var s = '', sqls =
			[
				{ label: 'log', sql: 'log.createdAt>\'{date-1}\' and log.uri not like \'/support/%\'' },
				{ label: 'support', sql: 'log.createdAt>\'{date-1}\' and log.uri like \'/support/%\'' },
				{ label: 'ad', sql: 'log.createdAt>\'{date-1}\' and log.uri=\'ad\'' },
				{ label: 'error', sql: 'ticket.type=\'ERROR\'' },
				{ label: 'email', sql: 'ticket.type=\'EMAIL\'' },
				{ label: 'registration', sql: 'ticket.type=\'REGISTRATION\'' },
				{ label: 'block', sql: 'ticket.type=\'BLOCK\'' },
				{ label: 'google', sql: 'ticket.createdAt>\'{date-1}\' and ticket.type=\'GOOGLE\'' }
			];
		for (var i = 0; i < sqls.length; i++)
			s += '<button class="bgColor" onclick="lists.search(event,&quot;' + sqls[i].sql + '&quot;)">' + sqls[i].label + '</button></span>';
		e.innerHTML = s;
		$('#log_wrapper')[0].insertBefore(e, $('#log')[0]);
		e = $('#log_wrapper .dataTables_filter label')[0];
		e.innerHTML = e.innerHTML.replace('Search:', '');
		$('#log_filter input').on('keyup', lists.filter);
	}
	static data(r) {
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
		if (lists.logTable) {
			lists.logTable.destroy();
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
				}
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
		addColumn('city', 10);
		addColumn('referer', 15);
		addColumn('query', 15);
		addColumn('type', 15);
		addColumn('subject', 25);
		addColumn('note', 45);
		lists.logTable = $('#log').DataTable(config);
		$('#log tbody').on('click', 'td.details-control', function () {
			var tr = $(this).closest('tr');
			var row = lists.logTable.row(tr);

			if (row.child.isShown()) {
				row.child.hide();
				tr.removeClass('shown');
			} else {
				row.child(doc.showDetails(row.data())).show();
				tr.addClass('shown');
			}
		});
		lists.init();
		$('.log_search').val(search);
	}
	static filter() {
		$("#log").DataTable().search($("#log_filter input").val()).draw()
	}
	static search(event, sql) {
		var d = new Date(), i;
		if (sql) {
			var search = sql.replace('{date}', d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate());
			while ((i = search.indexOf('{date')) > -1) {
				var days = search.substring(i + 6, search.indexOf('}'));
				var d2 = new Date();
				d2.setDate(d.getDate() - days);
				search = search.replace('{date-' + days + '}', d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-' + d2.getDate());
			}
			$('input.log_search').val(search);
		}
		if (event.keyCode == 13 || sql && !event.shiftKey)
			api.list();
	}
}