import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { Base64 } from 'js-base64';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ProcessingStatusEnum, ProcessingStatusEnum_CN } from './enums/ProcessingStatusEnum';
import { VerifyStatusEnum, VerifyStatusEnum_EN } from './enums/VerifyStatusEnum';
import { ReportProduceService } from './report-produce.service';

@Component({
    selector: 'gl-report-produce',
    templateUrl: './report-produce.component.html',
    styleUrls: ['./report-produce.component.scss'],
})
export class ReportProduceComponent implements OnInit {
    year = 2020;
    userInfo = this.commonService.getUserLoginInfo();

    verifyStatusEnum = VerifyStatusEnum;
    verifyStatusList = VerifyStatusEnum_EN;
    processingStatusEnum = ProcessingStatusEnum;
    processingStatusList = ProcessingStatusEnum_CN;

    // 套表列表
    reportIfy = {
        // 套表
        overlay: {
            activeItem: null,
            value: null,
            list: [],
            evtChange: () => {
                this.reportIfy.overlay.activeItem = this.reportIfy.overlay.list.find(
                    v => v.value === this.reportIfy.overlay.value
                );

                this.reportStatusIfy._loadTabCount();
                this.reportStatusIfy.evtTabChange({ index: this.reportStatusIfy.selectIndex });
            },
            _init: () => {
                this.service.getOverlayList(this.year).subscribe(result => {
                    this.reportIfy.overlay.list = result;
                    const [first] = result;
                    this.reportIfy.overlay.activeItem = first;
                    this.reportIfy.overlay.value = first.value;

                    this.reportStatusIfy.evtTabChange({ index: 0 });
                    this.reportStatusIfy._loadTabCount();
                });
            },
        },
    };

    @ViewChild('auditWaitingElement') auditWaitingElement: ElementRef;
    @ViewChild('auditFinishedElement') auditFinishedElement: ElementRef;
    @ViewChild('mySelfElement') mySelfElement: ElementRef;
    @ViewChild('collectListElement') collectListElement: ElementRef;
    @ViewChild('funishingSituationEle') _funishingSituationEle: ElementRef;
    /**
     * 报表状态标签
     */
    reportStatusIfy = {
        list: [],
        selectIndex: 0,
        evtTabChange: ({ index }) => {
            this.reportStatusIfy.selectIndex = index;
            const value = this.reportStatusIfy.list[this.reportStatusIfy.selectIndex].value;
            switch (value) {
                case 0:
                    this.waitingAuditIfy.evtLoadPageData(true);
                    break;
                case 1:
                    this.auditFinishedIfy.evtLoadPageData(true);
                    break;
                case 2:
                    this.mySelfIfy.evtLoadPageData(true);
                    break;
                case 3:
                    this.collectListIfy.evtLoadPageData(true);
                    break;
                case 4:
                    this.finishingSituationIfy._loadMsgData();
                    this.finishingSituationIfy.tabSet.tabIndexChange({
                        index: this.finishingSituationIfy.tabSet.index,
                    });
                    break;
            }
        },
        _loadTabCount: () => {
            this.service
                .getReportMainCountData(this.reportIfy.overlay.activeItem)
                .subscribe(result => {
                    this.reportStatusIfy.list.forEach(item => {
                        item.count = result[item.tag];
                    });
                });
        },
        searchKey: null,
        keyDwon: event => {
            if (event.keyCode === 13) {
                const value = this.reportStatusIfy.list[this.reportStatusIfy.selectIndex].value;
                switch (value) {
                    case 0:
                        this.waitingAuditIfy.evtLoadPageData(true, this.reportStatusIfy.searchKey);
                        break;
                    case 1:
                        this.auditFinishedIfy.evtLoadPageData(true, this.reportStatusIfy.searchKey);
                        break;
                    case 2:
                        this.mySelfIfy.evtLoadPageData(true, this.reportStatusIfy.searchKey);
                        break;
                    case 3:
                        this.collectListIfy.evtLoadPageData(true, this.reportStatusIfy.searchKey);
                        break;
                }
            }
        },
        closeSearch: () => {
            this.reportStatusIfy.searchKey = null;
            this.reportStatusIfy.keyDwon({ event: { keyCode: 13 } });
        },
    };

