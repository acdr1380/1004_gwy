/**
 * 工作台状态枚举
 *
 * @export
 * @enum {number}
 */
export enum WfWorkbenchWfStateEnum {
    /**
     * 所有数据
     */
    ALL = 0,
    /**
     * 待办-包括待办和草稿
     */
    PENDING = 1,
    /**
     * 已提交
     */
    PROGRESS = 2,
    /**
     * 已完成-归档
     */
    DONE = 3,

    /**
     * 已作废
     */
    CANCEL = 4,
}

/**
 * 工作台状态枚举对应中文
 */
export const WfWorkbenchWfStateEnum_CN = [
    { text: '待处理', value: 1 },
    { text: '已提交', value: 2 },
    { text: '已完成', value: 3 },
    { text: '已作废', value: 4 },
];
