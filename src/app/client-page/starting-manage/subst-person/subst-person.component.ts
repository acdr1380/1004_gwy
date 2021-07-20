import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from 'app/components/loading/loading.service';
import { ClientService } from 'app/master-page/client/client.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StartingPlanService } from '../starting-plan/starting-plan.service';
import { SubstPersonService } from './subst-person.service';

@Component({
    selector: 'gl-subst-person',
    templateUrl: './subst-person.component.html',
    styleUrls: ['./subst-person.component.scss'],
})
export class SubstPersonComponent implements OnInit {
    /**
     * 计划头部操作
     */
    planHandleIfy = {
        year: new Date(),
        yearChange: () => {
            this.planHandleIfy.loadPlanList();
        },

        planId: null,
        list: [],
        evtModelChange: () => {
            this.substPersonUnitIfy.loadPsnUnitList();
        },
        // 通过年度查询计划列表
        loadPlanList: () => {
            this.planHandleIfy.planId = null;
            this.substPersonUnitIfy.list = this.planPsnTableIfy.tableData = [];
            const params = {
                PLAN02: this.planHandleIfy.year.getFullYear(),
                PLAN05: 1,
            };
            this.planService.selectListByYear(params).subscribe(result => {
                this.planHandleIfy.list = result;
                const [first] = result;
                this.planHandleIfy.planId = first.DATA_3001_OTHER_PLAN_ID;
                // 计划id取职位列表
                this.substPersonUnitIfy.loadPsnUnitList();
            });
        },
    };

    /**
     * 考录职位列表
     */
    substPersonUnitIfy = {
        list: [],
        selectedItem: null,
        evtSelected: item => {
            this.substPersonUnitIfy.selectedItem = item;
            this.planPsnTableIfy.loadTableData();
        },
        // 根据计划id查询职位列表
        loadPsnUnitList: () => {
            this.planPsnTableIfy.selectedRowData = null;
            this.substPersonUnitIfy.list = [];
            const pd = {
                BP0101: this.planHandleIfy.planId,
            };
            this.planService.selectListByBP0101(pd).subscribe(result => {
                if (result) {
                    this.substPersonUnitIfy.list = result;
                    const [first] = result;
                    this.substPersonUnitIfy.selectedItem = first;

                    // 职位下人员表格取数
                    this.planPsnTableIfy.loadTableData();
                }
            });
        },
        // 单位列表搜索
        find: {
            value: null,
            list: [],
            evtModelChange: value => {
                const index = this.substPersonUnitIfy.list.findIndex(
                    item => item[`${this.tableHelper.getTableCode('BP01')}_ID`] === value
                );
                if (index > -1) {
                    // 设置职位选中
                    this.substPersonUnitIfy.selectedItem = this.substPersonUnitIfy.list[index];
                    // 单位下人员表格取数
                    this.planPsnTableIfy.loadTableData();
                }
            },
            evtSearch: searchValue => {
                if (searchValue) {
                    this.substPersonUnitIfy.find.list = this.substPersonUnitIfy.list.filter(
                        item => item.BP0105_CN.indexOf(searchValue) > -1
                    );
                }
            },
            evtOpenChange: status => {
                if (status) {
                    this.substPersonUnitIfy.find.value = null;
                }
            },
        },
    };

    /**
     * 公招计划下职位人员信息表格
     */
    planPsnTableIfy = {
        tableData: [],
        pageSize: 10,
        pageIndex: 1,
        loading: false,
        // 根据职位BP01_ID查询人员表格
        loadTableData: () => {
            this.planPsnTableIfy.tableData = [];
            if (!this.substPersonUnitIfy.selectedItem) {
                return;
            }
            this.planPsnTableIfy.loading = true;
            const pd = {
                BP0213: this.substPersonUnitIfy.selectedItem.BP0105,
            };
            this.planService.getPsnTableData(pd).subscribe(result => {
                this.planPsnTableIfy.loading = false;
                if (result) {
                    this.planPsnTableIfy.pageIndex = 1;
                    this.planPsnTableIfy.tableData = result;
                }
            });
        },
        // 导入表格
        fileCustomRequest: item => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            formData.append('FILE', item.file);
            this.planService.importExcel(formData).subscribe(result => {
                if (result) {
                    this.message.success('表格导入完成!');
                    // 取单位下人员表格
                    this.planPsnTableIfy.loadTableData();
                }
            });
        },
        selectedRowData: null,
        // 人员表格搜索
        find: {
            value: null,
            list: [],
            evtModelChange: value => {
                const index = this.planPsnTableIfy.tableData.findIndex(
                    item => item.BP0201 === value
                );
                if (index > -1) {
                    // 设置选中数据行
                    this.planPsnTableIfy.selectedRowData = this.planPsnTableIfy.tableData[index];
                    const { pageSize } = this.planPsnTableIfy;
                    // 设置搜索人员所在页数
                    const num = Math.trunc((index + 1) / pageSize);
                    const restNum = (index + 1) % pageSize;
                    this.planPsnTableIfy.pageIndex = restNum === 0 ? num : num >= 1 ? num + 1 : 1;
                }
            },
            evtSearch: searchValue => {
                if (searchValue) {
                    this.planPsnTableIfy.find.list = this.planPsnTableIfy.tableData.filter(
                        item => item.BP0202.indexOf(searchValue) > -1
                    );
                }
            },
            evtOpenChange: status => {
                if (status) {
                    this.planPsnTableIfy.find.value = null;
                }
            },
        },

