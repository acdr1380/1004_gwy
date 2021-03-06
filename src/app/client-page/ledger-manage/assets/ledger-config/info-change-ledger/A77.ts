export default {
    value: 'DATA_3001_PERSON_A77',
    text: '培训',
    ledgerChildField: 'A7703',
    childTabItemID: 'A7701',
    childTabCodeID: 'BB010',
    LedgerDateOrderItemID: 'A7706',
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
            text: '人员类别',
            field: 'A0160',
            dbfield: true,
            width: 100,
            SetID: 'A01',
            ItemType: 'C',
            isFilter: true,
            CodeID: 'STATUS',
        },
        {
            text: '职务层次',
            field: 'BBZWZJ',
            dbfield: true,
            width: 100,
            SetID: 'A05',
            ItemType: 'C',
            isFilter: true,
            CodeID: 'BB003',
        },
        {
            text: '培训内容(类型)',
            field: 'A7701',
            dbfield: true,
            width: 100,
            SetID: 'A77',
            IsEdit: true,
            ItemType: 'C',
            isFilter: true,
            CodeID: 'BB010',
        },
        {
            text: '培训形式',
            field: 'A7702',
            dbfield: true,
            width: 100,
            SetID: 'A77',
            IsEdit: true,
            ItemType: 'C',
            isFilter: true,
            CodeID: 'BB012',
        },
        {
            text: '培训渠道',
            field: 'A7703',
            dbfield: true,
            width: 200,
            SetID: 'A77',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
            CodeID: 'BB011',
        },
        {
            text: '是否出国境培训',
            field: 'A7704',
            dbfield: true,
            width: 200,
            SetID: 'A77',
            ItemType: 'C',
            isFilter: true,
            IsEdit: true,
            CodeID: 'XZ04',
        },
        {
            text: '有关省区市参加对口支援培训',
            field: 'A7705',
            dbfield: true,
            width: 100,
            SetID: 'A77',
            ItemType: 'C',
            IsEdit: true,
            isFilter: true,
            CodeID: 'XZ04',
        },
        {
            text: '培训时长',
            field: 'A7706',
            dbfield: true,
            width: 100,
            SetID: 'A77',
            IsEdit: true,
            ItemType: 'N',
            isOrder: true,
        },
    ],
};
