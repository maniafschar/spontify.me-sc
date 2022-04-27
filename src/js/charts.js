import { start } from "./start";

export { charts }

class charts {
    static chart = null;
    static filter = null;

    static toggle() {
        var e = $('charts');
        if (e.css('transform').indexOf('1') > 0) {
            e.css('transform', 'scale(0)');
            if (charts.filter) {
                charts.filter = null;
                $('#contacts').DataTable().search($('input#search').val()).draw();
                $('drillDownTitle').text('');
            }
        } else {
            e.css('margin-top', '');
            e.css('margin-left', '');
            e.css('transform', 'scale(1)');
            if (!$('#chartDataType option:selected').length)
                charts.chooseCategory();
        }
    }
    static draw() {
        var dataType = $('#chartDataType').val();
        if (!dataType)
            return;
        if (!charts[dataType]) {
            alert('unknown chart data type: ' + dataType);
            return;
        }
        if (!charts[dataType].value || !charts[dataType].list) {
            alert('chart data type ' + dataType + ' is missing methods value/list');
            return;
        }
        var config = {
            type: charts[dataType].type ? charts[dataType].type : 'bar',
            data: charts[dataType].list(),
            options: {
                responsive: true
            }
        };
        if (config.type == 'doughnut' || config.type == 'pie') {
            config.options.tooltips = {
                callbacks: {
                    label(tooltipItem, data1) {
                        var dataset = data1.datasets[tooltipItem.datasetIndex];
                        var meta = dataset._meta[Object.keys(dataset._meta)[0]];
                        var currentValue = dataset.data[tooltipItem.index];
                        var percentage = parseFloat((currentValue / meta.total * 100).toFixed(1));
                        return currentValue + ' (' + percentage + '%)';
                    },
                    title(tooltipItem, data1) {
                        return data1.labels[tooltipItem[0].index];
                    }
                }
            }
        } else {
            config.options.scales = {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            };
        }
        if (charts.chart)
            charts.chart.destroy();
        charts.chart = new Chart(document.getElementById('chart').getContext('2d'), config);
    }
    static save() {
        var name = $('#chartDataType option:selected').text();
        if (name) {
            name = $('#chartCategory option:selected').text() + '_' + name + '.png';
            name = name.replace(/ /g, '_');
            var c = document.getElementsByTagName('canvas')[0];
            if (c.msToBlob)
                navigator.msSaveBlob(c.msToBlob(), name);
            else {
                var link = document.createElement('a');
                link.setAttribute('href', c.toDataURL());
                link.setAttribute('download', name);
                link.click();
            }
        }
    }
    static chooseCategory() {
        var selected = $('#chartDataType option:selected').val();
        $('#chartDataType option:selected').attr('selected', null);
        $('#chartDataType option').css('display', 'none');
        var e = $('#chartDataType option[category*=' + $('#chartCategory option:selected').val() + ']');
        e.css('display', 'block');
        if ($('#chartDataType option[value=' + selected + ']').css('display') == 'block')
            $('#chartDataType').val(selected);
        else
            $('#chartDataType').val(e[0].value);
        charts.draw();
    }
    static aggregate(labels) {
        var buckets = [], chartName = $('#chartDataType').val();
        var colors = {}, total = 0, temp = [];
        temp[1] = 'männlich';
        temp[2] = 'weiblich';
        colors[2] = 'rgba(255,150,0,0.4)';
        colors[1] = 'rgba(0,150,255,0.4)';
        for (var i = 0; i < start.data.length; i++) {
            if (charts.isInTimeSpan(start.data[i])) {
                var key = charts[chartName].value(start.data[i]);
                if (key) {
                    var b = null;
                    for (var i2 = 0; i2 < buckets.length; i2++) {
                        if (buckets[i2].label == temp[start.data[i].gender]) {
                            b = buckets[i2];
                            break;
                        }
                    }
                    if (!b) {
                        b = {
                            label: temp[start.data[i].gender],
                            sortKey: Object.keys([]).indexOf(start.data[i].classification),
                            backgroundColor: colors[start.data[i].gender],
                            stack: true,
                            temp: []
                        };
                        buckets.push(b);
                    }
                    if (b.temp[key])
                        b.temp[key]++;
                    else
                        b.temp[key] = 1;
                    total++;
                }
            }
        }
        if (charts[chartName].type == 'doughnut' || charts[chartName].type == 'pie') {
            var d = [];
            for (var i = 0; i < labels.length; i++) {
                var x = 0;
                for (var i2 = 0; i2 < buckets.length; i2++) {
                    if (buckets[i2].temp[labels[i]])
                        x += buckets[i2].temp[labels[i]];
                }
                d.push(x);
            }
            var c = [];
            buckets = [{ 'data': d, 'backgroundColor': c }];
        } else {
            for (var i = 0; i < buckets.length; i++) {
                buckets[i].data = [];
                var x = 0;
                for (var i2 = 0; i2 < labels.length; i2++) {
                    if (buckets[i].temp[labels[i2]]) {
                        buckets[i].data.push(buckets[i].temp[labels[i2]]);
                        x += buckets[i].temp[labels[i2]];
                    } else
                        buckets[i].data.push(0);
                }
                buckets[i].label = buckets[i].label + ' ' + x + '/' + total + ' ' + (x / total * 100 + 0.5).toFixed(0) + '%';
            }
        }
        return {
            labels: labels,
            datasets: buckets.sort(function (e1, e2) { return e1.sortKey - e2.sortKey })
        };
    }
    static isInTimeSpan(record) {
        var t = $('#chartTimespan').val();
        if (t == 'all')
            return true;
        var d = charts.getTimestamp(record);
        if (t == 'year')
            d.setFullYear(d.getFullYear() + 1);
        else
            d.setMonth(d.getMonth() + 1);
        return d > new Date();
    }
    static getTimestamp(record) {
        return new Date(record.createdAt);
    }
    static byDay = {
        value(record) {
            var d = charts.getTimestamp(record);
            if (d)
                return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
        },
        list() {
            return charts.aggregate(calendar.getLabels(1));
        }
    }
    static byDayOfWeek = {
        labels: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
        value(record) {
            var d = charts.getTimestamp(record);
            if (d)
                return charts.byDayOfWeek.labels[(d.getDay() + 6) % 7];
        },
        list() {
            return charts.aggregate(charts.byDayOfWeek.labels);
        }
    }
    static byDayTime = {
        value(record) {
            var d = charts.getTimestamp(record);
            if (d)
                return d.getHours();
        },
        list() {
            var labels = [];
            for (var i = 0; i < 24; i++)
                labels.push('' + i);
            return charts.aggregate(labels);
        }
    }
    static byWeek = {
        value(record) {
            var d = charts.getTimestamp(record);
            if (d)
                return calendar.getYearAndWeek(d);
        },
        list() {
            return charts.aggregate(calendar.getLabels(7));
        }
    }
    static byMonth = {
        value(record) {
            var d = charts.getTimestamp(record);
            if (d)
                return calendar.getYearAndMonth(d);
        },
        list() {
            return charts.aggregate(calendar.getLabels(30));
        }
    }
}