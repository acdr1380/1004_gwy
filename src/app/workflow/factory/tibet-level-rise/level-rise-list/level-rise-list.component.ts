import {
    Component,
    OnInit,
    AfterViewInit,
    ViewChild,
    ChangeDetectorRef,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { WorkflowService } from 'app/workflow/workflow.service';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { filter, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { WfParamDataAuditTypeEnum } from 'app/workflow/enums/WfParamDataAuditTypeEnum';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { CommonService } from 'app/util/common.service';
import { Base64 } from 'js-base64';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { ElementRef } from '@angular/core';
import { ExcelControlComponent } from 'app/components/excel-control/excel-control.component';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { TibetLevelRiseService } from '../tibet-level-rise.service';

@Component({
    selector: 'level-rise-list',
    templateUrl: './level-rise-list.component.html',
    styleUrls: ['./level-rise-list.component.scss'],
})
export class LevelRiseListComponent implements OnInit, AfterViewInit {
    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private commonService: CommonService,
        private tableHelper: WfTableHelper,
        private service: TibetLevelRiseService
    ) {}

    isFullScreen = false;
    /**
     * 业务是否编辑
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

            this.loadJobScheme();
            // this.personListIfy._loadPersonList(true);
            this.formListIfy.evtChange({ index: 0 });
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @Output() auditChange = new EventEmitter<any>();

    /**
     * 业务流程图
     */
    operStepFlowIfy = {
        visible: false,
        title: '业务路线图',
        height: 220,
        close: () => (this.operStepFlowIfy.visible = false),
        open: () => {
            this.operStepFlowIfy._loadOperStepList();
            this.operStepFlowIfy.visible = true;
        },

        list: [],
        /**
         * 获得当前步骤
         */
        evtGetStepIndex: (): number => {
            if (this.jobStepInfo && this.operStepFlowIfy.list.length > 0) {
                const index = this.operStepFlowIfy.list.findIndex(
                    item => item.stepId === this.jobStepInfo.stepId
                );
                return index;
            }
            return 0;
        },
        _loadOperStepList: () => {
            if (this.operStepFlowIfy.list.length > 0) {
                return;
            }

            this.workflowService.getOperStepList(this.jobStepInfo.wfId).subscribe(result => {
                this.operStepFlowIfy.list = result;
            });
        },
    };

    /**
     * 流程监控
     */
    operTailIfy = {
        title: '业务跟踪',
        width: 480,
        visible: false,
        close: () => (this.operTailIfy.visible = false),
        open: () => {
            this.operTailIfy._loadOperTailList();
            this.operTailIfy.visible = true;
        },

        list: [],
        _loadOperTailList: () => {
            if (this.operTailIfy.list.length > 0) {
                return;
            }
            this.workflowService
                .selectListByWfTracking(this.jobStepInfo.jobId)
                .subscribe(result => {
                    this.operTailIfy.list = result;
                });
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
            searchWidth: 160,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                if (!value) {
                    return;
                }
                const { pageSize } = this.personListIfy.pagination;
                // 查找位置
                const location = this.personListIfy.listAll.findIndex(item => item.keyId === value);
                // 计算位置所在页
                // tslint:disable-next-line:no-bitwise
                this.personListIfy.pagination.pageIndex = ~~(location / pageSize) + 1;
                // 重载分页
                this.personListIfy.pagination.initPage();

                // 定位选中
                const index = this.personListIfy.list.findIndex(item => item.keyId === value);
                this.scrollViewPersonList.scrollToIndex(index);
                this.personListIfy.evtSelectedPerson(this.personListIfy.list[index]);
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personListIfy.find.list = this.personListIfy.listAll.filter(
                        item => item.text.indexOf(searchKey) > -1
                    );
                }
            },
        },

        /**
         * 加载人员列表
         */
        _loadPersonList: b0605 => {
            const list = this.jobScheme.schemeList.filter(item => item.b0605 === b0605);
            const paramsList = list.map(item => item.b0605);
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                b0605s: paramsList,
            };
            this.service.getPersonList(params).subscribe(val => {
                if (!!val && val.length > 0) {
                    this.personListIfy.listAll = val.map(item => {
                        return {
                            ...item,
                            text: item.A0101,
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        };
                    });
                    this.personListIfy.pagination.pageChange(true);
                }
            });
        },

        selectedPerson: null,
        listAll: [],
        list: [],
        /**
         * 选中人员
         */
        evtSelectedPerson: person => {
            this.personListIfy.selectedPerson = person;
            this.formListIfy.evtChange({ index: 0 });
        },
        /**
         * 审批-单人
         */
        evtAuditPerson: item => {
            this.auditPersonIfy.title = '人员审批';
            this.auditPersonIfy.isBatch = false;
            this.auditPersonIfy.open();
            this.auditPersonIfy.form.reset(item);
        },
        /**
         * 批量审批
         */
        evtBatchAudit: () => {
            this.auditPersonIfy.title = '人员批量审批';
            this.auditPersonIfy.isBatch = true;
            this.auditPersonIfy.open();
            this.auditPersonIfy.form.reset();
        },
        /**
         * 查看审批
         */
        evtSeeAudit: item => {
            this.personAuditViewIfy.personId = item.keyId;
            this.personAuditViewIfy.open();
        },

        pagination: {
            initPage: () => {
                const { pageSize, pageIndex } = this.personListIfy.pagination;
                this.personListIfy.pagination.total = this.personListIfy.listAll.length;
                this.personListIfy.list =
                    this.personListIfy.listAll.length > 0
                        ? this.personListIfy.listAll.slice(
                              pageSize * (pageIndex - 1),
                              pageIndex * pageSize
                          )
                        : [];
            },
            pageIndex: 1,
            pageSize: 10,
            total: 0,
            /**
             * 基本子集数据分页
             */
            pageChange: (reset = false) => {
                if (reset) {
                    this.personListIfy.pagination.pageIndex = 1;
                }
                this.personListIfy.pagination.initPage();

                const [first] = this.personListIfy.list;
                this.personListIfy.evtSelectedPerson(first);
                this.cdr.detectChanges();
            },
        },
    };

    @ViewChild('personAuditFormElement', { static: false })
    personAuditFormElement: ElementRef;
    /**
     * 表册相关
     */
    formListIfy = {
        selectedIndex: 0,
        tag: '',
        status: true,
        list: [
            {
                name: '干部任免审批表',
                tag: 'b1',
                permission: 'wage_change_table001',
            },
            {
                name: '职级使用情况表',
                tag: 'b2',
                permission: 'salaryadjustmentaudit001_xin',
            },
        ],
        evtChange: ({ index }) => {
            // const item = this.formListIfy.list[index];
            // this.formListIfy.tag = item.tag;
            // switch (item.tag) {
            //     case 'b1':
            //         this.formListIfy.status = true;
            //         break;
            //     case 'b2':
            //         this.formListIfy.status = false;
            //         break;
            // }
            // this.showPersonInfoIfy.list.forEach(list => {
            //     if (!this.formListIfy.status) {
            //         list.status = list.tag === 'down' ? true : false;
            //     } else {
            //         list.status = true;
            //     }
            // });
            // this.personFormIfy.permission = item.permission;
            // this.personFormIfy._setParams();
            // this.cdr.detectChanges();
        },
    };
    @ViewChild('personFormMagerElement', { static: false })
    personFormMagerElement: ElementRef;

    /**
     * 人员表册
     */
    personFormIfy = {
        permission: null,
        params: null,
        _setParams: () => {
            if (!this.personListIfy.selectedPerson) {
                return;
            }
            const { jobId, jobStepId } = this.jobStepInfo;
            const { keyId } = this.personListIfy.selectedPerson;
            this.personFormIfy.params = {
                jobId,
                jobStepId,
            };
            this.personFormIfy.params[`${this.tableHelper.getTableCode('A01')}_ID`] = keyId;
        },
        evtDataChange: event => {
            const { jobId, jobStepId, jobDataId } = this.jobStepInfo;
            const data = {};
            data[event.field.column.TABLE_COLUMN_CODE] = event.value;
            const params = {
                ...event.cellConfig,
                jobId,
                jobStepId,
                jobDataId,
                changeType: 1,
                tableId: event.field.tableCode,
                data,
            };
            this.workflowService.saveChangeData(params).subscribe();
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
                const personInfo = this.personListIfy.selectedPerson;
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
        /**
         * 保存审批结果
         */
        evtSaveAudit: () => {
            if (this.workflowService.formVerify(this.auditPersonIfy.form)) {
                const data = this.auditPersonIfy.form.getRawValue();
                if (this.auditPersonIfy.isBatch) {
                    const datas = this.personListIfy.listAll.map(item => {
                        return {
                            ...data,
                            keyValue: item.keyId,
                            auditType: WfParamDataAuditTypeEnum.DATA,
                            jobId: this.jobStepInfo.jobId,
                            jobStepId: this.jobStepInfo.jobStepId,
                            jobParamId: this.jobStepInfo.jobParamId,
                        };
                    });
                    this.workflowService.batchSaveAudit(datas).subscribe(result => {
                        // 设置审批结果
                        this.personListIfy.listAll.forEach(item => {
                            item.auditState = data.auditState;
                            item.auditStateDesc = data.auditStateDesc;
                        });
                        this.auditChange.emit();
                        this.auditPersonIfy.close();
                    });
                    return;
                }
                const personInfo = this.personListIfy.selectedPerson;
                data.keyValue = personInfo.keyId;
                data.auditType = WfParamDataAuditTypeEnum.DATA;

                this.workflowService
                    .saveAudit({
                        ...data,
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        jobParamId: this.jobStepInfo.jobParamId,
                    })
                    .subscribe(result => {
                        // 设置审批结果
                        personInfo.auditState = data.auditState;
                        personInfo.auditStateDesc = data.auditStateDesc;
                        this.auditChange.emit();
                        this.auditPersonIfy.close();
                    });
            }
        },
    };

    /**
     * 信息展示
     */
    showPersonInfoIfy = {
        list: [
            { label: '附件资料', icon: 'folder', tag: 'file', status: true },
            { label: '信息变动', icon: 'user', tag: 'all', status: true },
            { label: '下载', icon: 'download', tag: 'down', status: true },
        ],
        showContent: item => {
            switch (item.tag) {
                case 'file':
                    this.personAnnexIfy.open();
                    break;
                case 'all':
                    break;
                case 'down':
                    break;
            }
        },
    };

    /**
     * 职数方案
     */
    jobScheme = {
        current: '',
        schemeList: [],
        showList: [],
        selectListOptions: [],
        selectChange: value => {
            let personlist = [];
            const list = this.jobScheme.schemeList.filter(item => item.b0605 === value);
            const paramsList = list.map(item => item.b0605);
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                b0605s: paramsList,
            };
            this.service.getPersonList(params).subscribe(val => {
                if (!!val && val.length > 0) {
                    this.personListIfy.listAll = val.map(item => {
                        return {
                            ...item,
                            text: item.A0101,
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        };
                    });
                    this.personListIfy.pagination.pageChange(true);
                }
            });
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
            const { keyId } = this.personListIfy.selectedPerson;
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
     * 信息变动情况
     */
    personInfoChangeIfy = {
        visible: false,
        title: '信息变动情况',
        width: 480,
        close: () => (this.personInfoChangeIfy.visible = false),
        open: () => {
            this.personInfoChangeIfy.visible = true;
        },
    };

    ngOnInit() {}

    ngAfterViewInit() {}

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }

    /**
     * 加载方案
     */
    loadJobScheme() {
        if (!this.jobStepInfo?.jobId) {
            return;
        }
        // 获取保存的职数方案
        this.service.getWfScheme(this.jobStepInfo.jobId).subscribe(val => {
            this.jobScheme.schemeList = val.map(item => {
                return {
                    ...item,
                    DATA_3001_UNIT_B06_ID: item.schemeId,
                    B0601: item.schemeName,
                    checked: true,
                };
            });
            if (this.jobScheme.schemeList?.length > 0) {
                let codeMap = new Map();
                this.jobScheme.schemeList.forEach(item => {
                    codeMap.set(item.b0605, item.b0605);
                });
                let codelist = [];
                codeMap.forEach(value => {
                    codelist.push(value);
                });
                this._getJobLevelList(codelist);
            }
        });
    }

    /**
     * 获取所有职务层次
     */
    private _getJobLevelList(list) {
        let selectListOptions = [];
        let Names = [];
        list.forEach((ele, index) => {
            let allNames = [];
            selectListOptions[index] = {
                value: ele,
                label: '',
            };
            this.jobScheme.schemeList.forEach(codeItem => {
                if (codeItem.b0605 === ele && codeItem.rankCode) {
                    let rankNameList = codeItem.rankName.split(',');
                    allNames.push(...rankNameList);
                }
            });
            let codeNameSet = new Set(allNames);
            Names = [];
            codeNameSet.forEach(val => {
                Names.push(val);
            });

            selectListOptions[index].label = Names.join(',');
        });
        this.jobScheme.selectListOptions = selectListOptions.filter(item => item.label !== '');
        const index = this.jobScheme.selectListOptions.findIndex(item => item.value === '01');
        if (index >= 0) {
            this.jobScheme.current = this.jobScheme.selectListOptions[index].value;
            this.personListIfy._loadPersonList(this.jobScheme.current);
        } else if (this.jobScheme.selectListOptions[0]) {
            this.jobScheme.current = this.jobScheme.selectListOptions[0].value;
            this.personListIfy._loadPersonList(this.jobScheme.current);
        }
    }
}
