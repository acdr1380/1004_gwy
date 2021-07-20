export default {
    value: 'DATA_3001_PERSON_A82',
    text: '领导职务调整',
    childTabItemID: 'BBZWZJ',
    childTabCodeID: 'BB003',
    LedgerDateOrderItemID: '',
    tblCols: [
        {
            text: '序号',
            field: 'ROWNUM_',
            dbfield: true,
            width: 100,
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
            width: 200,
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
            text: '人员类别',
            field: 'A0160',
            dbfield: true,
            width: 200,
            SetID: 'A01',
            ItemType: 'C',
            isFilter: true,
            CodeID: 'STATUS',
        },
        {
            text: '职务层次',
            field: 'BBZWZJ',
            dbfield: true,
            width: 200,
            SetID: 'A01',
            ItemType: 'C',
            isFilter: true,
            CodeID: 'BB003',
        },
        {
            text: '调整前职务职级',
            field: 'A8201',
            dbfield: true,
            width: 200,
            SetID: 'A82',
            ItemType: 'C',
            isFilter: true,
            IsEdit: true,
            CodeID: 'BB021',
        },
    ],
};