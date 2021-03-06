import { Component, OnInit, ViewChild, AfterViewInit, Input, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { CommonService } from 'app/util/common.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { TibetPersonEditService } from '../tibet-person-edit.service';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { WfParamDataAuditTypeEnum } from 'app/workflow/enums/WfParamDataAuditTypeEnum';
import { filter, distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
    selector: 'tibet-person-edit-list',
    templateUrl: './tibet-person-edit-list.component.html',
    styleUrls: ['./tibet-person-edit-list.component.scss']
})
export class TibetPersonEditListComponent implements OnInit, AfterViewInit {
    isFullScreen = false;
    columnType = ColumnTypeEnum;
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
            this.personListIfy._loadPersonList();
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @Output() auditChange = new EventEmitter<any>();

    @ViewChild('operSelectPerson', { static: false }) operSelectPerson: OperSelectPersonComponent;

    /**
     * 步骤流程图
     */
    flowChart = {
        visible: false,
        title: '业务路线图',
        height: 220,
        close: () => (this.flowChart.visible = false),
        open: () => {
            this.flowChart.visible = true;
            // 加载步骤信息
            this.flowChart.loadOperStepData();
        },
        /**
         * 路线图总数据
         */
        operStepList: [],
        loadOperStepData: () => {
            if (this.flowChart.operStepList.length > 0) {
                return;
            }
            this.workflowService
                .getOperStepList(this.jobStepInfo.wfId)
                .subscribe(stepInfo => (this.flowChart.operStepList = stepInfo));
        },
        /**
         * 获得当前步骤
         */
        evtGetStepIndex: (): number => {
            if (this.jobStepInfo && this.flowChart.operStepList.length > 0) {
                const index = this.flowChart.operStepList.findIndex(
                    item => item.stepId === this.jobStepInfo.stepId
                );
                return index;
            }
            return 0;
        },
    };
    /**
     * 业务跟踪-办理历史
     */
    tailAfterOper = {
        title: '业务跟踪',
        width: 480,
        visible: false,
        close: () => (this.tailAfterOper.visible = false),
        open: () => {
            this.tailAfterOper.visible = true;
            // 加载办理历史，流程跟踪
            this.tailAfterOper.loadTailAfterList();
        },
        /*
         * 审批历史
         */
        tailAfterList: [],
        loadTailAfterList: () => {
            if (this.tailAfterOper.tailAfterList.length > 0) {
                return;
            }
            this.workflowService
                .selectListByWfTracking(this.jobStepInfo.jobId)
                .subscribe(result => (this.tailAfterOper.tailAfterList = result));
        },
    };

    /**
     * 人员信息
     */
    personalInfo = {
        personAllDatas: <any>null,
        /**
         * 获取业务信息
         */
        evtAllData: async () => {
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [this.personListIfy.selectPerson.keyId],
                createChangeHistoryData: true,
            };
            const result: any = await this.service.getPersonList(data);
            if (!result[this.tableHelper.getTableCode('A01')]) {
                return;
            }
            result[this.tableHelper.getTableCode('A01')] = result[
                this.tableHelper.getTableCode('A01')
            ].map(v => {
                v.keyId = v[`${this.tableHelper.getTableCode('A01')}_ID`];
                return v;
            });
            this.personalInfo.personAllDatas = result;
            // 加载界面方案
            this.interfaceSchemeIfy._load();
            const item = this.interfaceSchemeIfy.selectedTable;
            if (
                item &&
                item.systemSchemeTable.TABLE_CODE !== this.tableHelper.getTableCode('A01') &&
                result[item.systemSchemeTable.TABLE_CODE]
            ) {

                item.tableData = result[item.systemSchemeTable.TABLE_CODE];
                item.tableData = [...item.tableData];
            }
            this.personalInfo.bindValue();
        },

