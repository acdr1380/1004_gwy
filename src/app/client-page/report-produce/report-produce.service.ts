import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ReportProduceService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonservice: CommonService
    ) {}

    /**
     * 获得套表
     * @param classId 系统编码
     */
    getOverlayList(year) {
        const url = 'api/gl-report-core/v1/data/base/report/set/table/selectTreeYearList';
        return this.http.get<R>(`${url}/${year}`).pipe(
            filter(json => json.code === 0),
            map(json => {
                return json.data.map(item => {
                    return {
                        ...item,
                        title: `${item.classId}-${item.setId}-${item.setTableName}`,
                        value: `${item.classId}_${item.setId}`,
                    };
                });
            })
        );
    }

    /**
     * 查询报表数据统计
     * @param data 参数
     */
    getReportMainCountData(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/reportMainCountData';
        return this.http.post<R>(url, data).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    //#region 等待审批

    /**
     * 等待审批列表
     * @param data 参数
     */
    getWaitingReportList(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/reportMainPending';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    //#endregion

    //#region 已审批

    /**
     * 获得已审批数据
     */
    getReportMainApproved(data, status: 'all' | 'pass' | 'nopass') {
        let url = 'api/gl-report-core/v1/data/base/report/main/reportMainApproved';
        switch (status) {
            case 'pass':
                url = 'api/gl-report-core/v1/data/base/report/main/reportMainPassApproved';
                break;
            case 'nopass':
                url = 'api/gl-report-core/v1/data/base/report/main/reportMainNoPassApproved';
                break;
        }
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    //#endregion

    //#region 我的数据相关

    /**
     * 获取代管的单位
     *
     * @param {string} userId
     */
    getAgentOrgList(userId: string) {
        const url = `api/gl-sys-user/v1/sys/agent/unit/selectAgentUnit/${userId}`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 选中单位创建报表数据 多份
     * @param data 参数
     */
    buildReportDataList(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/buildReportOrg';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('创建成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 选中单位创建报表数据 一份
     * @param data 参数
     */
    buildReportData(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/buildSummaryReportMain';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('创建成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 创建报表
     */
    buildReportMainAndMemory(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/buildReportMainAndMemory';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('创建成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得我的数据列表
     * @param data 参数
     */
    getReportMyDataList(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/reportMainMyData';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 删除报表数据
     * @param id 参数
     */
    deleteReportData(id) {
        const url = 'api/gl-report-core/v1/data/base/report/main/delete';
        return this.http.delete<R>(`${url}/${id}`).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('删除成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 更新报表正在审批
     */
    updateProcessingStatus(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/updateProcessingStatus';
        return this.http.put<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 更新报表相关信息
     */
    saveReportPrincipal(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/update';
        return this.http.put<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('设置成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 设置报表封面
     */
    saveReportCovenSetting(data) {
        const url = 'api/gl-report-core/v1/data/base/report/coven/setting/save';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('设置成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 报表封面查询
     */
    getReportCovenSetting(id) {
        const url = 'api/gl-report-core/v1/data/base/report/coven/setting/selectDetail';
        return this.http.get<R>(`${url}/${id}`).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 上报报表
     * @param id 参数
     */
    auditSubmitReport(id) {
        const url = 'api/gl-report-core/v1/data/base/report/main/submitReport';
        return this.http.get<R>(`${url}/${id}`).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('上报成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 报表校验
     */
    verifyReportData(id) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/verifyReportData';
        return this.http.get<R>(`${url}/${id}`).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 查询审批内容
     * @param id 编码
     */
    getAuditDataList(id) {
        const url = 'api/gl-report-core/v1/data/base/report/audit/selectList';
        return this.http.post<R>(url, { keyId: id }).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 撤下申报
     */
    cancelSubmitReport(keyId) {
        const url = 'api/gl-report-core/v1/data/base/report/main/cancelSubmitReport';
        return this.http
            .post<R>(url, {
                keyId,
            })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.warning(json.msg);
                    } else {
                        this.message.success('撤销成功。');
                    }
                })
                // filter(json => json.code === 0),
                // map(json => json.data)
            );
    }
    //#endregion

    //#region 汇总数据相关

    /**
     * 获得汇总数据
     */
    getCollectListData(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/reportMainSummaryData';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 查询可汇总报表列表
     */
    getReportMainWaitSummaryData(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/reportMainWaitSummaryData';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 汇总报表
     */
    summaryBuildReportTable(data) {
        const url = 'api/gl-report-core/v1/data/base/report/main/buildSummaryReportMainAndMemory';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('汇总成功。');
                }
            })
            // filter(json => json.code === 0),
            // map(json => json.data)
        );
    }

    /**
     * 查询被汇总单位
     */
    findBaseReportData(keyId) {
        const url = `api/gl-report-core/v1/data/base/report/summary/data/findBaseReportData/${keyId}`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    //#endregion

    //#region 报表相关

    /**
     * 生成年报
     */
    buildReportTable(id) {
        const url = 'api/gl-report-core/v1/data/base/report/memory/buildReportTable';
        return this.http.get<R>(`${url}/${id}`).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('生成成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    //#endregion

    //#region 年报附件

    /**
     * 上传年报附件
     */
    saveReportAnnex(data) {
        const url = 'api/gl-report-core/v1/data/base/report/annex/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('上传成功。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得年报附件
     */
    getReportAnnexList(keyId) {
        const url = `api/gl-report-core/v1/data/base/report/annex/selectList/${keyId}`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data || [])
        );
    }

    /**
     * 删除年报附件
     */
    deleteReportAnnex(id) {
        const url = `api/gl-report-core/v1/data/base/report/annex/delete/${id}`;
        return this.http.delete<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                } else {
                    this.message.success('删除成功。');
                }
            }),
            filter(json => json.code === 0)
        );
    }
    //#endregion

    //#region 完成情况
    /**
     * 年报单位完成情况
     */
    loadSpecialStatistics() {
        const url = `api/gl-report-core/v1/data/base/report/main/selectSpecialStatistics`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data || {})
        );
    }

    /**
     * 单位已完成年报情况
     */
    selectB0105Data(data) {
        const url = `api/gl-report-core/v1/data/base/report/main/selectB0105Data`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 单位年报未完成情况
     */
    selectB0105NoJoinData(data) {
        const url = `api/gl-report-core/v1/data/base/report/main/selectB0105NoJoinData`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 未办理excel下载
     */
    downloadNoJoinDataExcel(option) {
        this.commonservice.downFilePost(
            'api/gl-report-core/v1/data/base/report/main/downloadNoJoinDataExcel',
            option,
            '单位年报未办理情况.xlsx'
        );
    }

    /**
     * 正在办理，已完成excel下载
     */
    downloadB0105DataExcel(option, name) {
        this.commonservice.downFilePost(
            'api/gl-report-core/v1/data/base/report/main/downloadB0105DataExcel',
            option,
            name
        );
    }

    //#endregion
}
