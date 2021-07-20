import { BaseEntity } from './BaseEntity';

/**
 * 发送对象单位信息主体
 *
 * @export
 * @interface SendUnitInfo
 * @extends {BaseEntity}
 */
export interface SendOrgInfo extends BaseEntity {
    /**
     * 单位id 主键
     */
    orgId: string;
    /**
     * 序号
     */
    sortId: number;
    /**
     * 单位名称
     */
    orgName: string;
    /**
     * 发送政策id 主键
     */
    policyId: string;
}
