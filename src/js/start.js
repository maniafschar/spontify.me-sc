import { api } from "./api";
import { charts } from "./charts";
import { doc } from "./doc";

export { sha256, start };

class start {
    static data = [];
    static password;
    static secret;
    static user;

    static fillStatistics() {
        var verified = 0;
        for (var i = 0; i < start.data.length; i++) {
            if (start.data[i].verified)
                verified++;
        }
        var s = '<label onclick="doc.filterLabel(&quot;verifiziert&quot;)">' + verified + ' verifiziert</label> · ';
        s += '<label onclick="doc.filterLabel(&quot;ausstehend&quot;)">' + (start.data.length - verified) + ' ausstehend</label> · ';
        s += '<label onclick="doc.filterLabel(&quot;&quot;)">' + start.data.length + ' total</label>';
        $('.statistics regs').html(s);
    }
    static getDisplayDate(time) {
        if (!time)
            return;
        var d = new Date(time);
        return (d.getYear() - 100) + '-'
            + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
            + ('0' + d.getDate()).slice(-2) + ' '
            + ('0' + d.getHours()).slice(-2) + ':'
            + ('0' + d.getMinutes()).slice(-2) + ':'
            + ('0' + d.getSeconds()).slice(-2)
    }
    static getDisplayStatus(data) {
        return '<status class="' + (data.verified ? 'sun' : 'cloud') + '">' + (data.verified ? 'verifiziert' : 'ausstehend') + '</status>';
    }
    static getDisplayPseudonym(data) {
        return '<span onclick="doc.toggleSelect(' + data.id + ')" id="' + data.id + '">' + data.pseudonym + '</span>';
    }
    static getDisplayIp(ip) {
        return ip ? '<a href="https://whatismyipaddress.com/ip/' + ip + '" target="sc_ip">' + ip + '</a>' : '';
    }
    static getDisplayNote(note) {
        return note ? note.replace(/</g, '&lt;') : '';
    }
    static init() {
        $('login').remove();
        start.prepareData(start.data);
        start.prepareTable(start.data);
        start.prepareCharts();
    }
    static prepareData(data) {
        for (var i = data.length - 1; i >= 0; i--) {
            data[i].createdAt = start.getDisplayDate(data[i].createdAt);
            data[i].modifiedAt = start.getDisplayDate(data[i].modifiedAt);
            data[i].lastLogin = start.getDisplayDate(data[i].lastLogin);
            data[i].statusDisplay = start.getDisplayStatus(data[i]);
            data[i].pseudonymDisplay = start.getDisplayPseudonym(data[i]);
        }
        start.fillStatistics();
    }
    static prepareTable(data) {
        var table = $('#contacts').DataTable({
            'data': data,
            'columns': [
                {
                    'className': 'details-control',
                    'orderable': false,
                    'data': null,
                    'defaultContent': '',
                    'width': '5%'
                },
                { 'data': 'id', 'width': '5%' },
                { 'data': 'clientId', 'width': '2%' },
                { 'data': 'pseudonymDisplay', 'width': '13%' },
                { 'data': 'createdAt', 'width': '10%' },
                { 'data': 'lastLogin', 'width': '10%', 'defaultContent': '' },
                { 'data': 'os', 'width': '10%' },
                { 'data': 'version', 'width': '10%' },
                { 'data': 'language', 'width': '10%' },
                { 'data': 'statusDisplay', 'width': '10%' }
            ],
            'paging': false,
            'order': [[0, 'desc']]
        });
        $('#contacts tbody').on('click', 'td.details-control', function () {
            var tr = $(this).closest('tr');
            var row = table.row(tr);

            if (row.child.isShown()) {
                row.child.hide();
                tr.removeClass('shown');
            } else {
                row.child(doc.showDetails(row.data())).show();
                tr.addClass('shown');
            }
        });
        table.on('draw.dt', function () {
            var fil = $('#contacts tbody>tr').length;
            var tot = data.length;
            $('filtered').text(fil == tot ? '' : ' ' + fil + '/' + tot);
        });
        $('input#filter').val('');
        $('input#filter').on('keyup', doc.filter);
        $.fn.dataTable.ext.search.push(
            function (settings, data, dataIndex) {
                var comparator = doc.getComparator();
                if (!comparator)
                    return true;
                var filter = $('input#filter').val();
                var value = parseFloat(data[data.length - 2].replace(/[A-Z]/ig, ''));
                if (!isNaN(value) && (filter.charAt(0) == '>' && value > comparator ||
                    filter.charAt(0) == '<' && value < comparator ||
                    filter.charAt(0) == '=' && parseInt(value) == parseInt(comparator))) {
                    return true;
                }
                return false;
            }
        );
        $.fn.dataTable.ext.search.push(
            function (settings, row, rowIndex) {
                if (!charts.filter)
                    return true;
                var filter = charts.filter.split(':');
                return charts[filter[0]].value(data[rowIndex]) == filter[1];
            }
        );
    }
    static prepareCharts() {
        $('canvas').on('click', function clickHandler(evt) {
            if ($('charts').css('transform').indexOf('0.1') > 0) {
                $('charts').css('margin-top', '');
                $('charts').css('margin-left', '');
                $('charts').css('transform', 'scale(1)');
            } else {
                var p = charts.chart.getElementAtEvent(evt)[0];
                if (p) {
                    $('drillDownTitle').text($('#chartDataType option:selected').text()
                        + ', ' + charts.chart.data.labels[p._index]);
                    $('input#filter').val('');
                    charts.filter = $('#chartDataType option:selected').val() + ':' + charts.chart.data.labels[p._index];
                    $('#contacts').DataTable().draw();
                    $('charts').css('margin-top', '-20%');
                    $('charts').css('margin-left', '-40%');
                    $('charts').css('transform', 'scale(0.1)');
                }
            }
        });
    }
};

