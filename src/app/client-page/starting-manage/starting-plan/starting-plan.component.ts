import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { StartingPlanService } from './starting-plan.service';
import { CommonService } from 'app/util/common.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { ClientService } from 'app/master-page/client/client.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { WorkflowService } from 'app/workflow/workflow.service';
import { Base64 } from 'js-base64';

@Component({
    selector: 'gl-starting-plan',
    templateUrl: './starting-plan.component.html',
    styleUrls: ['./starting-plan.component.scss'],
})
export class StartingPlanComponent implements OnInit {
    columnType = ColumnTypeEnum;

    /**
     * 计划头部操作
     */
    planHandleIfy = {
        year: new Date(),
        yearChange: () => {
            this.startingPlanIfy.selectChange({ index: 0 });
        },
        addPlan: () => {
            this.startingPlanEditIfy.open();
        },
    };

    /**
     * 考录计划相关
     */
    startingPlanIfy = {
        list: [],
        value: 0,
        selectChange: ({ index }) => {
            switch (index) {
                case 0:
                    this.startingPlanIfy.value = 0;
                    break;
                case 1:
                    this.startingPlanIfy.value = 1;
                    break;
                case 2:
                    break;
            }
            this.startingPlanIfy.loadList();
        },
        loadList: () => {
            const params = {
                PLAN02: this.planHandleIfy.year.getFullYear(),
                PLAN05: this.startingPlanIfy.value,
            };
            this.service.selectListByYear(params).subscribe(result => {
                this.startingPlanIfy.list = result;
                const [first] = result;
                // this.startingPlanIfy.selectedItem = first;

                this.startingPlanIfy.evtSelected(first);
            });
        },
        selectedItem: null,
        evtSelected: item => {
            this.startingPlanIfy.selectedItem = item;
            this.planTableIfy.loadPlanTable();
        },
        /**
         * 归档
         */
        evtArchives: item => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要归档当前计划吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const data = {
                        DATA_3001_OTHER_PLAN_ID: item.DATA_3001_OTHER_PLAN_ID,
                        PLAN05: 1,
                    };
                    this.service.archives(data).subscribe(result => {
                        console.log(result);
                        const index = this.startingPlanIfy.list.findIndex(
                            v => v.DATA_3001_OTHER_PLAN_ID === item.DATA_3001_OTHER_PLAN_ID
                        );
                        this.startingPlanIfy.list.splice(index, 1);
                    });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
    };
    /**
     * 表格数据
     */
    planTableIfy = {
        /**
         * 搜索框
         */
        selectList: [],
        evtSearch: value => {
            console.log(value);
            // this.planTable.planTableData.filter(v=>v.)
        },
        evtChange: value => {
            console.log(value);
        },
        pageIndex: 1,
        pageSize: 10,
        selectIndex: -1,
        planTableData: [],
        loadPlanTable: () => {
            const data = {
                state: 0,
                planId: this.startingPlanIfy.selectedItem.DATA_3001_OTHER_PLAN_ID,
            };
            this.service.loadPlanTable(data).subscribe(result => {
                this.planTableIfy.planTableData = result;
            });
        },
        // 统计
        getCount: (itemKey) => {
            let num = 0;
            this.planTableIfy.planTableData.forEach(x => num += x[itemKey]);

            return num;
        }
    };

