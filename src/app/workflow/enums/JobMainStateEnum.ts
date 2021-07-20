/**
 * 业务状态枚举
 *
 * @export
 * @enum {number}
 */
export enum JobMainStateEnum {
    /**
     * 正在办理
     */
    PROCESSING = 0,
    /**
     * 已完成
     */
    FINISHED = 1,
    /**
     * 已终止
     */
    STOP = 2,
}

/**
 * 业务状态
 */
export const JobMainStateEnum_CN = [
    { text: '待办理', value: 0 },
    { text: '已完成', value: 1 },
    { text: '已终止', value: 2 },
];
