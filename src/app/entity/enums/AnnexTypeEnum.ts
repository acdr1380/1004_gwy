/**
 * 附件类型
 *
 * @export
 * @enum {number}
 */
export enum AnnexTypeEnum {
    /**
     *业务附件
     */
    WORKFLOW = 0,
    /**
     *其他附件
     */
    ORTHER = 1,
}

/**
 * 附件类型枚举对应的对象
 */
export const AnnexTypeEnum_CN = [
    {
        text: '业务附件',
        value: 0,
    },
    {
        text: '其他附件',
        value: 1,
    },
];
