import { lists } from "./lists";
import { start } from "./start";

export { api }

class api {
    static url = 'https://spontify.me/rest/support/';

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
            url: api.url + 'import/location/' + id + '/' + e.previousSibling.value,
            type: 'POST',
            error(r) {
                e.previousSibling.outerHTML = '';
                e.outerHTML = 'Error: ' + r.responseText;
            },
            success() {
                e.parentElement.innerHTML = 'Success';
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
    static init(event) {
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
                if (event === true || event && event.shiftKey) {
                    if (start.user && start.password && start.secret)
                        window.localStorage.setItem('credentials', start.user + '\u0015' + start.password + '\u0015' + start.secret);
                } else
                    window.localStorage.removeItem('credentials');
                start.init();
            }
        });
    }
    static marketing() {
        if (!$('marketing input.text').val())
            return;
        var id;
        if ($('marketing input.search').val())
            id = [];
        else {
            id = $('selection').parents('tr').children('td:nth-child(2)').map(function () {
                return $(this).text();
            }).get();
            if (id.length == 0)
                return;
        }
        $.ajax({
            url: api.url + 'marketing',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                ids: id,
                text: $('marketing input.text').val(),
                search: $('marketing input.search').val(),
                action: $('marketing input.action').val()
            }),
            success(r) {
                $('marketing').css('display', 'none');
            }
        });
    }
}