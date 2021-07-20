/**
 * 数据状态类型
 */
export enum SysStatusEnum {
    /**
     * 正常
     */
    NORMAL,
    /**
     * 锁定
     */
    LOCK,
    /**
     * 删除
     */
    DELETE
}

// tslint:disable-next-line:variable-name
export const SysStatusEnum_CN = [
    { text: '正常', value: 0 },
    { text: '锁定', value: 1 },
    { text: '删除', value: 2, disabled: true },
];
