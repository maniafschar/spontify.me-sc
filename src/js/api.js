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
    static list(id) {
        $.ajax({
            url: api.url + id + '?search=' + encodeURIComponent($('input.' + id + '_search').val()),
            type: 'GET',
            error(r) {
                alert(r.responseText);
            },
            success(r) {
                lists.data(id, r);
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
                if (event === true || event && event.shiftKey)
                    window.localStorage.setItem('credentials', start.user + '\u0015' + start.password + '\u0015' + start.secret);
                else
                    window.localStorage.removeItem('credentials');
                start.init();
            }
        });
    }
    static chat() {
        var id = $('selection').parents('tr').children('td:nth-child(2)').map(function () {
            return $(this).text();
        }).get();
        if (id.length == 0 || !$('chat textarea').val())
            return;
        $.ajax({
            url: api.url + 'chat',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                ids: id,
                text: $('chat textarea').val()
            }),
            success(r) {
                $('chat').css('display', 'none');
            }
        });
    }
}