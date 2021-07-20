import { JobStepStateEnum } from './JobStepStateEnum';

/**
 * 业务路由参数
 */
export interface OperRouterParams {
    /**
     * 业务名称编码
     */
    wfId: string;
    /**
     * 业务编码
     */
    jobId: string;
    /**
     * 业务步骤编码
     */
    jobStepId: string;
    /**
     * 业务步骤
     */
    stepId: string;
    /**
     * 业务状态
     */
    jobStepState: JobStepStateEnum;
    parentStepId: string;
    lastStepId: string;

    /**
     * 代管单位
     */
    agentOrgId: string;
    /**
     * 代管单位名称
     */
    agentOrgName: string;
    /**
     * 重定向路径
     */
    redirect: string;

    /**是否是已完成业务 */
    isFinished: boolean;
    /**
     * 是否只读
     */
    isReadOnly: boolean;

    /**
     * 子步骤（用于刷新后定位）
     */
    substeps: number;
}
