/**
 *发送单位数量主体
 *
 * @export
 * @interface SendOrgResult
 */
export interface SendOrgResult {

    id: string;
    /**
     * 序号
     */
    sortId: number;
    /**
     * 发送通知id 主键
     */
    noticeId: string;
    /**
     * 主键 机构ID
     */
    orgId: string;
    /**
     * 机构名称
     */
    orgName: string;

    /**
     * 单位数量
     */
    count: number;
    /**
     * 是否包含下层
     */
    includeChild: boolean;
}
