/**
 * 业务办理状态
 *
 * @export
 * @enum {number}
 */
export enum JobStepStateEnum {
    /**
     * 等待办理
     */
    PENDING = 0,
    /**
     * 草稿
     */
    PROCESSING = 1,
    /**
     * 已申报
     */
    DECLARED = 2,
    /**
     * 审批通过
     */
    AUDIT_PASS = 3,
    /**
     * 审批未通过，已退回
     */
    AUDIT_NO_PASS = 4,
    /**
     * 已作废
     */
    STOP = 5,
    /**
     * 已办结
     */
    FINISHED = 6,
}
/**
 * 业务办理状态中文
 *
 * @export
 * @enum {number}
 */
// export const JobStepStateEnum_CN = {
//     /**
//      * 等待办理
//      */
//     0: '等待办理',
//     /**
//      * 草稿
//      */
//     1: '草稿',
//     /**
//      * 已申报
//      */
//     2: '已申报',
//     /**
//      * 审批通过
//      */
//     3: '审批通过',
//     /**
//      * 审批未通过，已退回"
//      */
//     4: '审批未通过，已退回',
//     /**
//      * 已作废
//      */
//     5: '已作废',
//     /**
//      * 已办结
//      */
//     6: '已办结',
// };
export const JobStepStateEnum_CN = [
    { text: '等待办理', value: 0 },
    { text: '草稿', value: 1 },
    { text: '已申报', value: 2 },
    { text: '审批通过', value: 3 },
    { text: '审批未通过，已退回', value: 4 },
    { text: '已作废', value: 5 },
    { text: '已办结', value: 6 },
];
