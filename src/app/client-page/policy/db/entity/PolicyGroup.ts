import { BaseEntity } from './BaseEntity';

/**
 * 收藏分组主体
 *
 * @export
 * @interface PolicyGroup
 * @extends {BaseEntity}
 */
export interface PolicyGroup extends BaseEntity {
    id: string;
    /**
     * 分组id 主键
     */
    groupId: string;
    /**
     * 父id
     */
    parentId: string;
    /**
     * 名称
     */
    groupName: string;
    /**
     * 是否包含下层
     */
    haveChild: boolean;
}
