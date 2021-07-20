/**
 * 表册录入方式
 */
export enum FormEditTypeEnum {
    /**
     * 只读
     */
    READONLY,
    /**
     * 普通录入
     */
    GENERAL,
    /**
     * 弹框录入
     */
    POPUP,
    /**
     * 特殊录入
     */
    SPECIAL,
    /**
     * 照片录入
     */
    PHOTO,
}

/**
 * 表册录入方式对应中文
 */
export const FormEditTypeEnum_CN = [
    { text: '只读', value: 0 },
    { text: '普通录入', value: 1 },
    { text: '弹框录入', value: 2 },
    { text: '特殊录入', value: 3 },
    { text: '照片录入', value: 4 },
];
