/**
 * 业务参数基类
 *
 * @export
 * @interface BaseWfParam
 * @extends {BaseEntity}
 */
export interface BaseWfParam {
    /**
     * 主键 业务ID
     */
    jobId: string;
    /**
     * 步骤ID
     */
    jobStepId: string;
    /**
     * 参数版本ID
     */
    jobParamId: string;
    /**
     * 排序
     */
    sortId?: number;
}
