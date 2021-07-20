export default {
    value: 'DATA_3001_TEAM_BZ03',
    text: '纪委班子',
    childTabItemID: '', // 筛选条件代码项字段
    childTabCodeID: '', // 筛选条件代码项
    LedgerDateOrderItemID: '', // 筛选条件时间排序字段
    A0101ItemID: 'BZ0101', // 姓名筛选字段名
    tblCols: [
        {
            text: '序号',
            field: 'Row_Number',
            dbfield: true,
            width: 50,
            isFixed: true,
            SetID: 'BZ03',
            ItemType: 'S',
        },
        {
            text: '统计单位',
            field: 'BZ03A0195',
            dbfield: true,
            width: 220,
            isFixed: true,
            SetID: 'BZ03',
            ItemType: 'C',
        },
        {
            text: '姓名',
            field: 'BZ0301',
            dbfield: true,
            width: 100,
            isFixed: true,
            SetID: 'BZ03',
            ItemType: 'S',
            IsEdit: true,
        },
        {
            text: '身份证号',
            field: 'BZ0302',
            dbfield: true,
            width: 150,
            isFixed: true,
            SetID: 'BZ03',
            ItemType: 'S',
            IsEdit: true,
        },
        {
            text: '性别',
            field: 'BZ0303',
            dbfield: true,
            width: 100,
            isFixed: true,
            SetID: 'BZ03',
            CodeID: 'GB/T2261.1',
            ItemType: 'C',
            IsEdit: true,
        },
        {
            text: '民族',
            field: 'BZ0304',
            dbfield: true,
            width: 100,
            SetID: 'BZ03',
            CodeID: 'GB3304',
            ItemType: 'C',
            IsEdit: true,
        },
        {
            text: '出生年月',
            field: 'BZ0305',
            dbfield: true,
            width: 100,
            SetID: 'BZ03',
            ItemType: 'D',
            IsTimeItem: true,
            IsEdit: true,
        },
        {
            text: '参加工作时间',
            field: 'BZ0306',
            dbfield: true,
            width: 100,
            SetID: 'BZ03',
            ItemType: 'D',
            IsEdit: true,
            IsTimeItem: true,
            isOrder: true,
        },
        {
            text: '政治面貌',
            field: 'BZ0307',
            dbfield: true,
            width: 100,
            SetID: 'BZ03',
            CodeID: 'GB4762',
            ItemType: 'C',
            IsEdit: true,
        },
        {
            text: '入党时间',
            field: 'BZ0308',
            dbfield: true,
            width: 100,
            SetID: 'BZ03',
            IsEdit: true,
            ItemType: 'D',
            isOrder: true,
            IsTimeItem: true,
        },
        {
            text: '全日制学历',
            field: 'BZ0309',
            dbfield: true,
            width: 150,
            SetID: 'BZ03',
            CodeID: 'GB4658',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
        },
        {
            text: '最高学历',
            field: 'BZ0310',
            dbfield: true,
            width: 150,
            SetID: 'BZ03',
            CodeID: 'GB4658',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
        },
        {
            text: '最高学位',
            field: 'BZ0311',
            dbfield: true,
            width: 150,
            SetID: 'BZ03',
            IsEdit: true,
            ItemType: 'C',
            CodeID: 'GB/T6864',
        },
        {
            text: '职务类别',
            field: 'BZ0312',
            dbfield: true,
            width: 100,
            SetID: 'BZ03',
            CodeID: 'BB033',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
        },
        {
            text: '任现职务时间',
            field: 'BZ0313',
            dbfield: true,
            width: 100,
            SetID: 'BZ03',
            ItemType: 'D',
            IsEdit: true,
            IsTimeItem: true,
            isOrder: true,
        },
        {
            text: '任现职务职级层次时间',
            field: 'BZ0314',
            dbfield: true,
            width: 100,
            SetID: 'BZ03',
            ItemType: 'D',
            IsEdit: true,
            IsTimeItem: true,
            isOrder: true,
        },
        {
            text: '是否具有3年以上乡镇（街道）企事业单位领导工作经历',
            field: 'BZ0315',
            dbfield: true,
            width: 200,
            SetID: 'BZ03',
            CodeID: 'ZJ',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
        },
    ],
};
