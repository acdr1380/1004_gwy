import {
    Component,
    OnInit,
    ViewChild,
    AfterViewInit,
    Input,
    ChangeDetectorRef,
} from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { CommonService } from 'app/util/common.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { TibetExamRecordService } from '../tibet-exam-record.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CropperImagesComponent } from 'app/components/cropper-images/cropper-images.component';
import { ExamAdjustChildOrderComponent } from './exam-adjust-child-order/exam-adjust-child-order.component';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
    selector: 'gl-exam-record-table',
    templateUrl: './exam-record-table.component.html',
    styleUrls: ['./exam-record-table.component.scss'],
})
export class ExamRecordTableComponent implements OnInit, AfterViewInit {
    isFullScreen = false;
    columnType = ColumnTypeEnum;
    canEdit = false;
    /**
     * 业务信息 JobStepInfo
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this.canEdit = v.jobStepState === JobStepStateEnum.PROCESSING;
            this._jobStepInfo = v;
            this.personListIfy._loadPersonList(true);
            // this.personalInfo.evtAllData();
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

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
        selectIndex: -1,
        find: {
            // 搜索框
            searchWidth: 180,
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
        _loadPersonList: (isRef = false) => {
            if (this.personListIfy.listAll.length > 0 && !isRef) {
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
            });
        },

        selectPerson: null,
        selectedImg: '',
        listAll: [],
        list: [],
        /**
         * 选中人员
         */
        evtSelectedPerson: person => {
            this.personListIfy.selectPerson = person;
            const index = this.personListIfy.list.findIndex(v => v.keyId === person.keyId);
            this.personListIfy.selectIndex = index;
            this.personalInfo.evtAllData();
            if (
                this.interfaceSchemeIfy.selectedTable &&
                this.interfaceSchemeIfy.selectedTable.systemSchemeTable.TABLE_CODE ===
                    'fileAttacment'
            ) {
                this.operPersonFileIfy._loadFileList();
            }
        },
        /**
         * 撤销人员
         */
        evtDeletePerson: item => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要撤选当前人员吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const data = {
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        keyIds: [item.keyId],
                    };
                    this.workflowService.deletePerson(this.service.wfId, data).subscribe(() => {
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

                        this.personListIfy.evtSelectedPerson(this.personListIfy.list[selectIndex]);
                    });
                },
                nzOnCancel: () => {},
            });
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
    /**
     * 选择公招计划
     */
    selectPlan = {
        currentPlan: {
            BP0102: '',
        },
        allPlans: [],
    };
    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     *上传附件
     */

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
            const personInfo = this.personListIfy.selectPerson;
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
    /**
     * 调整子集顺序
     */
    @ViewChild('adjustElement', { static: false })
    adjustElement: ExamAdjustChildOrderComponent;
    adjustChild = {
        tableData: [],
        tableHeaderList: [],
        tableCode: '',
        open: () => {
            this.adjustChild.tableCode = this.interfaceSchemeIfy.selectedTable.systemSchemeTable.TABLE_CODE;
            this.adjustChild.tableData = this.interfaceSchemeIfy.selectedTable.tableData;
            this.adjustChild.tableHeaderList = this.interfaceSchemeIfy.selectedTable.systemSchemeHeader;
            this.adjustElement.show();
        },
        change: data => {
            this.interfaceSchemeIfy.selectedTable.tableData = data;
            // this.personInfoIfy.table.rows = data;
        },
    };
    @ViewChild('inputEditElement', { static: false }) inputEditElement: ViewChild;
    @ViewChild('chileTableElement', { static: false }) chileTableElement: ViewChild;
    @ViewChild('personFileTemplate', { static: false }) personFileTemplate: ViewChild;

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
            this.interfaceSchemeIfy.selectedTable = item;
            this.interfaceSchemeIfy._buildEditor();
        },
        isEdit: true,

        // 是否主集
        evtGetIsMainTable: (): boolean => {
            const item = this.interfaceSchemeIfy.selectedTable;
            return (
                item && item.systemSchemeTable.TABLE_CODE === this.tableHelper.getTableCode('A01')
            );
        },

        // 加载界面方案
        _load: () => {
            if (this.interfaceSchemeIfy.result) {
                return;
            }
            this.commonService.getSchemeContent('tibet_exam_record').subscribe(result => {
                const fileAttachment = {
                    systemSchemeTable: {
                        SCHEME_TABLE_DISPLAY_NAME: '附件材料',
                        TABLE_CODE: 'fileAttacment',
                    },
                };
                // 添加附件
                result.systemSchemeList.push(fileAttachment);
                this.interfaceSchemeIfy.result = result;
                const [first] = result.systemSchemeList;
                this.interfaceSchemeIfy.selectedTable = first;
                this.interfaceSchemeIfy._buildEditor();
            });
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
                inline: true,
            };
        },
        // 构建表单
        _buildEditor: () => {
            const item = this.interfaceSchemeIfy.selectedTable;
            if (item.systemSchemeTable.TABLE_CODE === 'fileAttacment' && !item.elTemp) {
                // 附件材料
                item.elTemp = this.personFileTemplate;
                this.operPersonFileIfy._loadFileList();
                return;
            }
            // 判断是否已经渲染
            if (!item.elTemp) {
                if (this.interfaceSchemeIfy.evtGetIsMainTable()) {
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
                    // 不可编辑时表单禁用
                    if (!this.canEdit) {
                        form.disable();
                    }
                    item.editForm = form;
                    item.formData = {};
                    item.elTemp = this.inputEditElement;
                    item.editForm.patchValue(item.formData);
                } else {
                    item.elTemp = this.chileTableElement;
                }
            }
            this.personalInfo.bindValue();
        },

        /**
         * 身份证号自动生成出生日期与性别
         */
        idCardToDateAndGender: value => {
            let obj = <any>{
                A0184: value,
                A0104: { text: '', value: null },
            };
            switch (value.length) {
                case 15:
                    obj.A0107 = moment('19' + value.substring(6, 12), 'YYYYMMDD').format(
                        'YYYY-MM-DD'
                    );
                    obj.A0104.text = value.charAt(14) % 2 === 0 ? '女' : '男';
                    obj.A0104.value = obj.A0104.text === '男' ? 1 : 2;
                    break;
                case 18:
                    obj.A0107 = moment(value.substring(6, 14), 'YYYYMMDD').format('YYYY-MM-DD');
                    obj.A0104.text = value.charAt(16) % 2 === 0 ? '女' : '男';
                    obj.A0104.value = obj.A0104.text === '男' ? 1 : 2;
                    break;
                default:
                    this.message.warning('身份证号输入错误！');
                    break;
            }
            return obj;
        },

        /**
         * 保存主集
         */
        evtSave: async () => {
            const { editForm } = this.interfaceSchemeIfy.selectedTable;
            // const checkResult = await this.interfaceSchemeIfy.checkPersonId(editForm.value);
            if (this.commonService.formVerify(editForm)) {
                const _loading = this.loading.show();
                const data = editForm.getRawValue();
                const param = {
                    keyId: this.personListIfy.selectPerson
                        ? this.personListIfy.selectPerson.keyId
                        : '',
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType: !this.personListIfy.selectPerson
                        ? WfDataChangeTypeEnum.ADD
                        : WfDataChangeTypeEnum.MODIFY,
                    tableId: this.tableHelper.getTableCode('A01'),
                    data: data,
                };
                this.workflowService.saveChangeData(param).subscribe(result => {
                    _loading.close();
                    this.personalInfo.personAllDatas = null;
                    this.personalInfo.evtAllData();
                });
            }
        },
        /**
         * 新增子集
         */
        evtAddChildData: () => {
            const item = this.interfaceSchemeIfy.selectedTable;
            if (!this.personListIfy.selectPerson) {
                this.message.warning('请先添加人员主集或选择要添加子集的人员!');
                return;
            }
            if (item.editForm) {
                item.editForm.reset({});
            }
            item.formData = {};
            this.interfaceSchemeIfy.childEditIfy.open();
        },
        /**
         * 编辑子集
         */
        evtEditChildData: row => {
            const item = this.interfaceSchemeIfy.selectedTable;
            this.interfaceSchemeIfy.childEditIfy.isEdit = true;
            item.formData = Object.assign({}, row);
            this.interfaceSchemeIfy.childEditIfy.open();
        },
        /**
         * 删除子集
         */
        evtDeleteChildData: row => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const setChild = this.interfaceSchemeIfy.selectedTable;
                    const key = `${setChild.systemSchemeTable.TABLE_CODE}_ID`;
                    const dataArray = [
                        {
                            childId: row[key],
                            keyId: this.personListIfy.selectPerson.keyId,
                            jobId: this.jobStepInfo.jobId,
                            jobStepId: this.jobStepInfo.jobStepId,
                            jobDataId: this.jobStepInfo.jobDataId,
                            changeType: WfDataChangeTypeEnum.DELETE,
                            tableId: setChild.systemSchemeTable.TABLE_CODE,
                        },
                    ];
                    this.workflowService.deleteTableData(dataArray).subscribe(() => {
                        const item = this.interfaceSchemeIfy.selectedTable;
                        const index = item.tableData.findIndex(v => v[key] === row[key]);
                        item.tableData.splice(index, 1);
                        item.tableData = [...item.tableData];
                        const totalIndex = this.personalInfo.personAllDatas[
                            setChild.systemSchemeTable.TABLE_CODE
                        ].findIndex(v => v[key] === row[key]);
                        this.personalInfo.personAllDatas[
                            setChild.systemSchemeTable.TABLE_CODE
                        ].splice(totalIndex, 1);
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
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
                    // 不可编辑时表单禁用
                    if (!this.canEdit) {
                        form.disable();
                    }
                    item.editForm = form;
                    item.drawerTemp = this.inputEditElement;
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
            /**
             * 修改子集
             */
            evtSave: () => {
                const {
                    editForm,
                    systemSchemeTable,
                    formData,
                } = this.interfaceSchemeIfy.selectedTable;
                if (this.commonService.formVerify(editForm)) {
                    const _loading = this.loading.show();
                    const data = editForm.getRawValue();
                    const key = `${systemSchemeTable.TABLE_CODE}_ID`;
                    const tableId = this.interfaceSchemeIfy.result.systemSchemeList[
                        this.interfaceSchemeIfy.index
                    ].systemSchemeTable.TABLE_CODE;
                    const param = {
                        keyId: this.personListIfy.selectPerson.keyId,
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        jobDataId: this.jobStepInfo.jobDataId,
                        changeType: !formData[key]
                            ? WfDataChangeTypeEnum.ADD
                            : WfDataChangeTypeEnum.MODIFY,
                        tableId: tableId,
                        data: data,
                        childId: formData[key] || -1,
                    };
                    this.workflowService.saveChangeData(param).subscribe(result => {
                        _loading.close();
                        const item = this.interfaceSchemeIfy.selectedTable;
                        if (!this.interfaceSchemeIfy.childEditIfy.isEdit) {
                            const data = result.data;
                            data[tableId+"_ID"] = result.childId;
                            if (!item.tableData) {
                                item.tableData = [];
                            }
                            item.tableData = [...item.tableData, data];
                            this.personalInfo.personAllDatas = null;
                            this.personalInfo.evtAllData();
                        } else {
                            const index = item.tableData.findIndex(v => v[key] === result.childId);
                            Object.assign(item.tableData[index], result.data);
                            item.tableData = [...item.tableData];
                        }
                        this.interfaceSchemeIfy.childEditIfy.close();
                    });
                }
            },
        },
    };
    @ViewChild('cropperImageElement', { static: false })
    cropperImageElement: CropperImagesComponent;
    /**
     * 裁剪照片 抽屉
     */
    cropperPictureIfy = {
        // 抽屉内容
        width: 600,
        visible: false,
        title: '照片上传',
        close: () => {
            this.cropperPictureIfy.visible = false;
        },
        open: () => {
            if (!this.canEdit) {
                return;
            }
            if (!this.personListIfy.selectPerson) {
                this.message.warning('请先添加相关要上传照片的人员！');
                return;
            }
            this.cropperImageElement.resetURL();
            this.cropperPictureIfy.visible = true;
        },

        evtUpload: () => {
            this.cropperPictureIfy.open();
        },
        evtPhotoChange: file => {
            this.cropperPictureIfy.evtSavePic(file);
            this.cropperPictureIfy.close();
        },
        // 保存照片
        evtSavePic: file => {
            const tempData = this.personalInfo.personAllDatas[
                this.tableHelper.getTableCode('A01B')
            ];
            let A01Bdata = null;
            if (tempData) {
                [A01Bdata] = tempData.filter(
                    item =>
                        item[`${this.tableHelper.getTableCode('A01B')}_A01_ID`] ===
                            this.personListIfy.list[this.personListIfy.selectIndex].keyId &&
                        item.IS_LAST_ROW
                );
            }
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                jobDataId: this.jobStepInfo.jobDataId,
                changeType: A01Bdata ? WfDataChangeTypeEnum.MODIFY : WfDataChangeTypeEnum.ADD,
                tableId: this.tableHelper.getTableCode('A01B'),
                childId: A01Bdata ? A01Bdata[`${this.tableHelper.getTableCode('A01B')}_ID`] : -1,
                keyId: this.personListIfy.list[this.personListIfy.selectIndex].keyId,
                data: {
                    A01BNAME: file.fileName,
                    A01BPATH: file.fileId,
                    A01BTYPE: file.fileType,
                    A01BSIZE: file.fileSize,
                },
            };
            this.workflowService.saveChangeData(params).subscribe(async result => {
                this.personalInfo.personAllDatas = null;
                await this.personalInfo.evtAllData();
                this.cropperPictureIfy.perosnPicture();
            });
        },
        perosnPicture: () => {
            if (!this.personalInfo.personAllDatas[this.tableHelper.getTableCode('A01B')]) {
                return;
            }
            const [A01B] = this.personalInfo.personAllDatas[
                this.tableHelper.getTableCode('A01B')
            ].filter(
                v =>
                    v[`${this.tableHelper.getTableCode('A01B')}_A01_ID`] ===
                        this.personListIfy.selectPerson.keyId && v.IS_LAST_ROW
            );

            this.personListIfy.selectedImg = A01B
                ? this.commonService.getOpenPhotoURL(A01B.A01BPATH)
                : null;
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
            };

            if (this.personalInfo.personAllDatas) {
                this.personalInfo.bindValue();
                return;
            }
            const result: any = await this.service.getPersonData(data);
            if (!result[this.tableHelper.getTableCode('A01')]) {
                return;
            }
            result[this.tableHelper.getTableCode('A01')] = result[
                this.tableHelper.getTableCode('A01')
            ].map(v => {
                v.keyId = v[`${this.tableHelper.getTableCode('A01')}_ID`];
                return v;
            });
            const item = this.interfaceSchemeIfy.selectedTable;

            this.personalInfo.personAllDatas = result;
            const [BP01] = result[`${this.tableHelper.getTableCode('BP01')}`] || [];
            this.selectPlan.currentPlan = BP01;
            if (
                item &&
                item.systemSchemeTable.TABLE_CODE !== this.tableHelper.getTableCode('A01') &&
                result[item.systemSchemeTable.TABLE_CODE]
            ) {
                item.tableData = result[item.systemSchemeTable.TABLE_CODE].filter(
                    v =>
                        v[item.systemSchemeTable.TABLE_CODE + '_A01_ID'] ===
                        this.personListIfy.selectPerson.keyId
                );
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
                    return;
                }
                if (tableId === this.tableHelper.getTableCode('A01')) {
                    // 主集绑定
                    const person = this.personalInfo.personAllDatas[
                        this.tableHelper.getTableCode('A01')
                    ].find(v => v.keyId === this.personListIfy.selectPerson.keyId);

                    this.interfaceSchemeIfy.selectedTable.editForm.patchValue(person);
                    this.interfaceSchemeIfy.selectedTable.formData = person;
                    this.cropperPictureIfy.perosnPicture();
                } else {
                    // 子集绑定
                    const person = this.personalInfo.personAllDatas[tableId].filter(
                        v => v[tableId + '_A01_ID'] === this.personListIfy.selectPerson.keyId
                    );
                    this.interfaceSchemeIfy.selectedTable.tableData = person;
                    this.interfaceSchemeIfy.selectedTable.tableData = [
                        ...this.interfaceSchemeIfy.selectedTable.tableData,
                    ];
                }
            }
        },
    };
    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private commonService: CommonService,
        private message: NzMessageService,
        private loading: LoadingService,
        private tableHelper: WfTableHelper,
        private service: TibetExamRecordService
    ) {}

    ngOnInit(): void {
        this.interfaceSchemeIfy._load();
    }

    ngAfterViewInit(): void {}

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }
}
