import { BaseEntity } from './BaseEntity';
import { FeedBackEnum } from '../enum/FeedBackEnum';
import { FeedBackOperationEnum } from '../enum/FeedBackOperationEnum';

/**
 * 反馈信息主体
 */
export interface BackInfo extends BaseEntity {
    id: string;
    /**
     * 反馈id 主键
     */
    backId: string;
    /**
     * 反馈类型
     */
    type: FeedBackEnum;
    /**
     * 是否处理
     */
    operation: FeedBackOperationEnum;
    /**
     * 选择内容
     */
    chooseContent: string;
    /**
     * 反馈内容
     */
    backContent: string;
    /**
     * 反馈时间
     */
    backTime: Date;
    /**
     * 添加用户ID
     */
    userId: string;
    /**
     * 添加政策ID
     */
    policyId: string;
    /**
     * 序号
     */
    sortId: number;
}
