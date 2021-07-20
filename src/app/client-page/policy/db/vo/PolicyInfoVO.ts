import { PolicyInfo } from '../entity/PolicyInfo';
import { AttachmentInfo } from '../entity/AttachmentInfo';
import { SendOrgInfo } from '../entity/SendOrgInfo';

/**
 * 政策查询实体拓展
 *
 * @export
 * @interface PolicyInfoVO
 * @extends {PolicyInfo}
 */
export interface PolicyInfoVO extends PolicyInfo {
    attachmentInfos: Array<AttachmentInfo>;
    sendOrgInfos: SendOrgInfo[];
}
