import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WfParamDataAuditTypeEnum } from 'app/workflow/enums/WfParamDataAuditTypeEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { SalaryCivliInnerTransferService } from '../salary-civli-inner-transfer.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ExcelControlComponent } from 'app/components/excel-control/excel-control.component';
import { Base64 } from 'js-base64';
import { CommonService } from 'app/util/common.service';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { CivilInnerTransferDrawerComponent } from '../civil-inner-transfer-drawer/civil-inner-transfer-drawer.component';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'gz-inner-transfer-list-form',
    templateUrl: './inner-transfer-list-form.component.html',
    styleUrls: ['./inner-transfer-list-form.component.scss'],
})
export class InnerTransferListFormComponent implements OnInit, AfterViewInit {
    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private service: SalaryCivliInnerTransferService,
        private commonService: CommonService,
        private wfTableCode: WfTableHelper
    ) {}

    @ViewChild('personListFormElement', { static: false })
    personListFormElement: ElementRef;

    /**
     * 业务是否可编辑
     */
    canEdit = false;

    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this.canEdit = v.jobStepState === JobStepStateEnum.PROCESSING;
            this._jobStepInfo = v;
            this.personListIfy._loadPersonList(true);
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    /**
     * 保存审批
     */
    @Output() auditStstusChange = new EventEmitter<any>();

    /**
     * 是否全屏
     */
    isFullScreen = false;

    /**
     * 表册相关
     */
    formListIfy = {
        selectedIndex: 0,
        status: false,
        list: [
            {
                name: '机关事业单位工作人员工资变动审批表',
                tag: 'b1',
                permission: 'wage_change_table001',
            },
            {
                name: '机关单位工作人员工资变动核定(统计)表',
                tag: 'b2',
                permission: 'salaryadjustmentaudit001_xin',
            },
            {
                name: '机关单位工作人员工资变动花名册',
                tag: 'b3',
                permission: 'wagechange001_xin',
            },
        ],
        evtChange: ({ index }) => {
            const item = this.formListIfy.list[index];
            switch (item.tag) {
                case 'b1':
                    this.formListIfy.status = true;
                    break;
                case 'b2':
                case 'b3':
                    this.formListIfy.status = false;
                    break;
            }
            this.showPersonInfoIfy.list.forEach(list => {
                if (!this.formListIfy.status) {
                    list.status = list.tag === 'down' ? true : false;
                } else {
                    list.status = true;
                }
            });
            this.formListIfy.permission = item.permission;
            this.formListIfy._setParams();
            this.cdr.detectChanges();
        },
        permission: 'transfer_ietter',
        params: {},
        _setParams: () => {
            const { jobId, jobStepId, agentOrgId } = this.jobStepInfo;
            this.formListIfy.params = {
                jobId,
                jobStepId,
                [`${this.wfTableCode.getTableCode('A01')}_ID`]:
                    this.personListIfy.viewSelectedPsnData?.keyId,
            };
        },
    };

    @ViewChild('scrollViewPersonList', { static: false })
    scrollViewPersonList: CdkVirtualScrollViewport;
    /**
     * 人员列表相关
     */
    personListIfy = {
        find: {
            // 搜索框
            searchWidth: 200,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                const index = this.personListIfy.list.findIndex(item => item.keyId === value);
                if (index > -1) {
                    this.scrollViewPersonList.scrollToIndex(index);
                    this.personListIfy.find.locationSelectPsn(index);
                    this.personListIfy.viewSelectedPsnData = this.personListIfy.list[index];
                    // 设置选中
                    this.personListIfy.viewSelectedPsnData = this.personListIfy.list[index];
                    const { pageIndex, pageSize } = this.personListIfy.paginateIfy;
                    // 搜索人员所在页数
                    const num = Math.trunc((index + 1) / pageSize);
                    const restNum = (index + 1) % pageSize;
                    this.personListIfy.paginateIfy.pageIndex =
                        restNum === 0 ? num : num >= 1 ? num + 1 : 1;
                    this.personListIfy.paginateIfy.pageChange(
                        false,
                        this.personListIfy.viewSelectedPsnData
                    );
                }
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personListIfy.find.list = this.personListIfy.list.filter(
                        item => item.text.indexOf(searchKey) > -1
                    );
                }
            },
            evtOpenChange: status => {
                if (status) {
                    this.personListIfy.find.searchKey = null;
                }
            },
            /**
             * 定位选中人员，滚动至固定位置
             */
            locationSelectPsn: index => {
                setTimeout(() => {
                    const [psn] = this.personListIfy.list[index];
                    const el = <HTMLElement>psn.component.dragElement.nativeElement;
                    this.scrollViewPersonList.scrollToOffset(el.offsetTop);
                }, 300);
            },
        },
        // 人员列表
        list: [],
        /**
         * 加载人员列表
         */
        _loadPersonList: (isRef = false) => {
            if (this.personListIfy.list.length > 0 && !isRef) {
                return;
            }
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
            };
            this.workflowService.getWfPersonList(this.service.wfId, data).subscribe(result => {
                this.personListIfy.list = result.map(item => {
                    return {
                        ...item,
                        text: item.A0101,
                        keyId: item[`${this.wfTableCode.getTableCode('A01')}_ID`],
                    };
                });
                this.personListIfy.paginateIfy.pageChange(true);
            });
        },

        /**
         * 预览界面当前选中人员
         */
        viewSelectedPsnData: null,
        /**
         * 选中人员
         */
        evtSelectedPerson: data => {
            this.personListIfy.viewSelectedPsnData = data;
            this.formListIfy.evtChange({ index: this.formListIfy.selectedIndex });
            this.cdr.detectChanges();
        },
        /**
         * 审批
         */
        evtAuditPerson: item => {
            this.auditPersonIfy.title = '人员审批';
            this.auditPersonIfy.isBatch = false;
            this.auditPersonIfy.open();
            this.auditPersonIfy.form.reset(item);
        },
        evtBatchAudit: () => {
            this.auditPersonIfy.title = '人员批量审批';
            this.auditPersonIfy.isBatch = true;
            this.auditPersonIfy.open();
            this.auditPersonIfy.form.reset();
        },
        /**
         * 查看批复
         */
        evtViewAudit: (item, index) => {
            this.personAuditViewIfy.personId = item.keyId;
            this.personAuditViewIfy.open();
        },

        /**
         * 分页
         */
        paginateIfy: {
            /**
             * 单页人员列表数据
             */
            pagePsnList: [],
            pageIndex: 1,
            pageSize: 10,
            /**
             * 人员列表分页
             */
            pageChange: (reset = false, psn = null) => {
                if (reset) {
                    this.personListIfy.paginateIfy.pageIndex = 1;
                }
                const { pageSize, pageIndex } = this.personListIfy.paginateIfy;
                this.personListIfy.paginateIfy.pagePsnList =
                    this.personListIfy.list.length > 0
                        ? this.personListIfy.list.slice(
                              pageSize * (pageIndex - 1),
                              pageIndex * pageSize
                          )
                        : [];
                psn
                    ? this.personListIfy.evtSelectedPerson(psn)
                    : this.personListIfy.evtSelectedPerson(
                          this.personListIfy.paginateIfy.pagePsnList[0]
                      );
            },
        },
    };

    /**
     * 人员审批
     */
    auditPersonIfy = {
        visible: false,
        title: '人员审批',
        width: 400,
        close: () => (this.auditPersonIfy.visible = false),
        open: () => {
            this.auditPersonIfy._initAuditState();
            this.auditPersonIfy.visible = true;
        },

        isBatch: false,
        form: new FormGroup({
            auditState: new FormControl(null, Validators.required),
            auditStateDesc: new FormControl(null, Validators.required),
        }),
        _initAuditState: () => {
            if (!this.auditPersonIfy.isBatch) {
                const personInfo = this.personListIfy.viewSelectedPsnData;
                this.auditPersonIfy.form.reset(personInfo);
            } else {
                this.auditPersonIfy.form.reset();
            }
            this.auditPersonIfy.form
                .get('auditState')
                .valueChanges.pipe(
                    filter(value => value > -1),
                    distinctUntilChanged(),
                    debounceTime(100)
                )
                .subscribe(value => {
                    const verifyFields = ['auditStateDesc'];
                    verifyFields.forEach(field => {
                        const control: AbstractControl = this.auditPersonIfy.form.get(field);
                        if (value === 0) {
                            control.setValidators(Validators.required);
                        } else {
                            control.setValue(null);
                            control.clearValidators();
                        }
                    });
                });
        },

        evtSaveAudit: () => {
            if (this.workflowService.formVerify(this.auditPersonIfy.form)) {
                const data = this.auditPersonIfy.form.getRawValue();

                if (this.auditPersonIfy.isBatch) {
                    const datas = this.personListIfy.list.map(item => {
                        return {
                            ...data,
                            keyValue: item.keyId,
                            auditType: WfParamDataAuditTypeEnum.DATA,

                            jobId: this.jobStepInfo.jobId,
                            jobStepId: this.jobStepInfo.jobStepId,
                            jobParamId: this.jobStepInfo.jobParamId,
                        };
                    });
                    this.workflowService.batchSaveAudit(datas).subscribe(() => {
                        // 设置审批结果
                        this.personListIfy.list.forEach(item => {
                            item.auditState = data.auditState;
                            item.auditStateDesc = data.auditStateDesc;
                        });
                        this.auditStstusChange.emit();
                        this.auditPersonIfy.close();
                    });
                    return;
                }
                const personInfo = this.personListIfy.viewSelectedPsnData;
                data.keyValue = personInfo.keyId;
                data.auditType = WfParamDataAuditTypeEnum.DATA;
                if (personInfo.auditId) {
                    data.auditId = personInfo.auditId;
                }

                this.workflowService
                    .saveAudit({
                        ...data,
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        jobParamId: this.jobStepInfo.jobParamId,
                    })
                    .subscribe(result => {
                        if (result.id) {
                            // 设置审批结果
                            personInfo.auditState = data.auditState;
                            personInfo.auditStateDesc = data.auditStateDesc;
                            personInfo.auditId = result.id;
                            this.auditStstusChange.emit();
                            this.auditPersonIfy.close();
                        }
                    });
            }
        },
    };

    /**
     * 人员批复结果
     */
    personAuditViewIfy = {
        visible: false,
        title: '批复信息',
        width: 400,
        close: () => (this.personAuditViewIfy.visible = false),
        open: () => {
            this.personAuditViewIfy._loadAuditList();
            this.personAuditViewIfy.visible = true;
        },
        list: [],
        personId: null,
        personList: [],
        _loadAuditList: () => {
            if (this.personAuditViewIfy.list.length === 0) {
                this.workflowService.getAuditHistory(this.jobStepInfo.jobId).subscribe(result => {
                    this.personAuditViewIfy.list = result;
                    this.personAuditViewIfy._buildPersonAuditList();
                });
            } else {
                this.personAuditViewIfy._buildPersonAuditList();
            }
        },
        _buildPersonAuditList: () => {
            this.personAuditViewIfy.personList = this.personAuditViewIfy.list
                .filter(item => item.keyValue === this.personAuditViewIfy.personId)
                .sort((a, b) => {
                    if (new Date(a.auditDate) > new Date(b.auditDate)) {
                        return -1;
                    }
                    return 1;
                });
        },
    };

    /**
     * 信息展示
     */
    showPersonInfoIfy = {
        list: [
            { label: '附件资料', icon: 'folder', tag: 'file', status: true },
            { label: '人员信息', icon: 'user', tag: 'all', status: true },
            { label: '下载', icon: 'download', tag: 'down', status: true },
        ],
        showContent: item => {
            switch (item.tag) {
                case 'file':
                    this.personAnnexIfy.open();
                    break;
                case 'all':
                    this.personSalaryInfoIfy.open();
                    break;
                case 'down':
                    this.personSalaryExcelElement.down();
                    break;
            }
        },
    };

    @ViewChild('personSalaryExcelElement', { static: false })
    personSalaryExcelElement: ExcelControlComponent;
    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     * 人员附件
     */
    personAnnexIfy = {
        visible: false,
        title: '人员附件',
        width: 400,
        close: () => (this.personAnnexIfy.visible = false),
        open: () => {
            this.personAnnexIfy._loadFileList();
            this.personAnnexIfy.visible = true;
        },

        _loadFileList: () => {
            const { keyId } = this.personListIfy.viewSelectedPsnData;
            const data = {
                keyId,
                jobId: this.jobStepInfo.jobId,
            };
            this.workflowService.getPersonFileList(data).subscribe(result => {
                this.personAnnexIfy.fileList = result.map(file => {
                    const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                        file.fileType
                    );
                    return {
                        ...file,
                        thumbUrl,
                        operFiles: file,
                        fileName: file.fileName,
                        url: `${this.commonService.getDownFileURL(file.fileId, file.fileName)}`,
                        name: file.fileName,
                    };
                });
            });
        },

        selectedIndex: 0,
        fileList: [],
        preview: file => {
            const index = this.personAnnexIfy.fileList.findIndex(v => v.id === file.id);
            this.onlineDocOverlayElement.selectedIndex = index;
            this.onlineDocOverlayElement.show();
        },
    };

    /**
     * 人员工资信息
     */
    personSalaryInfoIfy = {
        params: null,
        open: () => {
            const row = this.personListIfy.viewSelectedPsnData;
            const GL = Base64.encode(
                JSON.stringify({
                    name: escape(row.A0101),
                    keyId: row[`${this.wfTableCode.getTableCode('A01')}_ID`],
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    wfId: this.jobStepInfo.wfId,
                })
            );
            const url = `irregular/oper-salary-info-page;GL=${GL}`;

            window.winOperSalaryInfoDlg = window.open(url, 'report-common');
            if (window.winOperSalaryInfoDlg && window.winOperSalaryInfoDlg.closed) {
                window.winOperSalaryInfoDlg.focus();
            }
            // this.router.navigate(['irregularity/oper-salary-info-page', { GL }]);
        },
    };

    // 流程图与流程监控抽屉
    @ViewChild('wfInfoDrawerElement', { static: false })
    _wfInfoDrawerElement: CivilInnerTransferDrawerComponent;

    wfInfoDrawer = {
        changeStatus: null,
        sign: null,
        // 用参数来区分打开流程图抽屉与打开流程监控抽屉
        show: param => {
            this.wfInfoDrawer.sign = param;
            this.wfInfoDrawer.changeStatus = +new Date();
            // this._wfInfoDrawerElement.show();
        },
    };

    ngOnInit() {}

    ngAfterViewInit() {
        this.formListIfy.evtChange({ index: 0 });
    }

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }
}
