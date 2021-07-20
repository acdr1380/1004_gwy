import { BaseEntity } from './BaseEntity';
import { PolicyInvalidEnum } from '../enum/PolicyInvalidEnum';

/**
 * 收藏信息主体
 *
 * @export
 * @interface FavoritesInfo
 * @extends {BaseEntity}
 */
export interface FavoritesInfo extends BaseEntity {
    id: string;
    /**
     * 收藏id 主键
     */
    favoritesId: string;
    /**
     * 政策id
     */
    policyId: string;
    /**
     * 文件名称
     */
    favoritesName: string;
    /**
     * 收藏时间
     */
    addTime: Date;
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
    /**
     * 政策是否作废
     */
    invalidEnum: PolicyInvalidEnum;
}
