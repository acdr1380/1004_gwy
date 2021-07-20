import { ReportCommonParams } from 'app/irregular-page/report-common/enums/ReportCommonParams';

/**
 * 反查参数
 */
export interface ReportReverseQueryPrarms extends ReportCommonParams {
    /**
     * 子表编码
     */
    childId: string;
    childName: string;
    keyId: string;
    title: string;

    /**
     * 反查坐标
     */
    data: {
        /**
         * 坐标: x
         */
        row: number;
        /**
         * 坐标: y
         */
        col: number;
        [key: string]: any;
    };
}