    /**
     * 计划信息编辑
     */
    startingPlanEditIfy = {
        // 抽屉内容
        width: 420,
        visible: false,
        title: '计划信息',
        close: () => {
            this.startingPlanEditIfy.isEdit = false;
            this.startingPlanEditIfy.visible = false;
        },
        open: () => {
            this.startingPlanEditIfy.loadFields();
            this.startingPlanEditIfy.visible = true;
        },

        permission: 'starting_plan_edit',
        fields: [],
        loadFields: () => {
            if (this.startingPlanEditIfy.fields.length > 0) {
                return;
            }
            this.commonService
                .getFieldSchemeConent(this.startingPlanEditIfy.permission)
                .subscribe(result => {
                    this.startingPlanEditIfy.fields = result.systemSchemeEdit;
                    result.systemSchemeEdit.forEach(v => {
                        this.startingPlanEditIfy.form.addControl(
                            v.TABLE_COLUMN_CODE,
                            new FormControl(
                                { value: null, disabled: false },
                                [
                                    v.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
                                    v.SCHEME_EDIT_CHECK_SCRIPT
                                        ? this.commonService.buildValidatorsFn(
                                              v,
                                              v.SCHEME_EDIT_CHECK_SCRIPT
                                          )
                                        : null,
                                ].filter(s => s)
                            )
                        );
                    });
                    if (this.startingPlanEditIfy.isEdit) {
                        this.startingPlanEditIfy.form.reset(this.startingPlanIfy.selectedItem);
                    }
                });
        },
        form: new FormGroup({}),
        evtGetTempOutParams: () => {
            return {
                formGroup: this.startingPlanEditIfy.form,
                fields: this.startingPlanEditIfy.fields,
                inline: false,
                formData: {},
            };
        },

        isEdit: false,
        edit: () => {
            this.startingPlanEditIfy.isEdit = true;
            this.startingPlanEditIfy.form.reset(this.startingPlanIfy.selectedItem);
            this.startingPlanEditIfy.open();
        },
        save: () => {
            if (this.commonService.formVerify(this.startingPlanEditIfy.form)) {
                const data = this.startingPlanEditIfy.form.getRawValue();
                // 计划状态默认
                data.PLAN05 = 0;
                if (this.startingPlanEditIfy.isEdit) {
                    data.DATA_3001_OTHER_PLAN_ID = this.startingPlanIfy.selectedItem.DATA_3001_OTHER_PLAN_ID;
                    this.service.updatePlanData(data).subscribe(result => {
                        const index = this.startingPlanIfy.list.findIndex(
                            item => item.DATA_3001_OTHER_PLAN_ID === result.DATA_3001_OTHER_PLAN_ID
                        );
                        this.startingPlanIfy.list[index] = result;
                        this.startingPlanIfy.selectedItem = result;
                        this.startingPlanEditIfy.close();
                    });
                    return;
                }
                this.service.insertPlanData(data).subscribe(result => {
                    this.startingPlanIfy.list.push(result);
                    this.startingPlanEditIfy.close();
                });
            }
        },
    };
    constructor(
        private service: StartingPlanService,
        private commonService: CommonService,
        private clientService: ClientService,

        private modalService: NzModalService,

        private workflowService: WorkflowService,
        private loading: LoadingService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '计划管理',
            },
        ]);
        this.planHandleIfy.yearChange();
    }

    /**  导出表格 */
    exportTable() {
        const url = 'api/gl-1004-workflow-tibet/v1/workflow/tibet/plan/apply/job/outputExcel';
        const param =  {
            state: 0,
            planId: this.startingPlanIfy.selectedItem.DATA_3001_OTHER_PLAN_ID,
        };
        this.commonService.downFilePost(url, param, '表格数据.xls');
    }

    /**
     *跳转路由
     */
    async jumpOper(row) {
        let job = row;
        if (row.jobStepState === JobStepStateEnum.PENDING) {
            const _loading = this.loading.show();

            job = await this.workflowService
                .process(row.wfId, {
                    jobId: row.jobId,
                    jobStepId: row.jobStepId,
                })
                .toPromise();
            _loading.close();
        }

        const url = `client/workflow/factory/${job.wfId}/${job.stepId || ''}`;
        const params = <any>{
            ...job,
            redirect: this.router.url,
        };
        if (!params.hasOwnProperty('jobStepState')) {
            params.jobStepState = JobStepStateEnum.PROCESSING;
        }
        const GL = Base64.encode(JSON.stringify(params));
        this.router.navigate([url], { queryParams: { GL } });
    }
}