    /**
     * 等待审批
     */
    waitingAuditIfy = {
        totalCount: 0,
        pageIndex: 1,
        pageSize: 10,
        data: [],
        loading: false,
        evtLoadPageData: (reset: boolean = false, searchKey?) => {
            if (reset) {
                this.waitingAuditIfy.pageIndex = 1;
            }
            const params: any = {
                classId: this.reportIfy.overlay.activeItem.classId,
                setId: this.reportIfy.overlay.activeItem.setId,
                data: {
                    pageSize: this.waitingAuditIfy.pageSize,
                    pageIndex: this.waitingAuditIfy.pageIndex,
                },
            };
            if (searchKey) {
                params.data.reportName = searchKey;
            }
            this.waitingAuditIfy.loading = true;
            this.service.getWaitingReportList(params).subscribe(result => {
                this.waitingAuditIfy.loading = false;
                result.data = result.data ? result.data : [];
                if (!result.totalCount) {
                    result.totalCount = this.waitingAuditIfy.totalCount;
                }
                this.waitingAuditIfy = Object.assign(this.waitingAuditIfy, result);
            });
        },
    };

    /**
     * 已审批
     */
    auditFinishedIfy = {
        totalCount: 0,
        pageIndex: 1,
        pageSize: 10,
        data: [],
        loading: false,
        status: 'all',
        evtLoadPageData: (reset: boolean = false, searchKey?) => {
            if (reset) {
                this.auditFinishedIfy.pageIndex = 1;
            }
            const params: any = {
                classId: this.reportIfy.overlay.activeItem.classId,
                setId: this.reportIfy.overlay.activeItem.setId,
                data: {
                    pageIndex: this.auditFinishedIfy.pageIndex,
                    pageSize: this.auditFinishedIfy.pageSize,
                },
            };
            if (searchKey) {
                params.data.reportName = searchKey;
            }
            this.auditFinishedIfy.loading = true;
            this.service
                .getReportMainApproved(params, <any>this.auditFinishedIfy.status)
                .subscribe(result => {
                    this.auditFinishedIfy.loading = false;
                    result.data = result.data ? result.data : [];
                    if (!result.totalCount) {
                        result.totalCount = this.auditFinishedIfy.totalCount;
                    }
                    this.auditFinishedIfy = Object.assign(this.auditFinishedIfy, result);
                });
        },
    };

