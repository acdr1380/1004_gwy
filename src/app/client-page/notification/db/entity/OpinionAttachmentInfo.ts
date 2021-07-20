/**
 * 意见附件信息主体
 *
 * @export
 * @interface OpinionAttachmentInfo
 */
export interface OpinionAttachmentInfo {
    id: string;
    /**
     * 意见附件id 主键
     */
    opinionId: string;
    /**
     * 排序
     */
    sortId: number;
    /**
     * 文件名
     */
    fileName: string;
    /**
     * 路径
     */
    url: string;
    /**
     * 文件类型
     */
    type: string;
    /**
     * 文件大小
     */
    size: number;
}
