import { BaseEntity } from './BaseEntity';
import { PolicySendObjectEnum } from '../enum/PolicySendObjectEnum';
import { PolicyStatusEnum } from '../enum/PolicyStatusEnum';

export interface PolicyInfo extends BaseEntity {
    id: string;
    /**
     * 政策id 主键
     */
    policyId: string;
    /**
     * 文号
     */
    documentNumber: string;
    /**
     * 标题
     */
    title: string;
    /**
     * 发起时间
     */
    addTime: Date;
    /**
     * 政策内容
     */
    content: string;
    /**
     * 政策内容（纯文本）
     */
    contentText: string;
    /**
     * 发送对象
     */
    sendObject: PolicySendObjectEnum;
    /**
     * 状态
     */
    status: PolicyStatusEnum;
    /**
     * 文本点击数
     */
    hits: string;
    /**
     * 是否有反馈意见
     */
    flag: boolean;
    /**
     * 添加用户ID
     */
    userId: string;
    /**
     * 添加用户名称
     */
    userName: string;
    /**
     * 添加单位ID
     */
    orgId: string;
    /**
     * 添加单位名称
     */
    orgName: string;
    /**
     * 序号
     */
    sortId: number;
    /**
     * 添加分组ID
     */
    groupId: string;
}
