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
import { Base64 } from 'js-base64';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { SalaryGzda07JbtDrawerComponent } from 'app/components/salary-gzda07-jbt/salary-gzda07-jbt-drawer/salary-gzda07-jbt-drawer.component';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'rank-table',
    templateUrl: './rank-table.component.html',
    styleUrls: ['./rank-table.component.scss'],
})
export class RankTableComponent implements OnInit, AfterViewInit {
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
            this.loadPersonTable();
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    @ViewChild('personTableElement', { static: false }) personTableElement: ElementRef;

    @ViewChild('operSelectPerson', { static: false }) operSelectPerson: OperSelectPersonComponent;

    /**
     * 人员相关
     */
    personSelectIfy = {
        filterParmas: {
            A0151S: ['07', '08'],
        },
        psnKeyIds: <any>[],
        evtSelectPerson: () => {
            this.operSelectPerson.show();
        },
        isChange: null,
        evtChange: () => {
            this.loadPersonTable();
        },
        psnDataChange: data => {
            // 撤选人员参数为keyId，导人参数为数组
            if (typeof data === 'string') {
                // 删除禁选人员中的已撤选人员
                const index = this.personSelectIfy.psnKeyIds.findIndex(keyId => data === keyId);
                this.personSelectIfy.psnKeyIds.splice(index, 1);
                this.personSelectIfy.psnKeyIds = [...this.personSelectIfy.psnKeyIds];
                return;
            }
            this.personSelectIfy.psnKeyIds = [];
            this.personSelectIfy.psnKeyIds = data.map(
                psn => psn[`${this.tableHelper.getTableCode('A01')}_ID`]
            );
        },

        batchEdit: () => {
            this.causeChangeEditAllIfy.open();
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
        width: 620,
        close: () => {
            this.causeChangeEditAllIfy.visible = false;
        },
        open: () => {
            this.causeChangeEditAllIfy._loadEditFields();
            this.causeChangeEditAllIfy.visible = true;
        },
        _loadEditFields: async () => {
            this.personTableIfy.data.forEach(row => (row.check = false));
            if (this.causeChangeEditAllIfy.fields.length > 0) {
                return;
            }
            const scheme = await this.commonService
                .getFieldSchemeConent('sygz_kgjj001')
                .toPromise();
            if (scheme && scheme.systemSchemeEdit) {
                this.causeChangeEditAllIfy.fields = scheme.systemSchemeEdit;
                scheme.systemSchemeEdit.forEach(v => {
                    this.causeChangeEditAllIfy.form.addControl(
                        v.TABLE_COLUMN_CODE,
                        new FormControl(
                            { value: null, disabled: false },
                            [
                                v.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
                                v.SCHEME_EDIT_CHECK_SCRIPT
                                    ? this.commonService.buildValidatorsFn(
                                          v,
                                          v.SCHEME_EDIT_CHECK_SCRIPT,
                                          this.causeChangeEditAllIfy.fields
                                      )
                                    : null,
                            ].filter(s => s)
                        )
                    );
                });
            }
        },
        fields: [],
        form: new FormGroup({}),
        evtGetTempOutParams: () => {
            return {
                formGroup: this.causeChangeEditAllIfy.form,
                fields: this.causeChangeEditAllIfy.fields,
                inline: false,
                formData: {},
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
                this.causeChangeEditAllIfy.find.selectedIndex = this.personTableIfy.data.findIndex(
                    item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === value
                );

                this.scrolleditAllElement.scrollToIndex(
                    this.causeChangeEditAllIfy.find.selectedIndex
                );
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.causeChangeEditAllIfy.find.list = this.personTableIfy.data
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
            const list = this.personTableIfy.data.filter(row => !!row.check);
            if (list.length === 0) {
                this.message.warning('未选择办理人员。');
                return;
            }
            if (this.commonService.formVerify(this.causeChangeEditAllIfy.form)) {
                const params: any = {
                    // keyId: row.DATA_PERSON_A01_ID,
                    // childId: row.NewGZ02Id,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.MODIFY,
                    tableId: `${this.tableHelper.getTableCode('GZ02')}`,
                    data: this.causeChangeEditAllIfy.form.getRawValue(),
                };
                // GZ0201和GZ0232同步
                if (params.data.GZ0204) {
                    params.data.GZ0232 = '020' + params.data.GZ0204;
                    params.data.GZ0226 = '07';
                }
                const paramsArr = list.map(row => {
                    params.keyId = row[`${this.tableHelper.getTableCode('A01')}_ID`];
                    params.childId = row.NewGZ02Id;
                    return { ...params };
                });
                this.workflowService.saveMultipleTableData(paramsArr).subscribe(() => {
                    this.causeChangeEditAllIfy.close();
                    this.loadPersonTable();
                });
            }
        },
    };

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
     * 人员表格
     */
    personTableIfy = {
        find: {
            // 搜索框
            searchWidth: 260,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                if (!value) {
                    this.personTableIfy.selectedRowIndex = -1;
                    return;
                }
                const { pageSize } = this.personTableIfy;
                // 查找位置
                const location = this.personTableIfy.data.findIndex(
                    item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === value
                );
                // 计算位置所在页
                // tslint:disable-next-line:no-bitwise
                this.personTableIfy.pageIndex = ~~(location / pageSize) + 1;

                // 定位选中
                this.personTableIfy.selectedRowIndex = location % pageSize;
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personTableIfy.find.list = this.personTableIfy.data
                        .filter(item => item.A0101.indexOf(searchKey) > -1)
                        .map(item => ({
                            text: item.A0101,
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        }));
                }
            },
        },

        widthConfig: [
            // 变动前
            '40px',
            '100px',
            '80px',

            '40px',
            '100px',
            '100px',
            '120px',
            // '100px',
            '120px', // 职务工资
            '120px', // 级别档次
            '120px', // 级别工资
            '120px', // 津补贴合计
            '120px', // 工资合计

            '80px',
            '60px',
            '80px',

            '60px',

            '40px',
            '40px',
        ],
        scrollConfig: { x: '2600px', y: '440px' },
        headArr: Array(18),
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        loading: false,
        data: [],
        selectedRowIndex: -1,
        evtViewInfo: (event, row) => {
            event.stopPropagation();
            this.viwePersonExcelIfy.row = row;
            this.viwePersonExcelIfy.open();
        },
        /**
         * 撤选人员
         */
        evtDeletePerson: (event, row) => {
            if (!this.canEdit) {
                return;
            }
            event.stopPropagation();
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要撤选吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const data = {
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        keyIds: [row[`${this.tableHelper.getTableCode('A01')}_ID`]],
                    };
                    this.workflowService
                        .deletePerson(this.jobStepInfo.wfId, data)
                        .subscribe(result => {
                            const index = this.personTableIfy.data.findIndex(
                                v =>
                                    v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                    row[`${this.tableHelper.getTableCode('A01')}_ID`]
                            );
                            this.personTableIfy.data.splice(index, 1);
                            this.personTableIfy.data = [...this.personTableIfy.data];
                            this.personSelectIfy.psnDataChange(
                                row[`${this.tableHelper.getTableCode('A01')}_ID`]
                            );
                        });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        /**
         * 计算
         */
        calculation: async data => {
            if (!this.canEdit) {
                return;
            }
            // 数据校验
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [data[`${this.tableHelper.getTableCode('A01')}_ID`]],
            };
            const list = await this.workflowService.dataVerification(params).toPromise();
            if (!list || list.length > 0) {
                this.personTableIfy.loading = false;
                this.dataVerificationIfy.list = list;
                this.dataVerificationIfy.open();
                return;
            }
            const par = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                isAllData: true,
                handlerIds: ['C01'],
                keyIds: [data[`${this.tableHelper.getTableCode('A01')}_ID`]],
            };
            const _loading = this.loading.show('工资计算中...');
            this.workflowService.salaryCivilCalculation(par).subscribe(result => {
                _loading.close();
                if (result) {
                    this.loadPersonTable();
                }
            });
        },
        salaryExecuteAll: async () => {
            if (!this.canEdit) {
                return;
            }

            // 数据校验
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
            };
            const list = await this.workflowService.dataVerification(params).toPromise();
            if (!list || list.length > 0) {
                this.dataVerificationIfy.list = list;
                this.dataVerificationIfy.open();
                return;
            }
            const par = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                isAllData: true,
                handlerIds: ['C01'],
                keyIds: [],
            };
            const _loading = this.loading.show('工资计算中...');
            this.workflowService.salaryCivilCalculation(par).subscribe(result => {
                _loading.close();
                this.personTableIfy.loading = false;
                if (result) {
                    this.loadPersonTable();
                }
            });
        },
        loadSalaryInfo: row => {
            const GL = Base64.encode(
                JSON.stringify({
                    name: escape(row.A0101),
                    keyId: row[`${this.tableHelper.getTableCode('A01')}_ID`],
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    type: 'sy',
                    wfId: this.jobStepInfo.wfId,
                })
            );
            const url = `irregular/oper-salary-info-page;GL=${GL}`;

            window.winOperSalaryInfoDlg = window.open(url, 'salary-Info');
            if (window.winOperSalaryInfoDlg && window.winOperSalaryInfoDlg.closed) {
                window.winOperSalaryInfoDlg.focus();
            }
            // this.router.navigate(['irregularity/oper-salary-info-page', { GL }]);
        },
        selectedKeyId: '',
        salaryGZ07: row => {
            this.personTableIfy.selectedKeyId = row[`${this.tableHelper.getTableCode('A01')}_ID`];
            this.salaryGZ07Element.show();
        },
        causeChange: (event, row) => {
            if (!this.canEdit) {
                return;
            }
            this.causeChangeEditIfy.row = row;
            this.causeChangeEditIfy.open();
        },
        evtLoadJBT: (event, row) => {
            event.stopPropagation();
            this.salaryGZDA07JBTElement.open({
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyId: row[`${this.tableHelper.getTableCode('A01')}_ID`],
            });
        },
    };

    @ViewChild('salaryGZDA07JBTElement') salaryGZDA07JBTElement: SalaryGzda07JbtDrawerComponent;

    /**
     * 编辑字段抽屉
     */
    causeChangeEditIfy = {
        title: '信息修改',
        visible: false,
        width: 400,
        close: () => {
            this.causeChangeEditIfy.visible = false;
        },
        open: () => {
            this.causeChangeEditIfy._loadEditFields();
            this.causeChangeEditIfy.visible = true;
        },
        _loadEditFields: async () => {
            if (this.causeChangeEditIfy.fields.length > 0) {
                // 特殊处理 编辑字段为带NEW的，而界面方式配置的是不带NEW的
                const data = {};
                this.causeChangeEditIfy.fields.forEach(item => {
                    const key = `New${item.TABLE_COLUMN_CODE}`;
                    data[item.TABLE_COLUMN_CODE] = this.causeChangeEditIfy.row[key];
                    if (item.TABLE_COLUMN_DICTIONARY_CODE) {
                        data[`${item.TABLE_COLUMN_CODE}_CN`] = this.causeChangeEditIfy.row[
                            `${key}_CN`
                        ];
                    }
                });
                this.causeChangeEditIfy.data = data;
                this.causeChangeEditIfy.form.reset(data);
                return;
            }
            const scheme = await this.commonService
                .getFieldSchemeConent('sygz_kgjj001')
                .toPromise();
            if (scheme && scheme.systemSchemeEdit) {
                this.causeChangeEditIfy.fields = scheme.systemSchemeEdit;
                scheme.systemSchemeEdit.forEach(v => {
                    this.causeChangeEditIfy.form.addControl(
                        v.TABLE_COLUMN_CODE,
                        new FormControl(
                            { value: null, disabled: false },
                            [
                                v.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
                                v.SCHEME_EDIT_CHECK_SCRIPT
                                    ? this.commonService.buildValidatorsFn(
                                          v,
                                          v.SCHEME_EDIT_CHECK_SCRIPT,
                                          this.causeChangeEditIfy.fields
                                      )
                                    : null,
                            ].filter(s => s)
                        )
                    );
                });
                if (this.causeChangeEditIfy.row) {
                    // 特殊处理 编辑字段为带NEW的，而界面方式配置的是不带NEW的
                    const data = {};
                    this.causeChangeEditIfy.fields.forEach(item => {
                        const key = `New${item.TABLE_COLUMN_CODE}`;
                        data[item.TABLE_COLUMN_CODE] = this.causeChangeEditIfy.row[key];
                        if (item.TABLE_COLUMN_DICTIONARY_CODE) {
                            data[`${item.TABLE_COLUMN_CODE}_CN`] = this.causeChangeEditIfy.row[
                                `${key}_CN`
                            ];
                        }
                    });
                    this.causeChangeEditIfy.data = data;
                    this.causeChangeEditIfy.form.reset(data);
                }
            }
        },
        fields: [],
        form: new FormGroup({}),
        evtGetTempOutParams: () => {
            return {
                formGroup: this.causeChangeEditIfy.form,
                fields: this.causeChangeEditIfy.fields,
                inline: false,
                formData: this.causeChangeEditIfy.data,
            };
        },
        row: null,
        data: null,
        loading: false,
        save: () => {
            if (this.commonService.formVerify(this.causeChangeEditIfy.form)) {
                const row = this.causeChangeEditIfy.row;
                const params = {
                    keyId: row[`${this.tableHelper.getTableCode('A01')}_ID`],
                    childId: row.NewGZ02Id,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    changeType: WfDataChangeTypeEnum.MODIFY,
                    tableId: `${this.tableHelper.getTableCode('GZ02')}`,
                    data: this.causeChangeEditIfy.form.getRawValue(),
                };
                // GZ0226和GZ0232同步
                if (params.data.GZ0204) {
                    params.data.GZ0232 = '020' + params.data.GZ0204;
                    params.data.GZ0226 = '07';
                }
                this.workflowService.saveChangeData(params).subscribe(() => {
                    this.causeChangeEditIfy.close();
                    this.loadPersonTable();
                });
            }
        },
    };

    /**
     * 查看人员表
     */
    viwePersonExcelIfy = {
        title: '人员信息',
        visible: false,
        width: 880,
        close: () => {
            this.viwePersonExcelIfy.visible = false;
        },
        open: () => {
            this.viwePersonExcelIfy._setParams();
            this.viwePersonExcelIfy.visible = true;
        },
        row: null,
        permission: 'wage_change_table001',
        params: null,
        _setParams: () => {
            const { jobId, jobStepId } = this.jobStepInfo;
            // const { DATA_PERSON_A01_ID } = this.viwePersonExcelIfy.row;
            this.viwePersonExcelIfy.params = {
                jobId,
                jobStepId,
                // DATA_PERSON_A01_ID,
            };
            this.viwePersonExcelIfy.params[
                `${this.tableHelper.getTableCode('A01')}_ID`
            ] = this.viwePersonExcelIfy.row[`${this.tableHelper.getTableCode('A01')}_ID`];
        },
    };

    @ViewChild('salaryGZ07Element', { static: false }) salaryGZ07Element: SalaryGz07DrawerComponent;

    /**
     * 数据校验内容显示
     */
    dataVerificationIfy = {
        visible: false,
        width: 500,
        close: () => {
            this.dataVerificationIfy.visible = false;
        },
        open: () => {
            this.dataVerificationIfy.visible = true;
        },

        list: [],
    };

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     *上传附件
     */
    uploaddrawerify = {
        visible: false,
        width: 400,
        currentPerson: null,
        selectIndex: -1,
        open: (data, i) => {
            this.uploaddrawerify.currentPerson = data;
            this.uploaddrawerify.selectIndex = i;
            this.uploaddrawerify.visible = true;
            this.uploaddrawerify.uploadIfy.getPersonFileList(data);
        },
        close: () => {
            this.uploaddrawerify.visible = false;
        },
        /**
         * 文件上传
         */
        uploadIfy: {
            selectedIndex: 0,
            fileCustomRequest: item => {
                const formData = new FormData();
                formData.append('file', item.file);
                this.commonService.fileUpload(formData).subscribe(result => {
                    result.url = result.filePath = `${this.commonService.getOpenFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    const fileObj = Object.assign(item.file, result);
                    fileObj.operFiles = result;
                    this.uploaddrawerify.uploadIfy.savePersonAnnex(fileObj);
                });
            },

            /**
             * 删除文件-静态删除
             */
            fileRemove: file => {
                const _index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.deletePersonFile(
                    this.uploaddrawerify.uploadIfy.list[_index]
                );
                this.uploaddrawerify.uploadIfy.list.splice(_index, 1);
                this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                this.personTableIfy.data[this.uploaddrawerify.selectIndex].AnnexCount -= 1;
                this.personTableIfy.data = [...this.personTableIfy.data];
                return true;
            },
            preview: file => {
                const _index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.selectedIndex = _index;
                this.onlineDocOverlayElement.show();
                return false;
            },
            /**
             * 保存人员附件
             */
            savePersonAnnex: file => {
                const params = Object.assign(file.operFiles, {
                    jobDataId: this.jobStepInfo.jobDataId,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    keyId: this.uploaddrawerify.currentPerson[
                        `${this.tableHelper.getTableCode('A01')}_ID`
                    ],
                });

                this.workflowService.savePersonAnnex(params).subscribe(() => {
                    const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                        file.fileType
                    );
                    this.uploaddrawerify.uploadIfy.list.push({
                        thumbUrl,
                        ...file,
                        name: file.fileName,
                    });
                    this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                    this.personTableIfy.data[this.uploaddrawerify.selectIndex].AnnexCount += 1;
                    this.personTableIfy.data = [...this.personTableIfy.data];
                });
            },
            /**
             * 查询人员附件
             */
            getPersonFileList: event => {
                const data = {
                    keyId: event[`${this.tableHelper.getTableCode('A01')}_ID`],
                    jobId: this.jobStepInfo.jobId,
                };
                this.workflowService.getPersonFileList(data).subscribe(result => {
                    this.uploaddrawerify.uploadIfy.list = result.map(file => {
                        const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                            file.fileType
                        );
                        return {
                            ...file,
                            operFiles: file,
                            name: file.fileName,
                            url: `${this.commonService.getDownFileURL(file.fileId, file.fileName)}`,
                            thumbUrl,
                        };
                    });
                });
            },
            /**
             * 删除附件--数据库删除
             */
            deletePersonFile: data => {
                this.workflowService.deletePersonFile(data.operFiles.id).subscribe();
            },
            list: [],
        },
    };

    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private commonService: CommonService,
        private router: Router,
        private message: NzMessageService,
        private loading: LoadingService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {
        // 计算表格虚拟滚动宽高
        // fromEvent(window, 'resize')
        //     .pipe(debounceTime(300))
        //     .subscribe(() => {
        //         this.computePersonTableXY();
        //     });
        const objResizeObserver = new window['ResizeObserver'](entries => {
            // const [entry] = entries;
            // const cr = entry.contentRect;
            // const target = entry.target;
            this.computePersonTableXY();
        });
        // 观察文本域元素
        objResizeObserver.observe(this.personTableElement.nativeElement);

        setTimeout(() => {
            this.computePersonTableXY();
        }, 500);
    }

    /**
     * 计算表格虚拟滚动宽高
     */
    computePersonTableXY() {
        const width = this.personTableIfy.widthConfig
            // tslint:disable-next-line:radix
            .map(v => parseInt(v))
            .reduce((accumulator, currentValue) => accumulator + currentValue);
        const el = this.personTableElement.nativeElement;

        const height = el.offsetHeight - 160; // - 上边距 - 下边距 - 表头高度 - 分页 - 底部总人数
        this.personTableIfy.scrollConfig = { x: `${width}px`, y: `${height}px` };
        this.cdr.detectChanges();
    }

    private loadPersonTable() {
        const data = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
        };
        this.workflowService.getWfListData(data).subscribe(result => {
            this.personTableIfy.data = result;
            this.personSelectIfy.psnDataChange(result);
        });
    }

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }
}