        /**
         * 表单、表格绑定值
         */
        bindValue: () => {
            if (!this.personListIfy.selectPerson) {
                if (this.interfaceSchemeIfy.selectedTable.editForm) {
                    this.interfaceSchemeIfy.selectedTable.formData = {};
                    this.interfaceSchemeIfy.selectedTable.editForm.reset({});
                }
                this.interfaceSchemeIfy.selectedTable.tableData = [];
                return;
            }
            if (this.interfaceSchemeIfy.selectedTable) {
                const tableId = this.interfaceSchemeIfy.selectedTable.systemSchemeTable.TABLE_CODE;
                if (
                    !this.personalInfo.personAllDatas ||
                    !this.personalInfo.personAllDatas[tableId]
                ) {
                    this.interfaceSchemeIfy.selectedTable.tableData = [];
                    return;
                }
                if (tableId === this.tableHelper.getTableCode('A01')) {
                    // 主集绑定
                    // const psnA01Data = this.personalInfo.personAllDatas[this.tableHelper.getTableCode('A01')];
                    // psnA01Data = psnA01Data.map()
                    const person = this.personalInfo.personAllDatas[this.tableHelper.getTableCode('A01')][0];
                    this.interfaceSchemeIfy.selectedTable.editForm.reset(person);
                    this.interfaceSchemeIfy.selectedTable.formData = person;
                    this.cropperPictureIfy.perosnPicture();
                } else {
                    // 子集绑定
                    const person = this.personalInfo.personAllDatas[tableId];
                    this.interfaceSchemeIfy.selectedTable.tableData = person;
                    this.interfaceSchemeIfy.selectedTable.tableData = [
                        ...this.interfaceSchemeIfy.selectedTable.tableData,
                    ];
                }
            }
        },
    };

    @ViewChild('scrollViewPersonList', { static: false })
    scrollViewPersonList: CdkVirtualScrollViewport;
    /**
     * 人员列表相关
     */
    personListIfy = {
        pageIndex: 1,
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
                const index = this.personListIfy.list.findIndex(item => item.keyId === value);
                this.personListIfy.pageIndex = Math.ceil((index + 1) / 10);
                this.personListIfy.evtSelectedPerson(this.personListIfy.list[index]);
                this.scrollViewPersonList.scrollToIndex(Math.ceil((index + 1) / 10));
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personListIfy.find.list = this.personListIfy.list.filter(
                        item => item.text.indexOf(searchKey) > -1
                    );
                }
            },
        },
        submitLoading: false,
        /**
         * 加载人员列表
         */
        _loadPersonList: async () => {
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
            };
            const result = await this.workflowService.getWfPersonList(this.service.wfId, data).toPromise();
            if (!!result && result.length > 0) {
                this.personListIfy.listAll = result.map(item => {
                    return {
                        ...item,
                        text: item.A0101,
                        keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                    };
                });
                this.personListIfy.pagination.pageChange(true);
            }
        },
        // 照片
        selectedImg: '',
        listAll: [],
        list: [],
        selectPerson: null,
        /**
         * 选中人员
         */
        evtSelectedPerson: item => {
            this.personListIfy.selectPerson = item;
            this.personalInfo.evtAllData();
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

    @ViewChild('inputEditElement', { static: false }) inputEditElement: ViewChild;
    @ViewChild('chileTableElement', { static: false }) chileTableElement: ViewChild;
    @ViewChild('drawerInputEditEle', { static: false }) _drawerInputEditEle: ViewChild;
    /**
     * 界面方案信息
     */
    interfaceSchemeIfy = {
        // 主集标识
        mainField: this.tableHelper.getTableCode('A01'),
        result: null,
        // 选中表
        selectedTable: null,
        index: 0,
        evtNextBack: index => {
            const item = this.interfaceSchemeIfy.result.systemSchemeList[index];

            this.interfaceSchemeIfy.index = index;
            this.interfaceSchemeIfy.evtSelectorTable(item);
        },
        evtSelectorTable: item => {
            if (this.interfaceSchemeIfy.evtGetDisabled(item)) {
                return;
            }

            this.interfaceSchemeIfy.selectedTable = item;
            this.interfaceSchemeIfy._buildEditor();
        },
        isEdit: true,
        evtGetDisabled: (item): boolean => {
            return false;
        },
        // 是否主集
        evtGetIsMainTable: (): boolean => {
            const item = this.interfaceSchemeIfy.selectedTable;
            return (
                item && item.systemSchemeTable.TABLE_CODE === this.tableHelper.getTableCode('A01')
            );
        },
        // 加载界面方案
        _load: async () => {
            if (this.interfaceSchemeIfy.result) {
                return;
            }
            const result = await this.commonService.getSchemeContent('gl_1004_gwygz_psn_init').toPromise();
            this.interfaceSchemeIfy.result = result;
            this.interfaceSchemeIfy.result = this.filterPageScheme();
            const [first] = result.systemSchemeList;
            this.interfaceSchemeIfy.selectedTable = first;
            this.interfaceSchemeIfy._buildEditor();
        },
        /**
         * 获得模板参数
         */
        evtGetTempOutParams: item => {
            return {
                formGroup: item.editForm || new FormGroup({}),
                fields: item.systemSchemeEdit,
                formData: item.formData || {},
                tableData: item.tableData || [],
                headerList: item.systemSchemeHeader,
            };
        },
        // 构建表单
        _buildEditor: () => {
            const item = this.interfaceSchemeIfy.selectedTable;
            // 判断是否已经渲染
            if (!item.elTemp) {
                if (this.interfaceSchemeIfy.evtGetIsMainTable()) {
                    // const _loading = this.loading.show();
                    const form = new FormGroup({});
                    item.systemSchemeEdit.forEach(v => {
                        form.addControl(
                            v.TABLE_COLUMN_CODE,
                            new FormControl(
                                { value: null, disabled: false },
                                [
                                    v.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
                                    v.SCHEME_EDIT_CHECK_SCRIPT
                                        ? this.commonService.buildValidatorsFn(
                                            v,
                                            v.SCHEME_EDIT_CHECK_SCRIPT,
                                            item.systemSchemeEdit
                                        )
                                        : null,
                                ].filter(s => s)
                            )
                        );
                    });
                    // 预览界面表单禁用
                    form.disable();
                    item.editForm = form;
                    item.formData = {};
                    item.elTemp = this.inputEditElement;
                    item.editForm.patchValue(item.formData);
                    // _loading.close();
                } else {
                    item.elTemp = this.chileTableElement;
                }
            }
            this.personalInfo.bindValue();
        },
        /**
         * 查看子集详细信息
         */
        evtEditChildData: row => {
            const item = this.interfaceSchemeIfy.selectedTable;
            this.interfaceSchemeIfy.childEditIfy.isEdit = true;
            item.formData = Object.assign({}, row);
            this.interfaceSchemeIfy.childEditIfy.open();
        },
        tableData: [],
        childEditIfy: {
            // 抽屉内容
            width: 480,
            visible: false,
            title: '详细信息',
            close: () => {
                this.interfaceSchemeIfy.childEditIfy.isEdit = false;
                this.interfaceSchemeIfy.childEditIfy.visible = false;
            },
            open: () => {
                const item = this.interfaceSchemeIfy.selectedTable;

                // 判断是否已经渲染
                if (!item.drawerTemp) {
                    const form = new FormGroup({});
                    item.systemSchemeEdit.forEach(v => {
                        form.addControl(v.TABLE_COLUMN_CODE, new FormControl(null));
                    });
                    // 预览界面所有表单禁用
                    form.disable();
                    item.editForm = form;
                    item.drawerTemp = this._drawerInputEditEle;
                }
                item.editForm.patchValue(item.formData || {});

                this.interfaceSchemeIfy.childEditIfy.visible = true;
            },
            isEdit: false,
            /**
             * 抽屉模板内容参数
             */
            evtGetTempOutParams: item => {
                return {
                    formGroup: item.editForm || new FormGroup({}),
                    fields: item.systemSchemeEdit,
                    formData: item.formData || {},
                };
            },
        },
    };

    /**
     * 人员照片相关
     */
    cropperPictureIfy = {
        /**
         * 人员照片设置
         */
        perosnPicture: () => {
            if (!this.personalInfo.personAllDatas[this.tableHelper.getTableCode('A01B')]) {
                this.personListIfy.selectedImg = null;
                return;
            }
            const [A01B] = this.personalInfo.personAllDatas[
                this.tableHelper.getTableCode('A01B')
            ].filter(v => v.IS_LAST_ROW);

            this.personListIfy.selectedImg = A01B
                ? this.commonService.getOpenPhotoURL(A01B.A01BPATH)
                : null;
        },
    };

    @ViewChild('onlineDocOverlayElement', { static: false }) onlineDocOverlayElement: OnlineDocComponent;
    /**
     * 上传附件
     */
    operPersonFileIfy = {
        title: '资料附件',
        visible: false,
        width: 500,
        data: [],
        open: () => {
            this.operPersonFileIfy._loadFileList();
            this.operPersonFileIfy.visible = true;
        },
        close: () => (this.operPersonFileIfy.visible = false),
        /**
         * 加载业务人员 上传附件列表
         */
        _loadFileList: () => {
            if (this.operPersonFileIfy.data.length > 0) {
                this.operPersonFileIfy._loadPersonFileList();
                return;
            }
            const data = {
                wfId: this.service.wfId,
                stepId: 'start',
            };
            this.workflowService.getWfFileByWfIdAndStepId(data).subscribe(result => {
                this.operPersonFileIfy.data = result;
                if (this.personListIfy.list.length > 0) {
                    this.operPersonFileIfy._loadPersonFileList();
                }
            });
        },
        /**
         * 加载个人已上传附件
         */
        _loadPersonFileList: () => {
            const personInfo = this.personListIfy.selectPerson;
            if (!personInfo) {
                return;
            }
            if (personInfo && personInfo.fileList && personInfo.fileList.length > 0) {
                this.operPersonFileIfy._setPersonFileStatus();
                return;
            }
            const data = {
                jobId: this.jobStepInfo.jobId,
                keyId: personInfo.keyId,
            };
            this.workflowService.getPersonFileList(data).subscribe(result => {
                personInfo.fileList = result.map(file => ({
                    ...file,
                    url: file.filePath,
                    size: file.fileSize,
                    name: file.fileName,
                    type: file.fileType,
                }));
                this.operPersonFileIfy._setPersonFileStatus();
            });
        },
        /**
         * 设置人员附件状态
         */
        _setPersonFileStatus: () => {
            const personInfo = this.personListIfy.selectPerson;
            this.operPersonFileIfy.data.forEach(row => {
                const list = personInfo.fileList.filter(item => item.annexId === row.annexId);
                // row.haveFile = list && list.length > 0;
                row.fileList = this.onlineDocOverlayElement.buildThumbUrl(list);
            });
        },
        selectedIndex: 0,
        list: [],
        preview: file => {
            const item = this.operPersonFileIfy.data.find(v => v.annexId === file.annexId);

            const personInfo = this.personListIfy.selectPerson;
            this.operPersonFileIfy.list = personInfo.fileList
                .filter(v => v.annexId === file.annexId)
                .map(x => ({ ...x, fileName: x.fileName }));

            const index = item.fileList.findIndex(v => v.id === file.id);
            this.onlineDocOverlayElement.selectedIndex = index;
            this.onlineDocOverlayElement.show();
            return false;
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
                const personInfo = this.personListIfy.selectPerson;
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
                        this.personListIfy.pagination.pageChange();
                        this.auditChange.emit();
                        this.auditPersonIfy.close();
                    });
                    return;
                }
                const personInfo = this.personListIfy.selectPerson;
                data.keyValue = personInfo.keyId;
                data.auditType = WfParamDataAuditTypeEnum.DATA;
                // data.id = personInfo.

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

    constructor(
        private workflowService: WorkflowService,
        private commonService: CommonService,
        private message: NzMessageService,
        private loading: LoadingService,
        private tableHelper: WfTableHelper,
        private service: TibetPersonEditService,
        private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit() {
    }

    ngAfterViewInit() { }

    /**
     * 筛选界面方案--预览表册
     */
    private filterPageScheme() {
        const result = this.personalInfo.personAllDatas[this.tableHelper.getTableCode('A01')];
        let list = [];
        if (!result[0].changeTable) {
            list = this.interfaceSchemeIfy.result.systemSchemeList.filter(
                v => v.systemSchemeTable.TABLE_CODE === this.tableHelper.getTableCode('A01')
            );
            return list;
        }
        if (!result[0].changeTable[this.tableHelper.getTableCode('A01')]) {
            result[0].changeTable.unshift(this.tableHelper.getTableCode('A01'));
        }
        list = this.interfaceSchemeIfy.result.systemSchemeList.filter(v => {
            const index = result[0].changeTable.findIndex(
                item =>
                    item === v.systemSchemeTable.TABLE_CODE &&
                    (item === this.tableHelper.getTableCode('A01')
                        ? true
                        : (!!this.personalInfo.personAllDatas[item] && this.personalInfo.personAllDatas[item].length > 0))
            );
            return index > -1;
        });
        return list;
    }

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }
}
