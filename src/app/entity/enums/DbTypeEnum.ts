export enum DbTypeEnum {
    /**
     * 系统库
     */
    SYSTEM = 0,
    /**
     * 人员库
     */
    PERSON = 1,
    /**
     * 单位库
     */
    UNIT = 2,
    /**
     * 业务数据
     */
    WORKFLOW_DATA = 3,
    /**
     * 数据参数数据
     */
    WORKFLOW_PARAM = 4
}

export const DbTypeEnum_CN = [
    // { name: '系统库', value: 0 },
    { name: '人员库', value: 1 },
    { name: '单位库', value: 2 }
    // { name: '业务数据', value: 3 },
    // { name: '数据参数数据', value: 4 }
];
