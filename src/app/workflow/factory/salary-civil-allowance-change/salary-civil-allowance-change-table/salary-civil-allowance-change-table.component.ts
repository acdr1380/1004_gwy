import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
} from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { CommonService } from 'app/util/common.service';
import { SalaryGz07DrawerComponent } from 'app/components/salary-gz07/salary-gz07-drawer/salary-gz07-drawer.component';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { JBT_TABLE } from './allowance-field/JBT';
import { AllowEditComponent } from './allow-edit/allow-edit.component';
import { SalaryCivilAllowanceChangeService } from '../salary-civil-allowance-change.service';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { AllowFields } from './allowance-field/fields';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    selector: 'gl-salary-civil-allowance-change-table',
    templateUrl: './salary-civil-allowance-change-table.component.html',
    styleUrls: ['./salary-civil-allowance-change-table.component.scss'],
})
export class SalaryCivilAllowanceChangeTableComponent implements OnInit {
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
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @ViewChild('personTableElement', { static: false }) personTableElement: ElementRef;

    @ViewChild('operSelectPerson', { static: false }) operSelectPerson: OperSelectPersonComponent;
    @ViewChild('scrolleditAllElement', { static: false })
    scrolleditAllElement: CdkVirtualScrollViewport;

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
    @ViewChild('scrollViewPersonList', { static: false })
    scrollViewPersonList: CdkVirtualScrollViewport;
    /**
     * 人员列表相关
     */
    personListIfy = {
        filterParmas: {
            A0151S: ['01', '02', '03', '04', '0401', '0402'],
        },
        find: {
            // 搜索框
            searchWidth: 280,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                this.personListIfy.selectIndex = this.personListIfy.list.findIndex(
                    item => item.keyId === value
                );
                this.scrollViewPersonList.scrollToIndex(this.personListIfy.selectIndex);
                this.personListIfy.evtSelectedPerson(
                    this.personListIfy.list[this.personListIfy.selectIndex],
                    true
                );
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personListIfy.find.list = this.personListIfy.list.filter(
                        item => item.text.indexOf(searchKey) > -1
                    );
                }
            },
        },
        /**
         * 加载人员列表
         */
        _loadPersonList: (isRef = false) => {
            if (this.personListIfy.list.length > 0 && !isRef) {
                return;
            }
            if (!this.jobStepInfo) {
                return;
            }
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
            };
            this.workflowService.getWfPersonList(this.jobStepInfo.wfId, data).subscribe(result => {
                this.personListIfy.list = result.map(item => {
                    return {
                        ...item,
                        text: item.A0101,
                        keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                    };
                });
                if (this.personListIfy.list.length > 0) {
                    this.personListIfy.evtSelectedPerson(this.personListIfy.list[0]);
                    this.allowanceTable.salaryTab.loadSalaryTable(true);
                }
            });
        },
        selectIndex: -1,
        list: [],
        psnKeyId: [],
        /**
         * 选中人员
         */
        evtSelectedPerson: (item, isRef = false) => {
            if (this.personListIfy.list[this.personListIfy.selectIndex] === item && !isRef) {
                return;
            }
            this.personListIfy.selectIndex = this.personListIfy.list.findIndex(
                v => v.keyId === item.keyId
            );

            switch (this.allowanceTable.tabSelect) {
                case 0:
                    this.allowanceTable.getPersonTable();
                    break;
                case 1:
                    this.allowanceTable.salaryTab.loadSalaryTable();
                    break;
                default:
                    this.operPersonFileIfy._loadFileList();
                    break;
            }
        },

        evtChange: () => {
            // 导人之后加载人员列表
            this.personListIfy._loadPersonList(true);
            this.allowanceTable.salaryTab.loadSalaryTable(true);
        },
        /**
         * 选择人员
         */
        evtSelectPerson: () => {
            this.personListIfy.psnKeyId = this.personListIfy.list.map(v => {
                return v[`${this.tableHelper.getTableCode('A01')}_ID`];
            });
            this.operSelectPerson.show();
        },
        /**
         * 撤选
         */
        evtDeletePerson: item => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要撤选当前人员吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const { jobId, jobStepId, wfId } = this.jobStepInfo;
                    const data = {
                        jobId,
                        jobStepId,
                        keyIds: [item.keyId],
                    };
                    this.workflowService.deletePerson(wfId, data).subscribe(() => {
                        const index = this.personListIfy.list.findIndex(
                            v => v.keyId === item.keyId
                        );
                        this.personListIfy.list.splice(index, 1);
                        this.personListIfy.list = [...this.personListIfy.list];
                        let selectIndex = index;
                        // 如果是最后一人
                        if (this.personListIfy.selectIndex === this.personListIfy.list.length) {
                            selectIndex = selectIndex - 1;
                        }
                        this.personListIfy.evtSelectedPerson(
                            this.personListIfy.list[selectIndex],
                            true
                        );
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },

        /**
         * 计算之后
         */
        calculateChange: () => {
            this.allowanceTable.salaryTab.loadSalaryTable(true);
            this.allowanceTable.getPersonTable();
        },
    };

    @ViewChild('allowEditComponent', { static: false })
    _allowEditComponent: AllowEditComponent;
    @ViewChild('GZDA07Temp', { static: false })
    _GZDA07Temp: ElementRef;
    @ViewChild('GZTableTemp', { static: false })
    _GZTableTemp: ElementRef;
    @ViewChild('salaryTemplate', { static: false })
    SalaryTemplate: ElementRef;
    @ViewChild('allowanceTemplate', { static: false })
    AllowanceTemplate: ElementRef;
    @ViewChild('personFileTemplate', { static: false }) personFileTemplate: ElementRef;
    @ViewChild('salaryTemplate', { static: false }) salaryTemplate: ElementRef;
    /**
     * 津补贴表格
     */
    allowanceTable = {
        tabSelect: 0,
        tabList: [
            { name: '津补贴', temp: null },
            { name: '工资情况', temp: null },
            {
                name: '上传个人附件材料',
                temp: null,
            },
        ],
        tabChange: () => {
            const index = this.allowanceTable.tabSelect;
            switch (index) {
                case 0:
                    this.allowanceTable.tabList[index].temp = this.AllowanceTemplate;
                    break;
                case 1:
                    this.allowanceTable.tabList[index].temp = this.salaryTemplate;
                    this.allowanceTable.salaryTab.salarySelectChange();
                    break;
                default:
                    this.allowanceTable.tabList[index].temp = this.personFileTemplate;
                    this.operPersonFileIfy._loadFileList();
                    break;
            }
        },
        JBT_TABLE_FIELDS: JBT_TABLE,
        personData: <any>{},
        status: '',
        edit: event => {
            if (!this.canEdit) {
                return;
            }
            if (this.personListIfy.list.length === 0) {
                this.message.warning('请先选择人员后再进行编辑！');
                return;
            }
            this.allowanceTable.status = event;
            this._allowEditComponent.show();
        },
        evtGetTempOutParams: item => {
            return {
                fields: item.fields || [],
                tableData: item.tableData || [],
            };
        },
        /**
         * 获取表格数据
         */
        getPersonTable: () => {
            if (this.personListIfy.selectIndex < 0) {
                this.allowanceTable.personData = [];
                return;
            }
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [this.personListIfy.list[this.personListIfy.selectIndex].keyId],
            };
            this.service.getSpecailWfData(data).subscribe(result => {
                this.allowanceTable.personData = result;
            });
        },
        /**
         * 津补贴中工资部分
         */
        salaryTab: {
            tabSelect: 0,
            tabList: [
                { name: '现执行工资', temp: null, TABLE_CODE: 'GZDA07', fields: [], tableData: {} },
                { name: '工资变迁', temp: null, TABLE_CODE: 'GZ07', fields: [], tableData: [] },
            ],
            salarySelectChange: () => {
                this.allowanceTable.salaryTab.loadSalaryTable();
                const item = this.allowanceTable.salaryTab.tabList[
                    this.allowanceTable.salaryTab.tabSelect
                ];
                if (!item.temp) {
                    item.temp = item.TABLE_CODE === 'GZDA07' ? this._GZDA07Temp : this._GZTableTemp;
                    item.fields = AllowFields[item.TABLE_CODE];
                }
            },
            /**
             * 当前业务人员工资所有数据
             */
            personSalaryTableData: {},
            /**
             * 加载工资表格
             */
            loadSalaryTable: (isRef = false) => {
                if (this.personListIfy.list.length === 0) {
                    return;
                }
                if (!isRef) {
                    this.allowanceTable.salaryTab.filterPersonSalary();
                    return;
                }

                const data = {
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    childFields: {},
                };
                data.childFields[`${this.tableHelper.getTableCode('GZDA07')}`] = [];
                data.childFields[`${this.tableHelper.getTableCode('GZ07')}`] = [];
                const { wfId } = this.jobStepInfo;
                this.workflowService.getPsnList(wfId, data).subscribe(result => {
                    this.allowanceTable.salaryTab.personSalaryTableData = result;
                    this.allowanceTable.salaryTab.filterPersonSalary();
                });
            },
            /**
             *筛选数
             */
            filterPersonSalary: () => {
                const item = this.allowanceTable.salaryTab.tabList[
                    this.allowanceTable.salaryTab.tabSelect
                ];
                const keyId = this.personListIfy.list[this.personListIfy.selectIndex].keyId;
                const targetData = this.allowanceTable.salaryTab.personSalaryTableData[
                    `${this.tableHelper.getTableCode(item.TABLE_CODE)}`
                ];
                if (!targetData) {
                    return;
                }
                if (item.TABLE_CODE === 'GZDA07') {
                    item.tableData = targetData.filter(
                        v =>
                            v[`${this.tableHelper.getTableCode('GZDA07')}_A01_ID`] === keyId &&
                            v.IS_LAST_ROW
                    )[0];
                } else {
                    item.tableData = targetData.filter(
                        v => v[`${this.tableHelper.getTableCode('GZ07')}_A01_ID`] === keyId
                    );
                }
            },
        },
    };
    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;

    //#region 上传附件材料
    operPersonFileIfy = {
        data: [],
        loading: false,
        /**
         * 加载业务人员 上传附件列表
         */
        _loadFileList: () => {
            if (this.operPersonFileIfy.data.length > 0) {
                this.operPersonFileIfy._loadPersonFileList();
                return;
            }
            const { wfId } = this.jobStepInfo;
            const data = {
                wfId: wfId,
                stepId: this.jobStepInfo.stepId,
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
            const personInfo = this.personListIfy.list[this.personListIfy.selectIndex];
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
            const personInfo = this.personListIfy.list[this.personListIfy.selectIndex];
            this.operPersonFileIfy.data.forEach(row => {
                const list = personInfo.fileList.filter(item => item.annexId === row.annexId);
                // row.haveFile = list && list.length > 0;
                row.fileList = this.onlineDocOverlayElement.buildThumbUrl(list);
            });
        },

        evtViewFile: row => {
            this.operPersonFileIfy.fileListIfy.row = row;
            this.operPersonFileIfy.fileListIfy.open();
        },

        selectFile: null,
        evtUpload: row => {
            this.operPersonFileIfy.selectFile = row;
        },
        fileCustomRequest: item => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);
            this.commonService.fileUpload(formData).subscribe(result => {
                const file = {
                    fileName: item.file.name,
                    // filePath: `api/gl-file-service/static/attachment/${result.id}?fileName=${result.fileName}`,
                    filePath: `${this.commonService.getDownFileURL(
                        result.fileId,
                        result.fileName
                    )}`,
                    fileType: result.fileType,
                    fileSize: result.fileSize,
                    fileId: result.fileId,
                };
                this.operPersonFileIfy._savePersonFileData(file, item.data);
            });
        },

        /**
         * 保存人员附件
         */
        _savePersonFileData: (file, ft) => {
            const personInfo = this.personListIfy.list[this.personListIfy.selectIndex];
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                jobDataId: this.jobStepInfo.jobDataId,

                keyId: personInfo.keyId,
                annexId: ft.annexId,
                ...file,
            };
            this.workflowService.savePersonAnnex(params).subscribe(result => {
                // this.operPersonFileIfy.selectFile.haveFile = true;

                personInfo.fileList = personInfo.fileList ? personInfo.fileList : [];
                personInfo.fileList.push({
                    ...result,
                    url: result.filePath,
                    size: result.fileSize,
                    name: result.fileName,
                    type: result.fileType,
                });
                this.operPersonFileIfy._setPersonFileStatus();
            });
        },

        selectedIndex: 0,
        list: [],
        preview: file => {
            const item = this.operPersonFileIfy.data.find(v => v.annexId === file.annexId);

            const personInfo = this.personListIfy.list[this.personListIfy.selectIndex];
            this.operPersonFileIfy.list = personInfo.fileList
                .filter(v => v.annexId === file.annexId)
                .map(x => ({ ...x, fileName: x.fileName }));

            const index = item.fileList.findIndex(v => v.id === file.id);
            this.onlineDocOverlayElement.selectedIndex = index;
            this.onlineDocOverlayElement.show();
            return false;
        },

        fileRemove: file => {
            const item = this.operPersonFileIfy.data.find(v => v.annexId === file.annexId);
            const index = item.fileList.findIndex(v => v.id === file.id);
            item.fileList.splice(index, 1);
            item.fileList = [...item.fileList];
            this.workflowService.deletePersonFile(file.id).subscribe(() => {
                const personInfo = this.personListIfy.list[this.personListIfy.selectIndex];
                personInfo.fileList.splice(
                    personInfo.fileList.findIndex(v => v.id === file.id),
                    1
                );
            });
        },

        fileListIfy: {
            visible: false,
            title: '人员附件列表',
            width: 400,
            selectedIndex: 0,
            close: () => (this.operPersonFileIfy.fileListIfy.visible = false),
            open: () => {
                this.operPersonFileIfy.fileListIfy._buildFiletList();
                this.operPersonFileIfy.fileListIfy.visible = true;
            },

            row: null,
            list: [],
            _buildFiletList: () => {
                const personInfo = this.personListIfy.list[this.personListIfy.selectIndex];
                this.operPersonFileIfy.fileListIfy.list = personInfo.fileList.filter(
                    item => item.annexId === this.operPersonFileIfy.fileListIfy.row.annexId
                );
                this.operPersonFileIfy.fileListIfy.list.map(v => (v.fileName = v.fileName));
            },
            fileRemove: (file: NzUploadFile): boolean => {
                const personInfo = this.personListIfy.list[this.personListIfy.selectIndex];
                const _index = personInfo.fileList.findIndex(x => x.keyId === file.keyId);
                personInfo.fileList.splice(_index, 1);
                this.operPersonFileIfy.fileListIfy._buildFiletList();
                this.workflowService.deletePersonFile(file.id).subscribe(() => {
                    this.operPersonFileIfy.fileListIfy.row.haveFile = personInfo.fileList.length;
                });
                return true;
            },
            preview: (file: NzUploadFile) => {
                const _index = this.operPersonFileIfy.fileListIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.operPersonFileIfy.fileListIfy.selectedIndex = _index;
                this.onlineDocOverlayElement.show();
                return false;
            },
        },
    };

    @ViewChild('salaryGZ07Element', { static: false }) salaryGZ07Element: SalaryGz07DrawerComponent;

    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private commonService: CommonService,
        private router: Router,
        private message: NzMessageService,
        private loading: LoadingService,
        private service: SalaryCivilAllowanceChangeService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.personListIfy._loadPersonList(true);
        this.allowanceTable.tabChange();
        this.cdr.detectChanges();
    }
    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }
}