        editor: item => {
            const param = {
                ...item,
            };
            this.service.editorTableData(param).subscribe();
        },
    };

    formData = {};

    /** 详细信息 */
    detailsIfy = {
        visible: false,
        width: 400,
        title: '详细信息',
        current: null,
        open: item => {
            this.formData = Object.assign({}, item);
            this.detailsIfy.current = Object.assign({}, item);
            this.detailsIfy.form.reset(item);
            this.detailsIfy.visible = true;
        },
        close: () => {
            this.detailsIfy.visible = false;
        },

        fields: [],
        form: new FormGroup({}),
        save: () => {
            const param = {
                ...this.detailsIfy.current,
                ...this.detailsIfy.form.getRawValue(),
            };
            this.service.editorTableData(param).subscribe(res => {
                const tableId = this.tableHelper.getTableCode('BP02');
                const index = this.planPsnTableIfy.tableData.findIndex(
                    x => x[tableId + '_ID'] === this.detailsIfy.current[tableId + '_ID']
                );
                this.detailsIfy.close();
                this.planPsnTableIfy.tableData[index] = res;
                this.planPsnTableIfy.tableData = [...this.planPsnTableIfy.tableData];
            });
        },
    };

    constructor(
        private planService: StartingPlanService,
        private clientService: ClientService,
        private tableHelper: WfTableHelper,
        private commonService: CommonService,
        private loading: LoadingService,
        private message: NzMessageService,
        private service: SubstPersonService
    ) { }

    ngOnInit(): void {
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '考录人员管理',
            },
        ]);

        this.planHandleIfy.yearChange();

        this.getSchemeContent();
    }

    // 下载excel模板
    downLoadExcelTemp() {
        const option = {
            BP0101: this.planHandleIfy.planId,
        };
        // const params = new HttpParams({ fromObject: option });
        this.commonService.downFilePost(
            'api/gl-service-data-civil/v1/data/unit/bp01/outputExcelTemplate',
            option,
            '表格模板.xlsx'
        );
    }

    // 表格输出excel
    downLoadTableExcel() {
        const option = {
            BP0230: this.substPersonUnitIfy.selectedItem[
                `${this.tableHelper.getTableCode('BP01')}_ID`
            ],
            $QUERY_FIELDS$: 'BP0202,BP0203,BP0204',
        };
        // const params = new HttpParams({ fromObject: option });
        this.commonService.downFilePost(
            'api/gl-service-data-civil/v1/data/unit/bp02/outputExcel',
            option
        );
    }

    private getSchemeContent() {
        const scheme = 'subst_person_0';
        this.commonService.getFieldSchemeConent(scheme).subscribe(schemeInfo => {
            this.render(schemeInfo, this.detailsIfy.fields, this.detailsIfy.form);
        });
    }

    /**
     * 根据界面方案构建表单
     * @param scheme 界面方案
     * @param fields 字段数组
     */
    private render(scheme: any, fields: Array<any>, form: FormGroup) {
        scheme.systemSchemeEdit.forEach(field => {
            form.addControl(
                field.TABLE_COLUMN_CODE,
                new FormControl(
                    { value: null, disabled: field.SCHEME_EDIT_IS_READONLY },
                    [
                        field.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
                        field.SCHEME_EDIT_CHECK_SCRIPT
                            ? this.commonService.buildValidatorsFn(
                                field,
                                field.SCHEME_EDIT_CHECK_SCRIPT
                            )
                            : null,
                    ].filter(s => s)
                )
            );
            fields.push(field);
        });
    }
}
