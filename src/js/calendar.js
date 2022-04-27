import { charts } from "./charts";
import { start } from "./start";

export { calendar }

class calendar {
    bankHolidays = null;

    static getYearAndWeek(date) {
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        var week1 = new Date(date.getFullYear(), 0, 4);
        var weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        return '' + date.getFullYear() + '-KW' + ('0' + weekNum).slice(-2);
    }
    static getYearAndMonth(date) {
        return '' + date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
    }
    static calculateWorkingDays(d1, d2) {
        var bankHolidays = calendar.getBankHolidays(d1, d2);
        while (d1.getDay() == 0 || d1.getDay() == 6 ||
            bankHolidays[d1.getFullYear() + '.' + (d1.getMonth() + 1) + '.' + d1.getDate()]) {
            d1.setDate(d1.getDate() + 1);
            d1.setHours(5);
            d1.setMinutes(0);
            d1.setSeconds(0);
        }
        var days = (d2 - d1) / 1000 / 60 / 60 / 24;
        while (d1 < d2) {
            if (d1.getDay() == 0 || d1.getDay() == 6 ||
                bankHolidays[d1.getFullYear() + '.' + (d1.getMonth() + 1) + '.' + d1.getDate()])
                days--;
            d1.setDate(d1.getDate() + 1);
        }
        return days < 0 ? 0 : days.toFixed(1);
    }
    static getBankHolidays() {
        if (!calendar.bankHolidays) {
            calendar.bankHolidays = [];
            var date1 = new Date(start.data[start.data.length - 1].createdAt), date2 = new Date();
            var dynamicDays = [
                -48, // Rosenmontag
                -47, // Fastnachtsdienstag
                -46, // Aschermittwoch
                -2, // Karfreitag
                0, // Ostersonntag
                +1, // Ostermontag
                +39, // Christi Himmelfahrt
                +49, // Pfingstsonntag
                +50, // Pfingstmontag
                +60, // Fronleichnam
            ]
            for (var year = date1.getFullYear(); year <= date2.getFullYear(); year++) {
                calendar.bankHolidays[year + '.12.26'] = 1;
                calendar.bankHolidays[year + '.12.25'] = 1;
                calendar.bankHolidays[year + '.12.24'] = 1;
                calendar.bankHolidays[year + '.11.1'] = 1;
                calendar.bankHolidays[year + '.10.31'] = 1;
                calendar.bankHolidays[year + '.10.3'] = 1;
                calendar.bankHolidays[year + '.5.1'] = 1;
                calendar.bankHolidays[year + '.1.6'] = 1;
                calendar.bankHolidays[year + '.1.1'] = 1;

                var a = year % 19;
                var d = (19 * a + 24) % 30;
                var day = d + (2 * (year % 4) + 4 * (year % 7) + 6 * d + 5) % 7;
                if (day == 35 || (day == 34 && d == 28 && a > 10))
                    day -= 7;
                var easter = new Date(year, 2, 22);
                easter.setTime(easter.getTime() + 86400000 * day);
                for (var i = 0; i < dynamicDays.length; i++) {
                    var date = new Date(easter);
                    date.setDate(date.getDate() + dynamicDays[i]);
                    calendar.bankHolidays[year + '.' + (date.getMonth() + 1) + '.' + date.getDate()] = 1;
                }
            }
        }
        return calendar.bankHolidays;
    }
    static getLabels(delta) {
        for (var i = start.data.length - 1; i >= 0; i--) {
            if (charts.isInTimeSpan(start.data[i])) {
                var chartName = $('#chartDataType').val();
                var start = new Date(start.data[i].createdAt);
                var today = new Date();
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                var labels = [];
                if (delta == 30)
                    today.setMonth(today.getMonth() + 1);
                else
                    today.setDate(today.getDate() + delta);
                if (delta > 1 && delta < 30 && today.getDay() != 1)
                    today.setDate(today.getDate() - ((today.getDay() + 6) % 7));
                while (start < today) {
                    labels.push(charts[chartName].value({ createdAt: start.getTime() }));
                    if (delta == 30)
                        start.setMonth(start.getMonth() + 1);
                    else
                        start.setDate(start.getDate() + delta);
                }
                return labels;
            }
        }
    }
}
