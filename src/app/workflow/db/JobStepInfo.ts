import { BaseJobParam } from './BaseJobParam';
import { WfParamMain } from './WfParamMain';
import { WfParamAttachment } from './WfParamAttachment';

/**
 * 业务步骤信息
 *
 * @export
 * @interface JobStepInfo
 */
export interface JobStepInfo extends BaseJobParam {
    /**
     * 业务编码
     */
    wfId: string;
    /**
     * 步骤
     */
    stepId: string;
    /**
     * 上一步步骤
     */
    parentStepId: string;
    /**
     * 参数版本ID
     */
    jobParamId: string;
    /**
     * 数据版本ID
     */
    jobDataId: string;
    /**
     * 业务状态
     */
    jobStepState: number;
    /**
     * 代管单位Id
     *
     * @type {string}
     * @memberof JobStepInfo
     */
    agentOrgId?: string;
    /**
     * 代管单位名称
     */
    agentOrgName?: string;
    /**
     * 发起单位
     */
    startOrgId: string;
    /**
     * 发起单位名称
     */
    startOrgName: string;
    /**
     * 参数主表
     */
    wfParamMain: WfParamMain;
    /**
     * 上一步步骤Id
     */
    parentJobStepId?: string;
    /**
     * 附件
     */
    attachments: Array<WfParamAttachment>;
    // [key: string]: any;
}