    /**
     *  我的数据
     */
    mySelfIfy = {
        totalCount: 0,
        pageIndex: 1,
        pageSize: 10,
        data: [],
        loading: false,
        evtBuildReport: () => {
            this.agentUnitIfy.open();
        },

        evtLoadPageData: (reset: boolean = false, searchKey?) => {
            if (reset) {
                this.mySelfIfy.pageIndex = 1;
            }
            const params: any = {
                classId: this.reportIfy.overlay.activeItem.classId,
                setId: this.reportIfy.overlay.activeItem.setId,
                data: {
                    pageIndex: this.mySelfIfy.pageIndex,
                    pageSize: this.mySelfIfy.pageSize,
                },
            };
            if (searchKey) {
                params.data.reportName = searchKey;
            }
            this.mySelfIfy.loading = true;
            this.service.getReportMyDataList(params).subscribe(result => {
                this.mySelfIfy.loading = false;
                if (result.totalCount > 0) {
                    this.mySelfIfy.totalCount = result.totalCount;
                }
                this.mySelfIfy.data = result.data || [];
            });
        },
        /**
         * 获取报表校验状态
         */
        getVerifyText: row => {
            return this.verifyStatusList.find(v => v.value === row.verifyStatus).text;
        },
        getAuditText: row => {
            return this.processingStatusList.find(v => v.value === row.processingStatus).text;
        },
        evtLoadReportCommon: row => {
            const { classId, setId } = this.reportIfy.overlay.activeItem;
            const status = this.reportStatusIfy.list[this.reportStatusIfy.selectIndex].value;
            const GL = Base64.encode(
                JSON.stringify({
                    keyId: row.keyId,
                    title: escape(row.reportName),
                    classId,
                    setId,
                    processingStatus: row.processingStatus,
                    status,
                })
            );
            const url = `irregularity/report-common;GL=${GL}`;

            window.winReportDlg = window.open(url, 'report-common');
            if (window.winReportDlg && window.winReportDlg.closed) {
                window.winReportDlg.focus();
            } else {
                // setInterval(() => {
                //     if (window.winReportDlg.reportCommon_refTbl) {
                //         return;
                //     }
                //     window.winReportDlg.reportCommon_refTbl = () => {
                //         this.reportStatusIfy._loadTabCount();
                //         this.reportStatusIfy.evtTabChange({
                //             index: this.reportStatusIfy.selectIndex,
                //         });
                //     };
                // }, 1000);
            }
            // this.router.navigate(['irregularity/report-common', { GL }]);

            if (row.processingStatus === ProcessingStatusEnum.STATUS_REPORTED && status === 0) {
                const params = {
                    keyId: row.keyId,
                    processingStatus: 6,
                };
                this.service.updateProcessingStatus(params).subscribe();
            }
        },
        /**
         * 生成等待
         */
        buildReportTableing: false,
        evtbuildReportTable: row => {
            if (row.processingStatus !== ProcessingStatusEnum.STATUS_UNPROCESSED) {
                this.mySelfIfy.buildReportTableing = true;
                this.modalService.confirm({
                    nzTitle: `系统提示`,
                    nzContent: `<b style="color: red;">已生成数据年报 是否确定重新生成，重新生成后之前修改数据将进行重新统计 。</b>`,
                    nzOkText: '确定',
                    nzOkType: 'danger',
                    nzOnOk: () => {
                        this.service.buildReportTable(row.keyId).subscribe(result => {
                            this.mySelfIfy.buildReportTableing = false;
                            row.processingStatus = ProcessingStatusEnum.STATUS_GENERATED;
                            row.verifyStatus = result.verifyStatus;
                        });
                    },
                    nzCancelText: '取消',
                    nzOnCancel: () => {
                        this.mySelfIfy.buildReportTableing = false;
                    },
                });
                return;
            }
            this.service.buildReportTable(row.keyId).subscribe(result => {
                this.mySelfIfy.buildReportTableing = false;
                row.processingStatus = ProcessingStatusEnum.STATUS_GENERATED;
                row.verifyStatus = result.verifyStatus;
            });
        },
        evtLoadAnnexList: row => {
            this.reportFilesIfy.keyId = row.keyId;
            this.reportFilesIfy.open();
        },
        evtLoadAuditData: row => {
            this.reportAuditIfy.open();
            this.service.getAuditDataList(row.keyId).subscribe(result => {
                this.reportAuditIfy.list = result;
            });
        },
        evtCovenSetting: row => {
            this.reportCovenSettingIfy.keyId = row.keyId;
            this.reportCovenSettingIfy.open();
        },
        evtUploadFile: row => {
            this.reportFilesIfy.keyId = row.keyId;
            this.reportFilesIfy.isEdit = true;
            this.reportFilesIfy.open();
        },
        evtPrincipal: row => {
            this.service.getReportCovenSetting(row.keyId).subscribe(result => {
                this.reportPrincipalIfy.form.reset(result || {});
            });
            this.reportPrincipalIfy.open();
        },
        verifyReporting: false,
        evtVerifyReportData: row => {
            this.mySelfIfy.verifyReporting = true;
            this.service.verifyReportData(row.keyId).subscribe(result => {
                row.verifyStatus = result.verifyStatus;
                this.mySelfIfy.verifyReporting = false;
            });
        },
        /**
         * 报表上报
         */
        evtAuditSubmit: row => {
            this.modalService.confirm({
                nzTitle: `系统提示`,
                nzContent: `<b style="color: red;">确定要上报: ${row.reportName} 吗？上报后无法修改数据。</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.service.auditSubmitReport(row.keyId).subscribe(result => {
                        this.reportStatusIfy.evtTabChange({
                            index: this.reportStatusIfy.selectIndex,
                        });
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        /**
         * 报表删除
         */
        evtDeleteReport: row => {
            this.modalService.confirm({
                nzTitle: `系统提示`,
                nzContent: `<b style="color: red;">确定要删除: ${row.reportName} 吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.mySelfIfy.loading = true;
                    this.service.deleteReportData(row.keyId).subscribe(result => {
                        this.reportStatusIfy.evtTabChange({
                            index: this.reportStatusIfy.selectIndex,
                        });

                        this.reportStatusIfy._loadTabCount();
                        this.mySelfIfy.loading = false;
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        evtRevocation: row => {
            this.modalService.confirm({
                nzTitle: `系统提示`,
                nzContent: `<b style="color: red;">确定要撤回吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    this.mySelfIfy.loading = true;
                    this.service.cancelSubmitReport(row.keyId).subscribe(json => {
                        this.mySelfIfy.loading = false;
                        if (json.code === 0) {
                            this.reportStatusIfy.evtTabChange({
                                index: this.reportStatusIfy.selectIndex,
                            });

                            this.reportStatusIfy._loadTabCount();
                        }
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
    };

    /**
     * 代管单位列表
     */
    agentUnitIfy = {
        // 抽屉内容
        title: '代管单位列表',
        width: 400,
        visible: false,
        close: () => (this.agentUnitIfy.visible = false),
        open: (reset = true) => {
            this.agentUnitIfy._loadAgentUnitList();
            this.agentUnitIfy.visible = true;
        },
        list: <any[]>[],
        _loadAgentUnitList: () => {
            this.service.getAgentOrgList(this.userInfo.userId).subscribe(result => {
                this.agentUnitIfy.list = result;
            });
        },

        evtSelectUnit: index => {
            this.agentUnitIfy.list[index].selected = !this.agentUnitIfy.list[index].selected;
        },

        evtGetBtnDisabled: () => {
            return this.agentUnitIfy.list.filter(item => item.selected).length === 0;
        },

        londing: false,
        evtSaveBuildReportUnit: () => {
            const data = {
                classId: this.reportIfy.overlay.activeItem.classId,
                setId: this.reportIfy.overlay.activeItem.setId,
                data: {
                    orgId: this.userInfo.orgId,
                    orgIds: this.agentUnitIfy.list
                        .filter(item => item.selected)
                        .map(({ orgId, orgName }) => {
                            return {
                                orgId,
                                unitId: orgId,
                                includeChild: false,
                                orgName,
                            };
                        }),
                    generationMethod: 0,
                },
            };
            this.agentUnitIfy.londing = true;
            this.service.buildReportMainAndMemory(data).subscribe(result => {
                this.agentUnitIfy.londing = false;
                this.reportStatusIfy.evtTabChange({ index: this.reportStatusIfy.selectIndex });
                this.reportStatusIfy._loadTabCount();
                this.agentUnitIfy.close();
            });
        },
    };

    reportBuildSettingIfy = {
        // 抽屉内容
        title: '报表生成信息',
        width: 400,
        visible: false,
        close: () => (this.reportBuildSettingIfy.visible = false),
        open: (reset = true) => {
            this.reportBuildSettingIfy.visible = true;
        },
        form: new FormGroup({
            reportName: new FormControl(null, Validators.required),
        }),
        /**
         * 创建上报单位
         */
        evtBuildReportUnit: () => {
            if (this.commonService.formVerify(this.reportBuildSettingIfy.form)) {
                const data = {
                    classId: this.reportIfy.overlay.activeItem.classId,
                    setId: this.reportIfy.overlay.activeItem.setId,
                    data: {
                        orgId: this.userInfo.orgId,
                        reportName: this.reportBuildSettingIfy.form.getRawValue().reportName,
                        keyIds: this.agentUnitIfy.list
                            .filter(item => item.selected)
                            .map(item => item.orgId),
                    },
                };
                this.service.buildReportData(data).subscribe(result => {
                    this.reportBuildSettingIfy.close();
                });
            }
        },
    };

    /**
     * 汇总数据
     */
    collectListIfy = {
        evtReportCollet: () => {
            this.collectDataListIfy.open();
        },

        totalCount: 0,
        pageIndex: 1,
        pageSize: 10,
        data: [],
        loading: false,
        evtLoadPageData: (reset: boolean = false, searchKey?) => {
            if (reset) {
                this.collectListIfy.pageIndex = 1;
            }
            const params: any = {
                classId: this.reportIfy.overlay.activeItem.classId,
                setId: this.reportIfy.overlay.activeItem.setId,
                data: {
                    pageIndex: this.collectListIfy.pageIndex,
                    pageSize: this.collectListIfy.pageSize,
                },
            };
            if (searchKey) {
                params.data.reportName = searchKey;
            }
            this.collectListIfy.loading = true;
            this.service.getCollectListData(params).subscribe(result => {
                this.collectListIfy.loading = false;
                result.data = result.data ? result.data : [];
                if (!result.totalCount) {
                    result.totalCount = this.collectListIfy.totalCount;
                }
                this.collectListIfy = Object.assign(this.collectListIfy, result);
            });
        },
        loadUnitTable: row => {
            this.collectListIfy.unitTbl.keyId = row.keyId;
            this.collectListIfy.unitTbl.open();
        },

        unitTbl: {
            // 抽屉内容
            title: '汇总报表',
            width: 400,
            visible: false,
            close: () => (this.collectListIfy.unitTbl.visible = false),
            open: (reset = true) => {
                this.collectListIfy.unitTbl._load();
                this.collectListIfy.unitTbl.visible = true;
            },
            keyId: null,
            data: [],
            _load: () => {
                this.service
                    .findBaseReportData(this.collectListIfy.unitTbl.keyId)
                    .subscribe(result => (this.collectListIfy.unitTbl.data = result));
            },
        },
    };

    /**
     * 可汇总数据列表
     */
    collectDataListIfy = {
        // 抽屉内容
        title: '汇总报表',
        width: 400,
        visible: false,
        close: () => (this.collectDataListIfy.visible = false),
        open: (reset = true) => {
            this.collectDataListIfy._loadSummaryList();
            this.collectDataListIfy.visible = true;
        },

        allChecked: false,
        updateAllChecked: () => {
            this.collectDataListIfy.list.forEach(item => {
                item.selected = this.collectDataListIfy.allChecked;
            });
        },

        list: <any[]>[],
        _loadSummaryList: () => {
            const data = {
                classId: this.reportIfy.overlay.activeItem.classId,
                setId: this.reportIfy.overlay.activeItem.setId,
            };
            this.service.getReportMainWaitSummaryData(data).subscribe(result => {
                this.collectDataListIfy.list = result;
            });
        },

        evtSelectUnit: index => {
            this.collectDataListIfy.list[index].selected =
                !this.collectDataListIfy.list[index].selected;
        },
        evtGetBtnDisabled: () => {
            return this.collectDataListIfy.list.filter(item => item.selected).length === 0;
        },

        evtSettingName: () => {
            this.collectSettingIfy.open();
        },
    };

    /**
     * 汇总数据名称
     */
    collectSettingIfy = {
        // 抽屉内容
        title: '报表汇总名称',
        width: 400,
        visible: false,
        close: () => (this.collectSettingIfy.visible = false),
        open: (reset = true) => {
            this.collectSettingIfy.visible = true;
        },
        form: new FormGroup({
            reportName: new FormControl(null, Validators.required),
        }),
        loading: false,
        evtCollectReportData: () => {
            const { reportName } = this.collectSettingIfy.form.getRawValue();
            const keyIds = this.collectDataListIfy.list.filter(v => v.selected).map(v => v.keyId);
            const data = {
                classId: this.reportIfy.overlay.activeItem.classId,
                setId: this.reportIfy.overlay.activeItem.setId,
                data: {
                    orgId: this.userInfo.orgId,
                    reportName: reportName,
                    keyIds,
                },
            };
            this.collectSettingIfy.loading = true;
            this.service.summaryBuildReportTable(data).subscribe(json => {
                this.collectSettingIfy.loading = false;
                if (json.code !== 0) {
                    return;
                }
                this.reportStatusIfy.evtTabChange({ index: this.reportStatusIfy.selectIndex });
                this.reportStatusIfy._loadTabCount();
                this.collectDataListIfy.close();
                this.collectSettingIfy.close();
            });
        },
    };

    /**
     * 联系人
     */
    reportPrincipalIfy = {
        // 抽屉内容
        title: '联系人',
        width: 400,
        visible: false,
        close: () => (this.reportPrincipalIfy.visible = false),
        open: (reset = true) => {
            this.reportPrincipalIfy.form.disable();
            this.reportPrincipalIfy.visible = true;
        },
        form: new FormGroup({
            reportUnitName: new FormControl(null, Validators.required),
            reportPrincipal: new FormControl(null, Validators.required),
            reportAuthor: new FormControl(null, Validators.required),
            reportTel: new FormControl(null, [
                Validators.required,
                // Validators.pattern(this.commonService.reg.contactNumberReg),
            ]),
        }),

        keyId: null,
        evtSave: () => {
            if (this.commonService.formVerify(this.reportPrincipalIfy.form)) {
                const data = this.reportPrincipalIfy.form.getRawValue();
                const params = {
                    keyId: this.reportPrincipalIfy.keyId,
                    classId: this.reportIfy.overlay.activeItem.classId,
                    setId: this.reportIfy.overlay.activeItem.setId,
                    ...data,
                };
                this.service.saveReportPrincipal(params).subscribe(result => {
                    const value = this.reportStatusIfy.list[this.reportStatusIfy.selectIndex].value;
                    let row = null;
                    switch (value) {
                        case 2:
                            row = this.mySelfIfy.data.find(
                                v => v.keyId === this.reportPrincipalIfy.keyId
                            );
                            break;
                        case 3:
                            row = this.collectListIfy.data.find(
                                v => v.keyId === this.reportPrincipalIfy.keyId
                            );
                            break;
                    }
                    if (row) {
                        row.contactName = params.contactName;
                        row.contactPhone = params.contactPhone;
                    }
                    this.reportPrincipalIfy.close();
                });
            }
        },
    };

    /**
     * 报表封面设置
     */
    reportCovenSettingIfy = {
        // 抽屉内容
        title: '报表封面',
        width: 400,
        visible: false,
        close: () => (this.reportCovenSettingIfy.visible = false),
        open: (reset = true) => {
            this.reportCovenSettingIfy._load();
            this.reportCovenSettingIfy.visible = true;
        },
        form: new FormGroup({
            reportUnitName: new FormControl(null, Validators.required),
            reportPrincipal: new FormControl(null, Validators.required),
            reportAuthor: new FormControl(null, Validators.required),
            reportTel: new FormControl(null, [
                Validators.required,
                // Validators.pattern(this.commonService.reg.contactNumberReg),
            ]),
        }),

        keyId: null,
        _load: () => {
            this.service
                .getReportCovenSetting(this.reportCovenSettingIfy.keyId)
                .subscribe(result => {
                    this.reportCovenSettingIfy.form.reset(result || {});
                });
        },
        evtSave: () => {
            if (this.commonService.formVerify(this.reportCovenSettingIfy.form)) {
                const data = this.reportCovenSettingIfy.form.getRawValue();
                const params = {
                    keyId: this.reportCovenSettingIfy.keyId,
                    ...data,
                };
                this.service.saveReportCovenSetting(params).subscribe(result => {
                    this.reportCovenSettingIfy.close();
                });
            }
        },
    };

    /**
     * 审批内容查看
     */
    reportAuditIfy = {
        // 抽屉内容
        title: '报表审批结果',
        width: 400,
        visible: false,
        close: () => (this.reportAuditIfy.visible = false),
        open: (reset = true) => {
            this.reportAuditIfy.visible = true;
        },
        list: [],
    };

    reportFilesIfy = {
        // 抽屉内容
        title: '上传附件',
        width: 500,
        visible: false,
        close: () => {
            this.reportFilesIfy.isEdit = false;
            this.reportFilesIfy.visible = false;
        },
        open: (reset = true) => {
            this.reportFilesIfy.load();
            this.reportFilesIfy.visible = true;
        },
        isEdit: false,
        data: [],
        load: () => {
            this.service.getReportAnnexList(this.reportFilesIfy.keyId).subscribe(result => {
                this.reportFilesIfy.data = result;
            });
        },
        // evtDown: row => {},
        evtDelete: row => {
            this.service.deleteReportAnnex(row.id).subscribe(result => {
                this.reportFilesIfy.load();
            });
        },
        /**
         * 文件上传
         */
        fileCustomRequest: item => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);
            const uploadItem = Object.assign(item.file, {
                filename: item.file.name,
                originFileObj: item.file,
            });
            this.reportFilesIfy.fileList = this.reportFilesIfy.fileList.concat(uploadItem);
            this.commonService.fileUpload(formData).subscribe(data => {
                if (data) {
                    const params = {
                        keyId: this.reportFilesIfy.keyId,
                        fileId: data.fileId,
                        fileName: data.fileName,
                        fileType: data.fileType,
                        fileSize: data.fileSize,
                    };
                    this.reportFilesIfy.saveFile(params);
                }
            });
        },

        fileList: [],
        keyId: null,
        saveFile: data => {
            this.service.saveReportAnnex(data).subscribe(result => {
                this.reportFilesIfy.load();
            });
        },
    };

    // 监听事件 浏览器获得焦点
    // @HostListener('window:focus', ['$event']) onKeyDown(e) {
    //     this.reportStatusIfy._loadTabCount();
    //     this.reportStatusIfy.evtTabChange({ index: this.reportStatusIfy.selectIndex });
    // }

    windowFocus$: Subscription;

    /**
     * 完成情况
     */
    finishingSituationIfy = {
        currentTitle: null,
        msgTitles: [
            '主管部门',
            '部门所属事业单位',
            '政府直属',
            '党群直属',
            '乡镇街道',
            '乡镇街道政府下属事业单位',
        ],
        msgTotalData: {
            单位总计: '',
            主管部门: '',
            部门所属事业单位: '',
            政府直属: '',
            党群直属: '',
            乡镇街道: '',
            乡镇街道政府下属事业单位: '',
        },
        _loadMsgData: () => {
            this.service.loadSpecialStatistics().subscribe(result => {
                this.finishingSituationIfy.msgTotalData = result;
                Object.keys(result).forEach(item => {
                    this.finishingSituationIfy.tabSet.titles.forEach(ele => {
                        if (ele.text === item) {
                            ele.count = result[item];
                        }
                    });
                });
                this.finishingSituationIfy.tabSet.titles[0].count = result['未完成'];
            });
        },
        loadB0105: value => {
            this.finishingSituationIfy.currentTitle = value;
            this.B0105Unit.open();
        },
        tabSet: {
            index: 0,
            titles: [
                { text: '未办理', count: 0 },
                { text: '正在办理', count: 0 },
                { text: '已完成', count: 0 },
            ],
            tabIndexChange: ({ index }) => {
                this.finishingSituationIfy.B0105select.currentValue = null;
                this.finishingSituationIfy.finishTable.pageIndex = 1;
                switch (index) {
                    case 0:
                        this.finishingSituationIfy.unfinishTable.evtLoadPageData();
                        break;
                    case 1:
                        this.finishingSituationIfy.finishTable.evtLoadPageData();
                        break;
                    case 2:
                        this.finishingSituationIfy.finishTable.evtLoadPageData();
                        break;
                }
            },
            downLoad: () => {
                const option = {
                    data: {},
                };
                if (
                    this.finishingSituationIfy.B0105select.currentValue &&
                    this.finishingSituationIfy.B0105select.currentValue.length > 0
                ) {
                    this.finishingSituationIfy.B0105select.currentValue.forEach(ele => {
                        option.data[ele] = 1;
                    });
                }
                switch (this.finishingSituationIfy.tabSet.index) {
                    case 0:
                        this.service.downloadNoJoinDataExcel(option);
                        break;
                    case 1:
                        option.data['finished'] = false;
                        this.service.downloadB0105DataExcel(option, '单位年报正在办理情况.xlsx');
                        break;
                    case 2:
                        option.data['finished'] = true;
                        this.service.downloadB0105DataExcel(option, '单位年报已完成情况.xlsx');
                        break;
                }
            },
        },
        /**
         * 正在办理和已完成
         */
        finishTable: {
            loading: false,
            totalCount: 0,
            pageSize: 10,
            pageIndex: 1,
            data: [],
            evtLoadPageData: (reset: boolean = false) => {
                this.finishingSituationIfy.finishTable.loading = true;
                if (reset) {
                    this.finishingSituationIfy.finishTable.pageIndex = 1;
                }
                const pd = {
                    pageSize: this.finishingSituationIfy.finishTable.pageSize,
                    pageIndex: this.finishingSituationIfy.finishTable.pageIndex,
                    data: {
                        finished: this.finishingSituationIfy.tabSet.index === 1 ? false : true,
                    }, // true已完成   false正在办理
                };
                if (
                    this.finishingSituationIfy.B0105select.currentValue &&
                    this.finishingSituationIfy.B0105select.currentValue.length > 0
                ) {
                    this.finishingSituationIfy.B0105select.currentValue.forEach(ele => {
                        pd.data[ele] = 1;
                    });
                }
                this.service.selectB0105Data(pd).subscribe(result => {
                    this.finishingSituationIfy.finishTable.loading = false;
                    if (result.totalCount !== 0) {
                        this.finishingSituationIfy.finishTable.totalCount = result.totalCount;
                    }
                    this.finishingSituationIfy.finishTable.data = result.data;
                    this.finishingSituationIfy.finishTable.pageSize = result.pageSize;
                    this.finishingSituationIfy.finishTable.pageIndex = result.pageIndex;
                });
            },

            view: row => {
                const reportId = row.REPORT_KEYID;
                this.mySelfIfy.evtLoadReportCommon({
                    keyId: reportId,
                    reportName: row.B0101,
                    processingStatus: 2,
                });
            },
        },
        /**
         * 未办理
         */
        unfinishTable: {
            loading: false,
            totalCount: 0,
            pageSize: 10,
            pageIndex: 1,
            data: [],
            evtLoadPageData: (reset: boolean = false) => {
                this.finishingSituationIfy.unfinishTable.loading = true;
                if (reset) {
                    this.finishingSituationIfy.unfinishTable.pageIndex = 1;
                }
                const pd = {
                    pageIndex: this.finishingSituationIfy.unfinishTable.pageIndex,
                    pageSize: this.finishingSituationIfy.unfinishTable.pageSize,
                    data: {},
                };
                if (
                    this.finishingSituationIfy.B0105select.currentValue &&
                    this.finishingSituationIfy.B0105select.currentValue.length > 0
                ) {
                    this.finishingSituationIfy.B0105select.currentValue.forEach(ele => {
                        pd.data[ele] = 1;
                    });
                }
                this.service.selectB0105NoJoinData(pd).subscribe(info => {
                    this.finishingSituationIfy.unfinishTable.loading = false;
                    if (info.totalCount !== 0) {
                        this.finishingSituationIfy.unfinishTable.totalCount = info.totalCount;
                    }
                    this.finishingSituationIfy.unfinishTable.data = info.data;
                    this.finishingSituationIfy.unfinishTable.pageSize = info.pageSize;
                    this.finishingSituationIfy.unfinishTable.pageIndex = info.pageIndex;
                });
            },
        },
        // 多选框
        B0105select: {
            currentValue: null,
            evtChange: value => {
                switch (this.finishingSituationIfy.tabSet.index) {
                    case 0:
                        this.finishingSituationIfy.unfinishTable.evtLoadPageData();
                        break;
                    case 1:
                        this.finishingSituationIfy.finishTable.evtLoadPageData();
                        break;
                    case 2:
                        this.finishingSituationIfy.finishTable.evtLoadPageData();
                        break;
                }
            },
            list: [
                { text: '主管部门机关', value: '主管部门' },
                { text: '部门所属事业单位', value: '部门所属事业单位' },
                { text: '政府直属事业单位', value: '政府直属' },
                { text: '党群直属事业单位', value: '党群直属' },
                { text: '乡镇(街道)政府部门', value: '乡镇街道' },
                { text: '乡镇街道政府下属事业单位', value: '乡镇街道政府下属事业单位' },
            ],
        },
    };

    B0105Unit = {
        visible: false,
        open: () => {
            this.B0105Unit.visible = true;
            this.B0105Unit.evtLoadPageData();
        },
        close: () => (this.B0105Unit.visible = false),
        loading: false,
        totalCount: 0,
        pageSize: 10,
        pageIndex: 1,
        data: [],
        evtLoadPageData: (reset: boolean = false) => {
            this.B0105Unit.loading = true;
            if (reset) {
                this.B0105Unit.pageIndex = 1;
            }
            const pd = {
                pageIndex: this.B0105Unit.pageIndex,
                pageSize: this.B0105Unit.pageSize,
                data: {
                    [this.finishingSituationIfy.currentTitle]: 1,
                    finished: true,
                },
            };
            this.service.selectB0105Data(pd).subscribe(result => {
                this.B0105Unit.loading = false;
                if (result.totalCount !== 0) {
                    this.B0105Unit.totalCount = result.totalCount;
                }
                this.B0105Unit.data = result.data;
                this.B0105Unit.pageSize = result.pageSize;
                this.B0105Unit.pageIndex = result.pageIndex;
            });
        },
        downLoad: () => {
            const option = {
                data: {
                    [this.finishingSituationIfy.currentTitle]: 1,
                    finished: true,
                },
            };
            this.commonService.downFilePost(
                'api/gl-report-core/v1/data/base/report/main/downloadB0105DataExcel',
                option,
                '单位情况表.xlsx'
            );
        },
    };

    constructor(
        private clientService: ClientService,
        private service: ReportProduceService,
        private commonService: CommonService,
        private modalService: NzModalService
    ) {}

    ngOnInit() {
        this.reportIfy.overlay._init();

        this.clientService.buildBreadCrumb([
            {
                icon: 'home',
                link: '/client/index',
            },
            {
                text: '报表管理',
            },
            {
                text: '报表数据',
            },
        ]);
    }

    ngAfterViewInit() {
        this.reportStatusIfy.list = [
            {
                text: '等待审批',
                value: 0,
                tag: 'pending',
                template: this.auditWaitingElement,
            },
            {
                text: '已审批',
                value: 1,
                tag: 'approved',
                template: this.auditFinishedElement,
            },
            {
                text: '我的数据',
                tag: 'mydata',
                value: 2,
                template: this.mySelfElement,
            },
            {
                text: '汇总数据',
                value: 3,
                tag: 'summary',
                template: this.collectListElement,
            },
            {
                text: '完成情况',
                value: 4,
                tag: 'funishing',
                template: this._funishingSituationEle,
            },
        ];

        // 监听事件 浏览器获得焦点 刷新表格
        // this.windowFocus$ = fromEvent(window, 'focus').pipe(debounceTime(500));
        this.windowFocus$ = fromEvent(window, 'focus')
            .pipe(debounceTime(500))
            .subscribe(result => {
                this.reportStatusIfy._loadTabCount();
                this.reportStatusIfy.evtTabChange({ index: this.reportStatusIfy.selectIndex });
            });
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
        this.windowFocus$.unsubscribe();
    }
    help() {
        const GL = Base64.encode(
            JSON.stringify({
                WfId: 'scssybb',
            })
        );
        const url = `help;GL=${GL}`;
        window.open(url);
    }
}
