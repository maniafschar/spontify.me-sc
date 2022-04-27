import { api } from './api';
import { start } from './start';
import { calendar } from './calendar';
import { charts } from './charts';
import { doc } from './doc';
import dt from 'datatables.net';
import Chart from 'chart.js/auto';

window.$ = window.jQuery = $;
global.$.DataTable = dt;
window.Chart = Chart;
window.api = api;
window.doc = doc;
window.start = start;
window.calendar = calendar;
window.charts = charts;
