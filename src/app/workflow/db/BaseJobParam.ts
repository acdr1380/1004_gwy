/**
 *业务参数基类
 *
 * @export
 * @interface BaseJobParam
 */
export interface BaseJobParam {
    /**
     * jobId
     */
    jobId: string;
    /**
     * 步骤Id
     */
    jobStepId: string;
    /**
     * 自定义约定内容
     */
    data?: any;
}
