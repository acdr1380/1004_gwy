import { BaseEntity } from './BaseEntity';

/**
 * 关键词信息主体
 *
 * @export
 * @interface KeywordInfo
 * @extends {BaseEntity}
 */
export interface KeywordInfo extends BaseEntity {
    id: string;
    /**
     * 关键词id 主键
     */
    keywordId: string;
    /**
     * 关键词内容
     */
    keyword: string;
    /**
     * 关键词出现次数
     */
    keywordCount: number;
    /**
     * 序号
     */
    sortId: number;
}
