import * as highcharts from 'highcharts';
// 加载 Highstock 或 Highmaps 方式类似
// import Highcharts from 'highcharts/highstock';
import Exporting from 'highcharts/modules/exporting';

// 初始化导出模块
Exporting(highcharts);

// 全局配置，对当前页面的所有图表有效

highcharts.setOptions({
    lang: {
        contextButtonTitle: '图表导出菜单',
        decimalPoint: '.',
        downloadJPEG: '下载JPEG图片',
        downloadPDF: '下载PDF文件',
        downloadPNG: '下载PNG文件',
        downloadSVG: '下载SVG文件',
        drillUpText: '返回 {series.name}',
        loading: '加载中',
        months: [
            '一月',
            '二月',
            '三月',
            '四月',
            '五月',
            '六月',
            '七月',
            '八月',
            '九月',
            '十月',
            '十一月',
            '十二月',
        ],
        noData: '没有数据',
        numericSymbols: ['千', '兆', 'G', 'T', 'P', 'E'],
        printChart: '打印图表',
        resetZoom: '恢复缩放',
        resetZoomTitle: '恢复图表',
        shortMonths: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ],
        thousandsSep: ',',
        weekdays: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期天'],
    },
    credits: { enabled: false },
});

/**
 * 统计图
 */
export const Highcharts = highcharts;
