import { NoticeAttachmentInfo } from '../entity/NoticeAttachmentInfo';
import { SendNoticeInfo } from '../entity/SendNoticeInfo';
import { SendOrgInfo } from '../entity/SendOrgInfo';
import { SendOrgResult } from '../entity/SendOrgResult';

export interface SendNoticeInfoVO extends SendNoticeInfo {
    noticeAttachmentInfos: NoticeAttachmentInfo[];
    sendOrgInfos: SendOrgInfo[];
    sendOrgResults: SendOrgResult[];
}
