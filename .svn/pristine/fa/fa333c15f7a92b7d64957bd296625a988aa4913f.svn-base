import { CommonService } from 'app/util/common.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { filter, map, tap } from 'rxjs/operators';
import { VerifyStatusEnum } from 'app/client-page/report-produce/enums/VerifyStatusEnum';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class ReportCommonService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    /**
     * 获得子表
     * @param classId 系统编码
     * @param setTableId 套表编码
     */
    getSublist({ classId, setId }) {
        const url = 'api/gl-report-core/v1/data/base/report/child/table/selectTreeList';
        return this.http.get<R>(`${url}/${classId}/${setId}`).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得子表信息
     * @param id 编码
     */
    getSublistData({ classId, setId, childId }) {
        const url = 'api/gl-report-core/v1/data/base/report/child/table/selectDetail';
        return this.http.get<R>(`${url}/${classId}/${setId}/${childId}`).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 重新生成年报
     * @param keyId 编码
     */
    buildReportSetTableData(keyId) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/buildReportSetTable';
        return this.http.get<R>(`${url}/${keyId}`).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('年报生成成功。');
                } else {
                    this.message.error(json.msg);
                }
            })
        );
    }

    /**
     * 年报校验
     * @param keyId 编码
     */
    verifyReportData(keyId) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/verifyReportData';
        return this.http.get<R>(`${url}/${keyId}`).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    if (json.data.verifyStatus === VerifyStatusEnum.STATUS_APPROVED) {
                        this.message.success('校验成功。');
                    }
                }
            }),
            map(json => json.data)
        );
    }

    /**
     * 获得校验结果
     * @param keyId 报表编码
     */
    getReportCheckData(keyId: string) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/loadReportCheckData';
        return this.http.get<R>(`${url}/${keyId}`).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取数据
     * @param keyId 报表编码
     * @param childId 子表编码
     */
    loadChildTableData(keyId: string, childId: string) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/loadReportChildTableData';
        return this.http.get<R>(`${url}/${keyId}/${childId}`).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 加载报表校验结果
     */
    loadReportCheckChildId(keyId: string) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/loadReportCheckChildId';
        return this.http.get<R>(`${url}/${keyId}`).pipe(
            filter(json => json.code === 0),
            map(json => json.data.map(v => v.CHILD_ID))
        );
    }

    /**
     * 保存格子数据
     * @param data 参数
     */
    saveCellData(data) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/saveCellData';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 保存年报审批结果
     */
    saveReportAuditData(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/auditReport';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('保存成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 保存报表数据
     */
    saveFullCellData(data) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/saveFullCellData';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('保存成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得表册样式
     */
    getExcelCellStyle(fileId) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/getExcelCellStyle';
        return this.http.post<R>(url, { fileId }).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 查看单位的报表数据
     */
    reportMainPassApproved(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/reportMainPassApproved';
        return this.http.post<R>(url, data).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 下载单表
     */
    downloadExcel(data) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/downloadExcel';
        return this.commonService.downFilePost(url, data);
    }

    /**
     * 下载套表
     * @param data 参数
     */
    downloadFullExcel(data) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/downloadFullZip';
        return this.commonService.downFilePost(url, data);
    }
}
