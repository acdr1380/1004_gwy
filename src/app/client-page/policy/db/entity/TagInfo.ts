import { BaseEntity } from './BaseEntity';
import { PolicyInvalidEnum } from '../enum/PolicyInvalidEnum';

/**
 * 标记信息主体
 *
 * @export
 * @interface TagInfo
 * @extends {BaseEntity}
 */
export interface TagInfo extends BaseEntity {
    id: string;
    /**
     * 标记id 主键
     */
    tagId: string;
    /**
     * 笔记id
     */
    noteId: string;
    /**
     * 标记内容
     */
    tag: string;
    /**
     * 标记备注
     */
    tagNote: string;
    /**
     * 序号
     */
    sortId: number;
    /**
     * 起点节点编码
     */
    anchorNodeId: string;
    /**
     * 起点偏移量
     */
    anchorOffset: number;
    /**
     * 起始节点索引
     */
    anchorIndex: number;
    /**
     * 终点节点编码
     */
    focusNodeId: string;
    /**
     * 终点偏移量
     */
    focusOffset: number;
    /**
     * 结束节点索引
     */
    focusIndex: number;
    /**
     * 政策是否作废
     */
    invalidEnum: PolicyInvalidEnum;
}
