export default {
    value: 'DATA_3001_PERSON_A72',
    text: '增加',
    childTabItemID: 'A7201', // 筛选条件代码项字段
    childTabCodeID: 'BB004', // 筛选条件代码项
    LedgerDateOrderItemID: 'A7208', // 筛选条件时间排序字段
    childTabs: [],
    tblCols: [
        {
            text: '序号',
            field: 'ROWNUM_',
            dbfield: true,
            width: 80,
            isFixed: true,
            SetID: 'A01',
            ItemType: 'N',
        },
        {
            text: '单位',
            field: 'A0195',
            dbfield: true,
            width: 300,
            isFixed: true,
            SetID: 'A01',
            ItemType: 'C',
        },
        {
            text: '姓名',
            field: 'A0101',
            dbfield: true,
            width: 100,
            isFixed: true,
            SetID: 'A01',
            ItemType: 'S',
        },
        {
            text: '出生年月',
            field: 'A0107',
            dbfield: true,
            width: 100,
            SetID: 'A01',
            ItemType: 'D',
            IsTimeItem: true,
        },
        {
            text: '身份证号',
            field: 'A0177',
            dbfield: true,
            width: 150,
            SetID: 'A01',
            ItemType: 'S',
        },
        {
            text: '性别',
            field: 'A0104',
            dbfield: true,
            width: 80,
            CodeID: 'GB/T2261.1',
            isFilter: true,
            SetID: 'A01',
            ItemType: 'C',
        },
        {
            text: '民族',
            field: 'A0117',
            dbfield: true,
            width: 80,
            SetID: 'A01',
            CodeID: 'GB3304',
            ItemType: 'C',
            isFilter: true,
        },
        {
            text: '增加方式',
            field: 'A7201',
            dbfield: true,
            width: 300,
            SetID: 'A72',
            IsEdit: true,
            ItemType: 'C',
            isFilter: true,
            CodeID: 'BB004',
        },
        {
            text: '增加来源',
            field: 'A7215',
            dbfield: true,
            width: 100,
            SetID: 'A72',
            IsEdit: true,
            ItemType: 'C',
            CodeID: 'BB017',
        },
        {
            text: '增加时间',
            field: 'A7208',
            dbfield: true,
            width: 100,
            SetID: 'A72',
            IsEdit: true,
            ItemType: 'D',
            IsTimeItem: true,
            isOrder: true,
        },
        {
            text: '增加时人员类别',
            field: 'A7202',
            dbfield: true,
            width: 150,
            SetID: 'A72',
            isFilter: true,
            IsEdit: true,
            ItemType: 'C',
            CodeID: 'STATUS',
        },
        {
            text: '增加时政治面貌',
            field: 'A7203',
            dbfield: true,
            width: 150,
            SetID: 'A72',
            IsEdit: true,
            isFilter: true,
            ItemType: 'C',
            CodeID: 'GB4762',
        },
        {
            text: '增加时全日制最高学历',
            field: 'A7204',
            dbfield: true,
            width: 300,
            SetID: 'A72',
            ItemType: 'C',
            isFilter: true,
            IsEdit: true,
            CodeID: 'GB4658',
            isOrder: true,
        },
        {
            text: '增加时最高学历',
            field: 'A7205',
            dbfield: true,
            width: 150,
            SetID: 'A72',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
            CodeID: 'GB4658',
            isOrder: true,
        },
        {
            text: '增加时最高学位',
            field: 'A7206',
            dbfield: true,
            width: 200,
            SetID: 'A72',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
            CodeID: 'GB/T6864',
            isOrder: true,
        },
        {
            text: '原工作单位及职务',
            field: 'A7207',
            dbfield: true,
            width: 200,
            SetID: 'A72',
            ItemType: 'S',
            IsEdit: true,
        },
        {
            text: '增加时年龄',
            field: 'A7209',
            dbfield: true,
            width: 100,
            SetID: 'A72',
            ItemType: 'N',
            IsEdit: true,
            isOrder: true,
        },
        {
            text: '增加时职务层次',
            field: 'A7210',
            dbfield: true,
            width: 100,
            SetID: 'A72',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
            CodeID: 'BB003',
        },
        {
            text: '录用人员是否具有2年以上基层工作经历',
            field: 'A7213',
            dbfield: true,
            width: 300,
            SetID: 'A72',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
            CodeID: 'XZ04',
        },
        {
            text: '录用人员是否留学回国人员',
            field: 'A7214',
            dbfield: true,
            width: 200,
            SetID: 'A72',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
            CodeID: 'XZ04',
        },
    ],
};