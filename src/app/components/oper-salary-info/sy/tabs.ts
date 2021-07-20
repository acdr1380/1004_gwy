const personBaseInfo = [
    {
        TABLE_DISPLAY_CODE: 'A01',
        TABLE_CODE: 'A01',
        TABLE_NAME: '个人信息',
        IS_MAIN: true,
        PSN: true,
    },
    { TABLE_DISPLAY_CODE: 'GZ01', TABLE_CODE: 'GZ01', TABLE_NAME: '学历情况' },
    { TABLE_DISPLAY_CODE: 'GZ02', TABLE_CODE: 'GZ02', TABLE_NAME: '任职情况' },
    { TABLE_DISPLAY_CODE: 'GZ06', TABLE_CODE: 'GZ06', TABLE_NAME: '考核情况' },
    { TABLE_DISPLAY_CODE: 'GZ42', TABLE_CODE: 'GZ42', TABLE_NAME: '处分情况' },
    { TABLE_DISPLAY_CODE: 'GZ42', TABLE_CODE: 'GZ42', TABLE_NAME: '高低定情况' },
    { TABLE_DISPLAY_CODE: 'JBT', TABLE_CODE: 'GZDA07', TABLE_NAME: '津补贴', IS_Allow: true },
    {
        TABLE_DISPLAY_CODE: 'GZA01',
        TABLE_CODE: 'GZA01',
        TABLE_NAME: '工资标识信息',
        IS_MAIN: false,
        PSN: true,
    },
];

const personSalaryInfo = [
    {
        TABLE_DISPLAY_CODE: 'GZDA07',
        TABLE_CODE: 'GZDA07',
        TABLE_NAME: '现执行工资',
        IS_MAIN: false,
        PSN: true,
    },
    {
        TABLE_DISPLAY_CODE: 'GZ07',
        TABLE_CODE: 'GZ07',
        TABLE_NAME: '工资变迁',
    },
    {
        TABLE_DISPLAY_CODE: 'GZ10',
        TABLE_CODE: 'GZ10',
        TABLE_NAME: '套改情况',
    },
];

export { personBaseInfo, personSalaryInfo };
