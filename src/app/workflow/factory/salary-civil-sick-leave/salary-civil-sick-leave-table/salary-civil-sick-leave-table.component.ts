import { Router } from '@angular/router';
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
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';

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
import { CameraCZURComponent } from 'app/components/camera-czur/camera-czur.component';
import { SalaryCivilSickLeaveService } from '../salary-civil-sick-leave.service';
@Component({
    selector: 'gl-salary-civil-sick-leave-table',
    templateUrl: './salary-civil-sick-leave-table.component.html',
    styleUrls: ['./salary-civil-sick-leave-table.component.scss'],
})
export class SalaryCivilSickLeaveTableComponent implements OnInit, AfterViewInit {
    isFullScreen = false;
    columnType = ColumnTypeEnum;
    canEdit = false;
    /**
     * ????????????
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
     * ????????????
     */
    personSelectIfy = {
        filterParmas: {
            A0151S: ['01', '02', '03', '04'],
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
            // ?????????????????????keyId????????????????????????
            if (typeof data === 'string') {
                // ???????????????????????????????????????
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
     * ??????????????????
     */
    causeChangeEditAllIfy = {
        title: '????????????',
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
                .getFieldSchemeConent('zwbdgzyw_gwy01')
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
            // ?????????
            searchWidth: 200,
            placeholder: '?????????????????????',
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
                // ????????????
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
                this.message.warning('????????????????????????');
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
                // GZ0201???GZ0232??????
                if (params.data.GZ0201) {
                    params.data.GZ0232 = '01' + params.data.GZ0201;
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
     * ???????????????
     */
    flowChart = {
        visible: false,
        title: '???????????????',
        height: 220,
        close: () => (this.flowChart.visible = false),
        open: () => {
            this.flowChart.visible = true;
            // ??????????????????
            this.flowChart.loadOperStepData();
        },
        /**
         * ??????????????????
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
         * ??????????????????
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
     * ????????????-????????????
     */
    tailAfterOper = {
        title: '????????????',
        width: 480,
        visible: false,
        close: () => (this.tailAfterOper.visible = false),
        open: () => {
            this.tailAfterOper.visible = true;
            // ?????????????????????????????????
            this.tailAfterOper.loadTailAfterList();
        },
        /*
         * ????????????
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
     * ????????????
     */
    personTableIfy = {
        find: {
            // ?????????
            searchWidth: 260,
            placeholder: '?????????????????????',
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
                // ????????????
                const location = this.personTableIfy.data.findIndex(
                    item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === value
                );
                // ?????????????????????
                // tslint:disable-next-line:no-bitwise
                this.personTableIfy.pageIndex = ~~(location / pageSize) + 1;

                // ????????????
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
            // ?????????
            '40px',
            '100px',
            '80px',
            '40px',

            '100px', //?????????
            '120px', //????????????
            '120px', // ????????????
            '120px', // ????????????
            '120px', // ????????????
            '120px', // ???????????????
            '120px', // ????????????

            '80px',
            '60px',
            '80px',

            '60px',

            '40px',
            '40px',
        ],
        scrollConfig: { x: '2600px', y: '440px' },
        headArr: Array(17),
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
         * ????????????
         */
        evtDeletePerson: (event, row) => {
            if (!this.canEdit) {
                return;
            }
            event.stopPropagation();
            this.modalService.confirm({
                nzTitle: '?????????????',
                nzContent: `<b style="color: red;">?????????????????????</b>`,
                nzOkText: '??????',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const data = {
                        jobId: this.jobStepInfo.jobId,
                        jobStepId: this.jobStepInfo.jobStepId,
                        keyIds: [],
                    };
                    data.keyIds.push(row[`${this.tableHelper.getTableCode('A01')}_ID`]);
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
                nzCancelText: '??????',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        /**
         * ??????
         */
        calculation: async data => {
            if (!this.canEdit) {
                return;
            }
            // ????????????
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [],
            };
            params.keyIds.push(data[`${this.tableHelper.getTableCode('A01')}_ID`]);
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
                handlerIds: ['K01'],
                keyIds: [],
            };
            par.keyIds.push(data[`${this.tableHelper.getTableCode('A01')}_ID`]);
            const _loading = this.loading.show('???????????????...');
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

            // ????????????
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
                handlerIds: ['K01'],
                keyIds: [],
            };
            const _loading = this.loading.show('???????????????...');
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
                    wfId: this.jobStepInfo.wfId,
                })
            );
            const url = `irregular/oper-salary-info-page`;

            window.winOperSalaryInfoDlg = window.open(`${url};GL=${GL}`, 'salary-Info');
            if (window.winOperSalaryInfoDlg && window.winOperSalaryInfoDlg.closed) {
                window.winOperSalaryInfoDlg.focus();
            }
            // this.router.navigate([url, { GL }]);
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
     * ??????????????????
     */
    causeChangeEditIfy = {
        title: '????????????',
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
                // ???????????? ??????????????????NEW???????????????????????????????????????NEW???
                const data = {};
                this.causeChangeEditIfy.fields.forEach(item => {
                    const key = `New${item.TABLE_COLUMN_CODE}`;
                    data[item.TABLE_COLUMN_CODE] = this.causeChangeEditIfy.row[key];
                    if (item.TABLE_COLUMN_DICTIONARY_CODE) {
                        data[`${item.TABLE_COLUMN_CODE}_CN`] =
                            this.causeChangeEditIfy.row[`${key}_CN`];
                    }
                });
                this.causeChangeEditIfy.data = data;
                this.causeChangeEditIfy.form.reset(data);
                return;
            }
            const scheme = await this.commonService
                .getFieldSchemeConent('zwbdgzyw_gwy01')
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
                    // ???????????? ??????????????????NEW???????????????????????????????????????NEW???
                    const data = {};
                    this.causeChangeEditIfy.fields.forEach(item => {
                        const key = `New${item.TABLE_COLUMN_CODE}`;
                        data[item.TABLE_COLUMN_CODE] = this.causeChangeEditIfy.row[key];
                        if (item.TABLE_COLUMN_DICTIONARY_CODE) {
                            data[`${item.TABLE_COLUMN_CODE}_CN`] =
                                this.causeChangeEditIfy.row[`${key}_CN`];
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
                // GZ0201???GZ0232??????
                if (params.data.GZ0201) {
                    params.data.GZ0232 = '01' + params.data.GZ0201;
                }
                this.workflowService.saveChangeData(params).subscribe(() => {
                    this.causeChangeEditIfy.close();
                    this.loadPersonTable();
                });
            }
        },
    };

    /**
     * ???????????????
     */
    viwePersonExcelIfy = {
        title: '????????????',
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
            this.viwePersonExcelIfy.params[`${this.tableHelper.getTableCode('A01')}_ID`] =
                this.viwePersonExcelIfy.row[`${this.tableHelper.getTableCode('A01')}_ID`];
        },
    };

    @ViewChild('salaryGZ07Element', { static: false }) salaryGZ07Element: SalaryGz07DrawerComponent;

    /**
     * ????????????????????????
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
    /**
     * ???????????????
     */
    sickLeave = {
        visible: false,
        radioValue: '0',
        loading: false,
        currentPerson: null,
        open: async data => {
            this.sickLeave.currentPerson = data;
            this.sickLeave.visible = true;
            this.sickLeave.form.reset();

            await this.sickLeave.getGZ49(data);
            if (this.sickLeave.personGZ49.changeState === 0 && this.sickLeave.radioValue === '0') {
                this.sickLeave.form.reset(this.sickLeave.personGZ49);
                this.sickLeave.formData = this.sickLeave.personGZ49;
            } else {
                this.sickLeave.formData = {};
            }
        },
        close: () => {
            this.sickLeave.visible = false;
        },
        cancel: () => {
            if (this.sickLeave.isDisabled) {
                this.message.warning('????????????????????????????????????!');
            }
        },
        isDisabled: false,
        ngModelChange: () => {
            this.sickLeave.form.reset();
            if (this.sickLeave.personGZ49.changeState === 0 && this.sickLeave.radioValue === '0') {
                this.sickLeave.form.patchValue(this.sickLeave.personGZ49);
                this.sickLeave.formData = this.sickLeave.personGZ49;
            } else {
                this.sickLeave.formData = {};
            }
            const verifyFields = ['GZ4902'];
            const verifyFields2 = ['GZ4901', 'GZ4903', 'GZ4905'];
            verifyFields.forEach(field => {
                const control: AbstractControl = this.sickLeave.form.get(field);
                if (this.sickLeave.radioValue === '1') {
                    control.setValidators(Validators.required);
                } else {
                    control.setValue(null);
                    control.clearValidators();
                }
            });
            verifyFields2.forEach(field => {
                const control: AbstractControl = this.sickLeave.form.get(field);
                if (this.sickLeave.radioValue === '0') {
                    control.setValidators(Validators.required);
                } else {
                    control.setValue(null);
                    control.clearValidators();
                }
            });
        },
        form: new FormGroup({
            GZ4901: new FormControl(null, Validators.required),
            GZ4903: new FormControl(null, Validators.required),
            GZ4904: new FormControl(null),
            GZ4905: new FormControl(null, Validators.required),
            GZ4906: new FormControl(null),
            GZ4907: new FormControl(null),
            GZ4902: new FormControl(null),
        }),
        formData: {},
        save: () => {
            if (!this.workflowService.formVerify(this.sickLeave.form)) {
                return;
            }
            this.sickLeave.loading = true;
            let value = {};
            for (const key in this.sickLeave.form.value) {
                if (this.sickLeave.form.value[key]) {
                    value[key] = this.sickLeave.form.value[key];
                }
            }
            const data = {
                keyId: this.sickLeave.currentPerson[`${this.tableHelper.getTableCode('A01')}_ID`],
                childId: this.sickLeave.personGZ49[`${this.tableHelper.getTableCode('GZ49')}_ID`],
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                jobDataId: this.jobStepInfo.jobDataId,
                changeType:
                    this.sickLeave.personGZ49.changeState === 0
                        ? WfDataChangeTypeEnum.MODIFY
                        : WfDataChangeTypeEnum.MODIFY,

                tableId: this.tableHelper.getTableCode('GZ49'),
                data: value,
            };
            if (this.sickLeave.radioValue === '0') {
                data.changeType =
                    this.sickLeave.personGZ49.changeState === 0
                        ? WfDataChangeTypeEnum.MODIFY
                        : WfDataChangeTypeEnum.ADD;
                data.childId = !data.changeType
                    ? '-1'
                    : this.sickLeave.personGZ49[`${this.tableHelper.getTableCode('GZ49')}_ID`];
            } else {
                data.changeType = WfDataChangeTypeEnum.MODIFY;
                data.childId =
                    this.sickLeave.personGZ49[`${this.tableHelper.getTableCode('GZ49')}_ID`];
            }
            this.workflowService.saveChangeData(data).subscribe(result => {
                this.sickLeave.loading = false;
                this.sickLeave.getGZ49(this.sickLeave.currentPerson);
                this.loadPersonTable();
            });
        },
        personGZ49: <any>{},
        getGZ49: async data => {
            const parmars = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                keyIds: [data[`${this.tableHelper.getTableCode('A01')}_ID`]],
                childFields: {
                    [this.tableHelper.getTableCode('GZ49')]: [],
                },
            };
            this.sickLeave.isDisabled = false;
            const result = await this.workflowService
                .getPsnList(this.service.wfId, parmars)
                .toPromise();
            if (
                result[this.tableHelper.getTableCode('GZ49')] &&
                result[this.tableHelper.getTableCode('GZ49')].length > 0
            ) {
                this.sickLeave.personGZ49 = result[this.tableHelper.getTableCode('GZ49')].find(
                    v => v.IS_LAST_ROW
                );
            } else {
                this.sickLeave.personGZ49 = {};
                this.sickLeave.isDisabled = true;
                this.sickLeave.radioValue = '0';
            }
        },
    };
    @ViewChild('cameraCZURElement') cameraCZURElement: CameraCZURComponent;
    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     *????????????
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
        camera: () => {
            this.cameraCZURElement.show();
        },
        takedChange: event => {
            this.commonService.fileUpload(event).subscribe(result => {
                result.filePath = `${this.commonService.getOpenFileURL(
                    result.fileId,
                    result.fileName
                )}`;
                this.uploaddrawerify.uploadIfy.savePersonAnnex(result);
            });
        },
        /**
         * ????????????
         */
        uploadIfy: {
            selectedIndex: 0,
            fileCustomRequest: item => {
                const formData = new FormData();
                formData.append('file', item.file);
                this.commonService.fileUpload(formData).subscribe(result => {
                    result.filePath = `${this.commonService.getOpenFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    this.uploaddrawerify.uploadIfy.savePersonAnnex(result);
                });
            },

            /**
             * ????????????-????????????
             */
            fileRemove: file => {
                const index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.deletePersonFile(
                    this.uploaddrawerify.uploadIfy.list[index]
                );
                this.uploaddrawerify.uploadIfy.list.splice(index, 1);
                this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                this.personTableIfy.data[this.uploaddrawerify.selectIndex].AnnexCount -= 1;
                this.personTableIfy.data = [...this.personTableIfy.data];
                return true;
            },
            preview: file => {
                const index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.selectedIndex = index;
                this.onlineDocOverlayElement.show();
                return false;
            },
            /**
             * ??????????????????
             */
            savePersonAnnex: file => {
                const params = {
                    jobDataId: this.jobStepInfo.jobDataId,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    keyId: this.uploaddrawerify.currentPerson[
                        `${this.tableHelper.getTableCode('A01')}_ID`
                    ],
                    ...file,
                };

                this.workflowService.savePersonAnnex(params).subscribe(result => {
                    // ?????????????????????
                    const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                        file.fileType
                    );
                    // ??????URL
                    let url = `${this.commonService.getOpenFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    this.uploaddrawerify.uploadIfy.list.push({
                        ...result,
                        url,
                        thumbUrl,
                        name: file.fileName,
                    });
                    this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                    this.personTableIfy.data[this.uploaddrawerify.selectIndex].AnnexCount += 1;
                    this.personTableIfy.data = [...this.personTableIfy.data];
                });
            },
            /**
             * ??????????????????
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
                            name: file.fileName,
                            url: `${this.commonService.getDownFileURL(file.fileId, file.fileName)}`,
                            thumbUrl,
                        };
                    });
                });
            },
            /**
             * ????????????--???????????????
             */
            deletePersonFile: data => {
                this.workflowService.deletePersonFile(data.id).subscribe();
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
        private tableHelper: WfTableHelper,
        private service: SalaryCivilSickLeaveService
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {
        // ??????????????????????????????
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
        // ?????????????????????
        objResizeObserver.observe(this.personTableElement.nativeElement);

        setTimeout(() => {
            this.computePersonTableXY();
        }, 500);
    }

    /**
     * ??????????????????????????????
     */
    computePersonTableXY() {
        const width = this.personTableIfy.widthConfig
            // tslint:disable-next-line:radix
            .map(v => parseInt(v))
            .reduce((accumulator, currentValue) => accumulator + currentValue);
        const el = this.personTableElement.nativeElement;

        const height = el.offsetHeight - 160; // - ????????? - ????????? - ???????????? - ?????? - ???????????????
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
