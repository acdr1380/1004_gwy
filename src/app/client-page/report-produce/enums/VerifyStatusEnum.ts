/**
 *  年报-校验状态
 */
export enum VerifyStatusEnum {
    /**
     * 未校验
     */
    STATUS_NOT_VERIFIED = 0,
    /**
     * 校验通过
     */
    STATUS_APPROVED = 1,
    /**
     * 校验不通过
     */
    STATUS_NOT_APPROVED = 2,
}

/**
 * 年报-校验状态-对应中文
 */
export const VerifyStatusEnum_EN = [
    { text: '未校验', value: 0 },
    { text: '校验通过', value: 1 },
    { text: '校验不通过', value: 2 },
];