$(function () {
    $.ajaxSetup({
        crossDomain: true,
        cache: false,
        timeout: 60000,
        beforeSend: api.beforeServerCall,
        error: function (e) {
            alert(e.responseText);
        }
    });
    if (window.localStorage.getItem('credentials')
        && window.localStorage.getItem('credentials').split('\u0015').length == 3) {
        start.user = window.localStorage.getItem('credentials').split('\u0015');
        start.secret = start.user[2];
        start.password = start.user[1];
        start.user = start.user[0];
        api.init();
    } else
        $('login').css('display', '');
});

class sha256 {
    static hash(s) {
        return sha256.rstr2hex(sha256.rstr_sha256(sha256.str2rstr_utf8(s)));
    }
    static str2rstr_utf8(input) {
        var output = "";
        var i = -1;
        var x, y;

        while (++i < input.length) {
            /* Decode utf-16 surrogate pairs */
            x = input.charCodeAt(i);
            y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                i++;
            }

            /* Encode output as utf-8 */
            if (x <= 0x7F)
                output += String.fromCharCode(x);
            else if (x <= 0x7FF)
                output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                    0x80 | (x & 0x3F));
            else if (x <= 0xFFFF)
                output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
            else if (x <= 0x1FFFFF)
                output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                    0x80 | ((x >>> 12) & 0x3F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
        }
        return output;
    }
    static rstr_sha256(s) {
        return sha256.binb2rstr(sha256.binb_sha256(sha256.rstr2binb(s), s.length * 8));
    }
    static rstr2hex(input) {
        var hex_tab = '0123456789abcdef';
        var output = '';
        var x;
        for (var i = 0; i < input.length; i++) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F)
                + hex_tab.charAt(x & 0x0F);
        }
        return output;
    }
    static rstr2binb(input) {
        var output = Array(input.length >> 2);
        for (var i = 0; i < output.length; i++)
            output[i] = 0;
        for (var i = 0; i < input.length * 8; i += 8)
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
        return output;
    }
    static binb_sha256(m, l) {
        var HASH = new Array(1779033703, -1150833019, 1013904242, -1521486534,
            1359893119, -1694144372, 528734635, 1541459225);
        var W = new Array(64);
        var a, b, c, d, e, f, g, h;
        var i, j, T1, T2;

        /* append padding */
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;

        for (i = 0; i < m.length; i += 16) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];

            for (j = 0; j < 64; j++) {
                if (j < 16)
                    W[j] = m[j + i];
                else
                    W[j] = sha256.safe_add(sha256.safe_add(sha256.safe_add(sha256.sha256_Gamma1256(W[j - 2]), W[j - 7]), sha256.sha256_Gamma0256(W[j - 15])), W[j - 16]);
                T1 = sha256.safe_add(sha256.safe_add(sha256.safe_add(sha256.safe_add(h, sha256.sha256_Sigma1256(e)), sha256.sha256_Ch(e, f, g)), sha256.sha256_K[j]), W[j]);
                T2 = sha256.safe_add(sha256.sha256_Sigma0256(a), sha256.sha256_Maj(a, b, c));
                h = g;
                g = f;
                f = e;
                e = sha256.safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = sha256.safe_add(T1, T2);
            }

            HASH[0] = sha256.safe_add(a, HASH[0]);
            HASH[1] = sha256.safe_add(b, HASH[1]);
            HASH[2] = sha256.safe_add(c, HASH[2]);
            HASH[3] = sha256.safe_add(d, HASH[3]);
            HASH[4] = sha256.safe_add(e, HASH[4]);
            HASH[5] = sha256.safe_add(f, HASH[5]);
            HASH[6] = sha256.safe_add(g, HASH[6]);
            HASH[7] = sha256.safe_add(h, HASH[7]);
        }
        return HASH;
    }
    static sha256_S(X, n) { return (X >>> n) | (X << (32 - n)); }
    static sha256_R(X, n) { return (X >>> n); }
    static sha256_Gamma0256(x) { return (sha256.sha256_S(x, 7) ^ sha256.sha256_S(x, 18) ^ sha256.sha256_R(x, 3)); }
    static sha256_Gamma1256(x) { return (sha256.sha256_S(x, 17) ^ sha256.sha256_S(x, 19) ^ sha256.sha256_R(x, 10)); }
    static sha256_Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
    static sha256_Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
    static sha256_Sigma0256(x) { return (sha256.sha256_S(x, 2) ^ sha256.sha256_S(x, 13) ^ sha256.sha256_S(x, 22)); }
    static sha256_Sigma1256(x) { return (sha256.sha256_S(x, 6) ^ sha256.sha256_S(x, 11) ^ sha256.sha256_S(x, 25)); }

    static sha256_K = new Array(
        1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993,
        -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
        1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
        264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
        -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
        113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
        1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885,
        -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
        430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
        1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
        -1866530822, -1538233109, -1090935817, -965641998
    );
    static safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
    static binb2rstr(input) {
        var output = "";
        for (var i = 0; i < input.length * 32; i += 8)
            output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
        return output;
    }
}
