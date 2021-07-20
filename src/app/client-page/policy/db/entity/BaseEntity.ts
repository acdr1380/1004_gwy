/**
 * 所有实体基类
 *
 * @export
 * @interface BaseEntity
 */
export interface BaseEntity {
    /**
     * 删除标记 0-正常，1-删除
     */
    delFlag?: boolean;
        /**
     * 锁定标记 0-未锁定 1-锁定
     */
    lockFlag?: boolean;
    /**
     * 锁定说明
     */
    lockDesc?: string;
    /**
     * 添加时间
     */
    createTime?: Date;
    /**
     * 更新时间
     */
    updateTime?: Date;

    [key: string]: any;
}
