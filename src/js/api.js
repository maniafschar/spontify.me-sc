import { doc } from "./doc";
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
    static feedback() {
        var e = $('#feedback_wrapper');
        if (e.length && e.css('display') != 'none') {
            e.css('display', 'none');
            return;
        }
        $.ajax({
            url: api.url + 'feedback',
            type: 'GET',
            success(r) {
                doc.feedback(r);
            }
        });
    }
    static log() {
        $.ajax({
            url: api.url + 'log/search',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(doc.logSearches),
            success(r) {
                var search = doc.logSearches[0], d = new Date(), i;
                search = search.replace('{date}', d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate());
                while ((i = search.indexOf('{date')) > -1) {
                    var days = search.substring(i + 6, search.indexOf('}'));
                    var d2 = new Date();
                    d2.setDate(d.getDate() - days);
                    search = search.replace('{date-' + days + '}', d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-' + d2.getDate());
                }
                $.ajax({
                    url: api.url + 'log?search=' + encodeURIComponent(search),
                    type: 'GET',
                    error(r) {
                        alert(r.responseText);
                    },
                    success(r) {
                        doc.log(r);
                        var e = $('input.log_search');
                        if (!e.val())
                            e.val(search);
                        doc.logCloseSearch();
                    }
                });
            }
        });
    }
    static logSearches() {
        $.ajax({
            url: api.url + 'log/search',
            type: 'GET',
            dataType: 'JSON',
            success(r) {
                doc.logSearches = r;
                doc.log([]);
                $('input.log_search').focus();
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
        }
        $.ajax({
            url: api.url + 'user',
            type: 'GET',
            success(r) {
                start.data = [];
                for (var i = 1; i < r.length; i++)
                    start.data.push(api.convert(r[0], r[i]));
                if (event === true || event && event.shiftKey)
                    window.localStorage.setItem('credentials', start.user + '\u0015' + start.password);
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