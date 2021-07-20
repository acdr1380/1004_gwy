/**
 * 发送通知信息状态 枚举
 *
 * @export
 * @enum {number}
 */
export enum SendNoticeTypeEnum {
    /**
     *普通
     */
    COMMON,
    /**
     *意见
     */
    OPINION
}

export const SendNoticeTypeEnum_CN = [{
    text: '普通通知',
    value: 0
}, {
    text: '征求意见',
    value: 1
}];
