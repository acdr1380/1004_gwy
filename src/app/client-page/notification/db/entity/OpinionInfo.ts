/**
 * 意见信息主体
 *
 * @export
 * @interface OpinionInfo
 */
export interface OpinionInfo {
    id;
    /**
     * 意见id 主键
     */
    opinionId: string;
    /**
     * 序号
     */
    sortId: number;
    /**
     * 意见内容
     */
    content: string;
    /**
     * 发送通知id 主键
     */
    noticeId: string;
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
}
