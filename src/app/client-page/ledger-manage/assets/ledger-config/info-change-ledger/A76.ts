export default {
    value: 'DATA_3001_PERSON_A76',
    text: '考核',
    ledgerChildField: 'A7606',
    childTabItemID: 'A7606',
    childTabCodeID: 'BB009',
    LedgerDateOrderItemID: 'A7601',
    tblCols: [
        {
            text: '序号',
            field: 'ROWNUM_',
            dbfield: true,
            width: 50,
            isFixed: true,
            SetID: 'A01',
            ItemType: 'N',
        },
        {
            text: '单位',
            field: 'A0195',
            dbfield: true,
            width: 220,
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
            text: '身份证号',
            field: 'A0184',
            dbfield: true,
            width: 150,
            isFixed: true,
            SetID: 'A01',
            ItemType: 'S',
        },
        {
            text: '考核年度',
            field: 'A7605',
            dbfield: true,
            width: 100,
            SetID: 'A76',
            isFixed: true,
            ItemType: 'N',
            isOrder: true,
        },
        {
            text: '考核结果',
            field: 'A7606',
            dbfield: true,
            width: 200,
            SetID: 'A76',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
            CodeID: 'BB009',
        },
        {
            text: '考核时人员类别',
            field: 'A7601',
            dbfield: true,
            width: 120,
            SetID: 'A76',
            IsEdit: true,
            ItemType: 'C',
            isFilter: true,
            CodeID: 'STATUS',
        },
        {
            text: '考核时职务层次',
            field: 'A7602',
            dbfield: true,
            width: 120,
            SetID: 'A76',
            IsEdit: true,
            ItemType: 'C',
            isFilter: true,
            CodeID: 'BB003',
        },
        {
            text: '是否连续三年优秀',
            field: 'A7607',
            dbfield: true,
            width: 80,
            SetID: 'A76',
            ItemType: 'C',
            isFilter: true,
            IsEdit: true,
            CodeID: 'XZ04',
        },
        {
            text: '是否连续两年不称职',
            field: 'A7608',
            dbfield: true,
            width: 80,
            SetID: 'A76',
            ItemType: 'C',
            isFilter: true,
            IsEdit: true,
            CodeID: 'XZ04',
        },
        {
            text: '是否本单位考核',
            field: 'A7609',
            dbfield: true,
            width: 80,
            SetID: 'A76',
            ItemType: 'C',
            isFilter: true,
            IsEdit: true,
            CodeID: 'XZ04',
        },
    ],
};
