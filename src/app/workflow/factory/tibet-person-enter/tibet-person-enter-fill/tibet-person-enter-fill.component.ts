import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { CommonService } from 'app/util/common.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { TibetPersonEnterService } from '../tibet-person-enter.service';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import * as moment from 'moment';
import { AdjustChildOrderComponent } from './adjust-child-order/adjust-child-order.component';
import { filter, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { CropperImagesComponent } from 'app/components/cropper-images/cropper-images.component';
import { PersonCheckComponent } from './person-check/person-check.component';
import { Subject } from 'rxjs';
import { TibetPersonEnterFileComponent } from '../tibet-person-enter-file/tibet-person-enter-file.component';
import { DbTypeEnum } from 'app/workflow/enums/DbTypeEnum';

@Component({
    selector: 'gl-tibet-person-enter-fill',
    templateUrl: './tibet-person-enter-fill.component.html',
    styleUrls: ['./tibet-person-enter-fill.component.scss'],
})
export class TibetPersonEnterFillComponent implements OnInit, AfterViewInit {
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
    @ViewChild('scrollViewPersonList', { static: false })
    scrollViewPersonList: CdkVirtualScrollViewport;
    @ViewChild('operSelectPerson', { static: false }) _operSelectPerson: OperSelectPersonComponent;
    /**
     * 人员列表相关
     */
    personListIfy = {
        find: {
            // 搜索框
            searchWidth: 100,
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
                this.scrollViewPersonList.scrollToIndex(this.personListIfy.selectIndex);
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
         * 系统外添加人员
         */
        evtAddPerson: () => {
            // 是新增不是修改
            this.personListIfy.selectPerson = null;
            // 重置照片
            this.personListIfy.selectedImg = null;
            this.personListIfy.selectIndex = -1;

            const index = this.interfaceSchemeIfy.result.systemSchemeList.findIndex(
                v => v.systemSchemeTable.TABLE_CODE === this.tableHelper.getTableCode('A01')
            );
            this.interfaceSchemeIfy.index = index;
            this.interfaceSchemeIfy.selectedTable =
                this.interfaceSchemeIfy.result.systemSchemeList[index];
            this.interfaceSchemeIfy.evtSelectorTable(this.interfaceSchemeIfy.selectedTable);
            this.interfaceSchemeIfy.selectedTable.editForm.reset({});

            this.interfaceSchemeIfy.selectedTable.formData = {};
        },
        submitLoading: false,

        /**
         * 系统内增加人员
         */
        evtSelectPerson: () => {
            // this.selectPersonComponent.show();
            this._operSelectPerson.show();
        },
        /**
         * 加载人员列表
         */
        _loadPersonList: () => {
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
            };
            this.personListIfy.psnKeyId = [];
            this.workflowService.getWfPersonList(this.service.wfId, data).subscribe(result => {
                this.personListIfy.list = result.map(item => {
                    this.personListIfy.psnKeyId.push(
                        item[this.tableHelper.getTableCode('A01') + '_ID']
                    );
                    return {
                        ...item,
                        text: item.A0101,
                        keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                    };
                });
                if (this.personListIfy.list.length > 0) {
                    this.personListIfy.selectIndex = 0;
                    this.personListIfy.evtSelectedPerson(this.personListIfy.list[0]);
                }
            });
        },
        personDataChange: par => {
            const { data, status } = par;
            if (status) {
                // 新增人员
                const item = {
                    text: data.data.A0101,
                    keyId: data.keyId,
                };
                this.personListIfy.list.push(item);

                this.personListIfy.selectIndex = this.personListIfy.list.length - 1;
            } else {
                this.personListIfy.list[this.personListIfy.selectIndex].text = data.data.A0101;
            }

            this.personListIfy.list = [...this.personListIfy.list];
        },
        evtImportCustomRequest: async (item: NzUploadXHRArgs) => {
            const _loadingExcel = this.loading.show();
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);
            formData.append('jobId', this.jobStepInfo.jobId);
            formData.append('jobDataId', this.jobStepInfo.jobDataId);
            formData.append('jobStepId', this.jobStepInfo.jobStepId);

            const data = await this.service.importExcel(formData);
            _loadingExcel.close();
            const { person, wf } = data;
            this.cardRepate.repeatPerson.person = person || [];
            this.cardRepate.repeatPerson.wf = wf || [];
            this.cardRepate.showRepate();
            this.personalInfo.personAllDatas = null;
            this.personListIfy._loadPersonList();
        },
        psnKeyId: [],
        // 照片
        selectedImg: '',
        // 确定导入人员
        evtChange: async () => {
            this.personalInfo.personAllDatas = null;
            this.personListIfy._loadPersonList();
        },
        /**
         * 选中当前人员
         */
        selectIndex: -1,
        list: [],
        selectPerson: null,
        /**
         * 选中人员
         */
        evtSelectedPerson: item => {
            this.personListIfy.selectPerson = item;
            const index = this.personListIfy.list.findIndex(v => v.keyId === item.keyId);
            this.personListIfy.selectIndex = index;
            this.personalInfo.evtAllData();
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
                            this.personListIfy.selectedImg = null;
                        }

                        if (this.personListIfy.list.length === 0) {
                            this.personListIfy.psnKeyId = [];
                            this.interfaceSchemeIfy.selectedTable.editForm.reset({});
                            this.interfaceSchemeIfy.selectedTable.formData = {};
                            this.interfaceSchemeIfy.selectedTable.tableData = [];
                            return;
                        }
                        this.personListIfy.psnKeyId = this.personListIfy.psnKeyId.filter(
                            v => item.keyId === v
                        );
                        this.personListIfy.evtSelectedPerson(this.personListIfy.list[selectIndex]);
                    });
                },
                nzOnCancel: () => { },
            });
        },
        batchEdit: () => {
            this.causeChangeEditAllIfy.open();
        },
        pageIndex: 1,
    };
    /**
     * 重复身份证
     */
    cardRepate = {
        repeatPerson: {
            wf: [],
            person: [],
        },
        visible: false,
        show: () => {
            this.cardRepate.visible = true;
        },

        handleOk: () => {
            this.cardRepate.visible = false;
        },
        /**
         * 显示导入有问题的人员
         */
        showRepate: () => {
            const { person, wf } = this.cardRepate.repeatPerson;
            if (person.length === 0 && wf.length === 0) {
                return;
            }
            const repeatPerson = wf.map(v => {
                return {
                    ...v,
                    A0101: v.KEY_NAME,
                    A0184: v.SPECIAL_FIELD,
                    A0157_CN: v.ORG_NAME || '',
                };
            });

            this.cardRepate.repeatPerson.person =
                this.cardRepate.repeatPerson.person.concat(repeatPerson);
            this.cardRepate.show();
        },
    };
    @ViewChild('scrolleditAllElement', { static: false })
    scrolleditAllElement: CdkVirtualScrollViewport;
    /**
     * 编辑字段抽屉
     */
    causeChangeEditAllIfy = {
        title: '批量办理',
        visible: false,
        width: 820,
        // 批量办理界面方案
        interfaceSchemeIfy: {
            interfaceTabList: null,
            interfaceIndex: 0,
            evtSelectorTable: item => {
                console.log(item);
                this.causeChangeEditAllIfy._loadEditFields();
            },
        },
        close: () => {
            this.causeChangeEditAllIfy.visible = false;
        },
        open: () => {
            if (!this.causeChangeEditAllIfy.interfaceSchemeIfy.interfaceTabList) {
                this.causeChangeEditAllIfy.interfaceSchemeIfy.interfaceTabList =
                    this.interfaceSchemeIfy.result;
            }
            // this.causeChangeEditAllIfy._loadEditFields();
            this.causeChangeEditAllIfy.visible = true;
        },

        _loadEditFields: () => {
            const item =
                this.causeChangeEditAllIfy.interfaceSchemeIfy.interfaceTabList.systemSchemeList[
                this.causeChangeEditAllIfy.interfaceSchemeIfy.interfaceIndex
                ];

            this.personListIfy.list.forEach(row => (row.check = false));
            // if (!item.editForm) {
            //     const form = new FormGroup({});
            //     item.systemSchemeEdit.forEach(v => {
            //         form.addControl(
            //             v.TABLE_COLUMN_CODE,
            //             new FormControl(
            //                 { value: null, disabled: false },
            //                 [
            //                     v.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
            //                     v.SCHEME_EDIT_CHECK_SCRIPT
            //                         ? this.commonService.buildValidatorsFn(
            //                               v,
            //                               v.SCHEME_EDIT_CHECK_SCRIPT,
            //                               item.systemSchemeEdit
            //                           )
            //                         : null,
            //                 ].filter(s => s)
            //             )
            //         );
            //     });
            //     item.editForm = form;
            //     item.formData = {};
            // }
        },
        evtGetTempOutParams: item => {
            return {
                formGroup: item.editForm || new FormGroup({}),
                fields: item.systemSchemeEdit,
                formData: item.formData || {},
                inline: true,
            };
        },
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
                if (!value) {
                    this.causeChangeEditAllIfy.find.selectedIndex = -1;
                    return;
                }
                // 查找位置
                this.causeChangeEditAllIfy.find.selectedIndex = this.personListIfy.list.findIndex(
                    item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === value
                );

                this.scrolleditAllElement.scrollToIndex(
                    this.causeChangeEditAllIfy.find.selectedIndex
                );
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.causeChangeEditAllIfy.find.list = this.personListIfy.list
                        .filter(item => item.A0101.indexOf(searchKey) > -1)
                        .map(item => ({
                            text: item.A0101,
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        }));
                }
            },
        },
        loading: false,
        save: () => {
            const list = this.personListIfy.list.filter(row => !!row.check);
            if (list.length === 0) {
                this.message.warning('未选择办理人员。');
                return;
            }
            // if (this.commonService.formVerify(this.causeChangeEditAllIfy.form)) {
            //     const params: any = {
            //         jobId: this.jobStepInfo.jobId,
            //         jobStepId: this.jobStepInfo.jobStepId,
            //         jobDataId: this.jobStepInfo.jobDataId,
            //         changeType: WfDataChangeTypeEnum.MODIFY,
            //         tableId: `${this.tableHelper.getTableCode('GZ02')}`,
            //         data: this.causeChangeEditAllIfy.form.getRawValue(),
            //     };
            //     const paramsArr = list.map(row => {
            //         params.keyId = row[`${this.tableHelper.getTableCode('A01')}_ID`];
            //         params.childId = row.NewGZ02Id;
            //         return { ...params };
            //     });
            //     this.workflowService.saveMultipleTableData(paramsArr).subscribe(() => {
            //         this.causeChangeEditAllIfy.close();
            //         // this.loadPersonTable();
            //     });
            // }
        },
    };
    @ViewChild('personCheck', { static: false })
    personCheck: PersonCheckComponent;

    /**
     * 人员信息
     */
    personalInfo = {
        isAllCheck: false,
        personCheckList: [],
        check: (status = false) => {
            this.personalInfo.isAllCheck = status;
            if (status) {
                this.personalInfo.personCheckList = this.personListIfy.list;
            } else {
                this.personalInfo.personCheckList = [this.personListIfy.selectPerson];
            }
            this.personCheck.show();
        },
        personAllDatas: <any>null,
        /**
         * 获取业务信息
         */
        evtAllData: async () => {
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [this.personListIfy.selectPerson?.keyId],
            };

            // if (this.personalInfo.personAllDatas) {
            //     this.personalInfo.bindValue();
            //     return;
            // }
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
            const item = this.interfaceSchemeIfy.selectedTable;
            this.personalInfo.personAllDatas = result;

            if (
                item &&
                item.systemSchemeTable.TABLE_CODE !== this.tableHelper.getTableCode('A01') &&
                result[item.systemSchemeTable.TABLE_CODE]
            ) {
                // item.tableData = result[item.systemSchemeTable.TABLE_CODE].filter(
                //     v =>
                //         v[item.systemSchemeTable.TABLE_CODE + '_A01_ID'] ===
                //         this.personListIfy.selectPerson.keyId
                // );

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
                    // const person = this.personalInfo.personAllDatas[
                    //     this.tableHelper.getTableCode('A01')
                    // ].find(v => v.keyId === this.personListIfy.selectPerson.keyId);

                    // 主集绑定
                    const person =
                        this.personalInfo.personAllDatas[this.tableHelper.getTableCode('A01')][0];
                    this.interfaceSchemeIfy.selectedTable.editForm.reset(person);
                    this.interfaceSchemeIfy.selectedTable.formData = person;
                    this.cropperPictureIfy.perosnPicture();
                } else {
                    // 子集绑定
                    // const person = this.personalInfo.personAllDatas[tableId].filter(
                    //     v => v[tableId + '_A01_ID'] === this.personListIfy.selectPerson.keyId
                    // );

                    // 子集绑定
                    const person = this.personalInfo.personAllDatas[tableId];
                    this.interfaceSchemeIfy.selectedTable.tableData = person;
                    this.interfaceSchemeIfy.selectedTable.tableData = [
                        ...this.interfaceSchemeIfy.selectedTable.tableData,
                    ];
                }
            }
        },

        upload: () => {
            this.uploadLrmxIfy.open();
        },
    };

    /**
     * lrmx文件导入
     */
    uploadLrmxIfy = {
        // 抽屉内容
        width: 580,
        visible: false,
        title: 'Lrmx文件导入',
        close: () => {
            this.uploadLrmxIfy.visible = false;
        },
        open: () => {
            this.uploadLrmxIfy.visible = true;
        },
        evtImportCustomRequest: async (item: NzUploadXHRArgs) => {
            const _loadingExcel = this.loading.show();
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);
            formData.append('jobId', this.jobStepInfo.jobId);
            formData.append('jobDataId', this.jobStepInfo.jobDataId);
            formData.append('jobStepId', this.jobStepInfo.jobStepId);
            formData.append('b01Id', this.jobStepInfo.startOrgId);
            const result = await this.service.importlrmx(formData);
            _loadingExcel.close();
            if (result.code === 0) {
                if (result.data.isSucc) {
                    this.personalInfo.personAllDatas = null;
                    this.personListIfy._loadPersonList();
                    this.uploadLrmxIfy.close();
                }
            }
        },
    };

    @ViewChild('inputEditElement', { static: false }) inputEditElement: ViewChild;
    @ViewChild('chileTableElement', { static: false }) chileTableElement: ViewChild;
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
        _load: () => {
            if (this.interfaceSchemeIfy.result) {
                return;
            }
            // this.service.wfId
            this.commonService.getSchemeContent('gl_1004_gwygz_psn_init').subscribe(result => {
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

                    // 填写身份证号自动填写性别
                    item.editForm
                        .get('A0184')
                        .valueChanges.pipe(
                            filter(value => !!value),
                            distinctUntilChanged(),
                            debounceTime(1000)
                        )
                        .subscribe(value => {
                            const A0107 = item.editForm.get('A0107').value;
                            if (!A0107 && this.workflowService.reg.IDCardReg.test(value)) {
                                const cardInfo =
                                    this.interfaceSchemeIfy.idCardToDateAndGender(value);
                                item.editForm.patchValue(cardInfo);
                            }
                        });
                    item.elTemp = this.inputEditElement;

                    item.editForm.patchValue(item.formData);
                } else {
                    item.elTemp = this.chileTableElement;
                }
            }
            // this.interfaceSchemeIfy.disableForm();
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
         * 校验身份证
         */
        checkPersonId: async value => {
            // const data = <any>{
            //     A0184: value.A0184,
            // };
            // if (this.personListIfy.selectPerson) {
            //     data.DATA_8001_PERSON_A01_ID = this.personListIfy.selectPerson.keyId;
            // }
            // const checkResult = await this.service.checkPersonIdCard(data);
            // if (checkResult) {
            //     this.message.warning('身份证号码重复!');
            // }
            // return checkResult;
            return false;
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
                    // this.interfaceSchemeIfy.selectedTable.formData;
                    if (!this.personListIfy.selectPerson) {
                        this.personListIfy._loadPersonList();
                    }
                    if (param.changeType === 1) {
                        const index = this.personListIfy.list.findIndex(
                            v => v.keyId === result.keyId
                        );
                        this.personListIfy.list[index].text = data.A0101;
                    }
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
                const { editForm, systemSchemeTable, formData } =
                    this.interfaceSchemeIfy.selectedTable;
                if (this.commonService.formVerify(editForm)) {
                    const _loading = this.loading.show();
                    const data = editForm.getRawValue();
                    const key = `${systemSchemeTable.TABLE_CODE}_ID`;
                    const tableId =
                        this.interfaceSchemeIfy.result.systemSchemeList[
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
    /**
     * 批量上传照片
     */
    batchPhoto = {
        visible: false,
        open: () => {
            this.batchPhoto.visible = true;
        },
        close: () => {
            this.batchPhoto.visible = false;
        },
        ruleData: [
            '批量上传的照片名称命名规则为：姓名+身份证号,如：演示+110101198001010053。',
            '照片尺寸大小最好1寸，照片大小最好控制在0-4M以内。',
            '照片文件夹需要压缩，压缩格式为.zip。',
            '批量照片上传只需要上传压缩后的zip文件。',
        ],

        resultData: [],
        loading: false,
        photofileCustomRequest: async (item: NzUploadXHRArgs) => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);
            const data = await this.service.batchFile(formData);
            if (data) {
                const batchSavePhotos: any = await this.service.batchSavePhoto({
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    list: data,
                });
                this.batchPhoto.resultData = batchSavePhotos;
                this.personalInfo.personAllDatas = null;
                await this.personalInfo.evtAllData();
                this.cropperPictureIfy.perosnPicture();
            }
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
            const tempData =
                this.personalInfo.personAllDatas[this.tableHelper.getTableCode('A01B')];
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
        /**
         * 人员照片设置
         */
        perosnPicture: () => {
            if (!this.personalInfo.personAllDatas[this.tableHelper.getTableCode('A01B')]) {
                this.personListIfy.selectedImg = null;
                return;
            }
            // const [A01B] = this.personalInfo.personAllDatas[
            //     this.tableHelper.getTableCode('A01B')
            // ].filter(
            //     v =>
            //         v[`${this.tableHelper.getTableCode('A01B')}_A01_ID`] ===
            //             this.personListIfy.selectPerson.keyId && v.IS_LAST_ROW
            // );

            const [A01B] = this.personalInfo.personAllDatas[
                this.tableHelper.getTableCode('A01B')
            ].filter(v => v.IS_LAST_ROW);

            this.personListIfy.selectedImg = A01B
                ? this.commonService.getOpenPhotoURL(A01B.A01BPATH)
                : null;
        },
    };
    /**
     * 调整子集顺序
     */
    @ViewChild('adjustElement', { static: false })
    adjustElement: AdjustChildOrderComponent;
    adjustChild = {
        tableData: [],
        tableHeaderList: [],
        tableCode: '',
        open: () => {
            this.adjustChild.tableCode =
                this.interfaceSchemeIfy.selectedTable.systemSchemeTable.TABLE_CODE;
            this.adjustChild.tableData = this.interfaceSchemeIfy.selectedTable.tableData;
            this.adjustChild.tableHeaderList =
                this.interfaceSchemeIfy.selectedTable.systemSchemeHeader;
            this.adjustElement.show();
        },
        change: data => {
            this.interfaceSchemeIfy.selectedTable.tableData = data;
            // this.personInfoIfy.table.rows = data;
        },
    };

    @ViewChild('OperFileView') _OperFileView: TibetPersonEnterFileComponent;

    /** 导入人员 */
    importIfy = {
        visible: false,
        width: 400,
        title: '系统内添加人员',
        open: () => {
            this.importIfy.visible = true;
        },
        close: () => {
            this.importIfy.visible = false;
        },

        current: null,

        find: {
            value: null,
            searchKey$: new Subject<string>(),
            list: [],
            evtSearch: (value: string) => {
                this.importIfy.find.searchKey$.next(value.trim());
            },

            evtOptionChange: event => {
                const option = this.importIfy.find.list.find(x => x.keyId === event);
                this.importIfy.current = option;
                this.importIfy.form.reset(option);
            },
        },

        form: new FormGroup({
            A0101: new FormControl({ value: null, disabled: true }),
            A0103_CN: new FormControl({ value: null, disabled: true }),
            A0104_CN: new FormControl({ value: null, disabled: true }),
        }),
        save: () => {
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                dbType: DbTypeEnum.PERSON,
                wheres: [
                    {
                        fieldId: 'keyId',
                        operator: 'in',
                        value: [this.importIfy.current.keyId],
                    },
                ],
            };
            const _loading = this.loading.show();
            this.workflowService.importPerson(this.jobStepInfo.wfId, params).subscribe(json => {
                _loading.close();
                if (json.code === 0) {
                    this.personListIfy.evtChange();
                    this.importIfy.close();
                }
            });
        },
    };

    constructor(
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private commonService: CommonService,
        private message: NzMessageService,
        private loading: LoadingService,
        private tableHelper: WfTableHelper,
        private service: TibetPersonEnterService
    ) { }

    ngOnInit() {
        this.importIfy.find.searchKey$
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(keyword => {
                const param = {
                    A0184: keyword,
                };
                this.service.getPersonData(param).subscribe(res => {
                    this.importIfy.find.list = res.map(x => {
                        return {
                            ...x,
                            title: x.A0101,
                            keyId: x[this.tableHelper.getTableCode('A01') + '_ID'],
                        };
                    });
                });
            });
        this.interfaceSchemeIfy._load();
    }

    ngAfterViewInit() { }

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }

    showFile() {
        if (!this.personListIfy.selectPerson) {
            return this.message.warning('请先选择人员！');
        }
        const keyId = this.personListIfy.selectPerson?.keyId;
        this._OperFileView.show(keyId);
    }
}
