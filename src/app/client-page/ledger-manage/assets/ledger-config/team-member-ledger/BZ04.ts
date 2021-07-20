export default {
    value: 'DATA_3001_TEAM_BZ04',
    text: '人大班子',
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
            SetID: 'BZ04',
            ItemType: 'S',
        },
        {
            text: '统计单位',
            field: 'BZ04A0195',
            dbfield: true,
            width: 220,
            isFixed: true,
            SetID: 'BZ04',
            ItemType: 'C',
        },
        {
            text: '姓名',
            field: 'BZ0401',
            dbfield: true,
            width: 100,
            isFixed: true,
            SetID: 'BZ04',
            ItemType: 'S',
            IsEdit: true,
        },
        {
            text: '身份证号',
            field: 'BZ0402',
            dbfield: true,
            width: 150,
            isFixed: true,
            SetID: 'BZ04',
            ItemType: 'S',
            IsEdit: true,
        },
        {
            text: '性别',
            field: 'BZ0403',
            dbfield: true,
            width: 100,
            isFixed: true,
            SetID: 'BZ04',
            CodeID: 'GB/T2261.1',
            ItemType: 'C',
            IsEdit: true,
        },
        {
            text: '民族',
            field: 'BZ0404',
            dbfield: true,
            width: 100,
            SetID: 'BZ04',
            CodeID: 'GB3304',
            ItemType: 'C',
            IsEdit: true,
        },
        {
            text: '出生年月',
            field: 'BZ0405',
            dbfield: true,
            width: 100,
            SetID: 'BZ04',
            ItemType: 'D',
            IsTimeItem: true,
            IsEdit: true,
        },
        {
            text: '参加工作时间',
            field: 'BZ0406',
            dbfield: true,
            width: 100,
            SetID: 'BZ04',
            ItemType: 'D',
            IsTimeItem: true,
            IsEdit: true,
        },
        {
            text: '政治面貌',
            field: 'BZ0407',
            dbfield: true,
            width: 100,
            SetID: 'BZ04',
            CodeID: 'GB4762',
            ItemType: 'C',
            IsEdit: true,
        },
        {
            text: '入党时间',
            field: 'BZ0408',
            dbfield: true,
            width: 100,
            SetID: 'BZ04',
            IsEdit: true,
            ItemType: 'D',
            isOrder: true,
            IsTimeItem: true,
        },
        {
            text: '全日制学历',
            field: 'BZ0409',
            dbfield: true,
            width: 150,
            SetID: 'BZ04',
            CodeID: 'GB4658',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
        },
        {
            text: '最高学历',
            field: 'BZ0410',
            dbfield: true,
            width: 150,
            SetID: 'BZ04',
            CodeID: 'GB4658',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
        },
        {
            text: '最高学位',
            field: 'BZ0411',
            dbfield: true,
            width: 150,
            SetID: 'BZ04',
            IsEdit: true,
            ItemType: 'C',
            CodeID: 'GB/T6864',
        },
        {
            text: '职务类别',
            field: 'BZ0412',
            dbfield: true,
            width: 100,
            SetID: 'BZ04',
            CodeID: 'BB034',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
        },
        {
            text: '任现职务时间',
            field: 'BZ0413',
            dbfield: true,
            width: 100,
            SetID: 'BZ04',
            ItemType: 'D',
            IsEdit: true,
            IsTimeItem: true,
            isOrder: true,
        },
        {
            text: '任现职务职级层次时间',
            field: 'BZ0414',
            dbfield: true,
            width: 100,
            SetID: 'BZ04',
            ItemType: 'D',
            IsTimeItem: true,
            IsEdit: true,
            isOrder: true,
        },
        {
            text: '是否具有3年以上乡镇（街道）企事业单位领导工作经历',
            field: 'BZ0415',
            dbfield: true,
            width: 200,
            SetID: 'BZ04',
            CodeID: 'ZJ',
            ItemType: 'C',
            IsEdit: true,
        },
    ],
};