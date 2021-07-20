/**
 * 反馈信息状态 枚举
 */
export enum FeedBackOperationEnum {
    /**
     * 未处理
     */
    NOOPERATION = 0,
    /**
     * 已处理
     */
    ISOPERATION = 1,
}

export const FeedBackOperationEnumList = [{
    text: '未处理',
    value: 0
}, {
    text: '已处理',
    value: 1
}];
