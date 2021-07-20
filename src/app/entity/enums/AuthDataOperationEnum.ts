/**
 * 人员库、指标权限类型
 */
export enum AuthDataOperationEnum {
    /**
     * 查看
     */
    VIEW,
    /**
     * 修改
     */
    MODIFY,
    /**
     * 增加
     */
    ADD,
}

/**
 * 人员库、指标权限类型 中文对应
 */
// tslint:disable-next-line:variable-name
export const AuthDataOperationEnum_CN = [
    { text: '查看', value: 0, tag: 'VIEW' },
    { text: '修改', value: 1, tag: 'MODIFY' },
    { text: '增加', value: 2, tag: 'ADD' },
];
