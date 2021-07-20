import { SendNoticeStatusEnum } from '../enums/SendNoticeStatusEnum';
import { SendNoticeTypeEnum } from '../enums/SendNoticeTypeEnum';

/**
 * 发送信息主体
 *
 * @export
 * @interface SendNoticeInfo
 */
export interface SendNoticeInfo {
    id;
    /**
     * 发送通知id 主键
     */
    noticeId: string;
    /**
     * 序号
     */
    sortId: number;
    /**
     * 标题
     */
    title: string;
    /**
     * 发起时间
     */
    sendTime: Date;
    /**
     * 意见提交时间
     */
    endTime: Date;
    /**
     * 通知内容
     */
    content: string;
    /**
     * 状态(是否正常发布)
     */
    status: SendNoticeStatusEnum;
    /**
     * 通知类型
     */
    type: SendNoticeTypeEnum;
    /**
     * 阅读次数
     */
    readHits: number;
    /**
     * 评论次数
     */
    opinionHits: number;
    /**
     * 发送用户ID
     */
    userId: string;
    /**
     * 发送用户名称
     */
    userName: string;
    /**
     * 发送单位ID
     */
    orgId: string;
    /**
     * 发送单位名称
     */
    orgName: string;
}
