import { BaseEntity } from './BaseEntity';
import { PolicyInvalidEnum } from '../enum/PolicyInvalidEnum';

/**
 * 笔记信息主体
 *
 * @export
 * @interface NoteInfo
 * @extends {BaseEntity}
 */
export interface NoteInfo extends BaseEntity {
    id: string;
    /**
     * 笔记id 主键
     */
    noteId: string;
    /**
     * 标题
     */
    title: string;
    /**
     * 政策id
     */
    policyId: string;
    /**
     * 文号
     */
    documentNumber: string;
    /**
     * 笔记内容
     */
    content: string;
    /**
     * 笔记备注
     */
    contentNote: string;
    /**
     * 笔记时间
     */
    noteTime: Date;
    /**
     * 添加用户ID
     */
    userId: string;
    /**
     * 序号
     */
    sortId: number;
    /**
     * 政策是否作废
     */
    invalidEnum: PolicyInvalidEnum;
}
