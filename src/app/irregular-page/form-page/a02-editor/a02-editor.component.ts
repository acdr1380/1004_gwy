import { filter } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormPageService } from '../form-page.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'form-page-a02-editor',
    templateUrl: './a02-editor.component.html',
    styleUrls: ['./a02-editor.component.scss'],
})
export class A02EditorComponent implements OnInit {
    SET_ID = 'A02';
    TABLE_CODE;
    TABLE_CODE_KEY;
    TABLE_CODE_A01_KEY;
    columnType = ColumnTypeEnum;
    /**
     * 人员信息
     */
    @Input() personInfo: any = {
        A0197: false,
    };

    @Output() updateFormChange = new EventEmitter<any>();
    @Output() updatePersonChange = new EventEmitter<any>();

    /**
     * 	现工作单位及职务全称 相关弹框
     */
    A02TableIfy = {
        // 抽屉内容
        width: 800,
        visible: false,
        title: '现工作单位及职务全称',
        close: () => {
            this.A02TableIfy.visible = false;
        },
        open: () => {
            this.A02TableIfy.visible = true;
            this.loadA02List();
        },

        evtSortJTN: () => {
            this.sortJTNIfy.open();
        },

        isAll: false,
        evtIsAllChange: event => {
            this.A02TableIfy.selectRowIndex = -1;
            this.A02TableIfy.data = this.A02TableIfy.AllData.filter(
                item => event || item.A0255 === '1'
            );
        },

        AllData: [],
        data: [],
        pageIndex: 1,
        pageSize: 7,
        selectRowIndex: -1,
        evtSelectRow: index => {
            this.A02TableIfy.selectRowIndex = index;
        },
        evtAdd: () => {
            this.A02EditorIfy.form.reset();
            this.A02EditorIfy.data = {};
            this.A02EditorIfy.open();
        },
        evtEdit: () => {
            this.A02EditorIfy.isEdit = true;
            const row =
                this.A02TableIfy.data[
                    this.A02TableIfy.pageSize * (this.A02TableIfy.pageIndex - 1) +
                        this.A02TableIfy.selectRowIndex
                ];
            this.A02EditorIfy.data = row;
            if (this.A02EditorIfy.list.length > 0) {
                this.A02EditorIfy.form.reset(row);
            } else {
                this.A02EditorIfy._init(row);
            }
            this.A02EditorIfy.open();
        },
        evtDelete: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const key = `${this.TABLE_CODE}_ID`;
                    const row =
                        this.A02TableIfy.data[
                            this.A02TableIfy.pageSize * (this.A02TableIfy.pageIndex - 1) +
                                this.A02TableIfy.selectRowIndex
                        ];
                    const data = {};
                    data[`${this.TABLE_CODE}_A01_ID`] = this.personInfo.DATA_PERSON_A01_ID;
                    data[key] = row[key];
                    // this.service.removeChildData(this.TABLE_CODE, data).subscribe(() => {
                    //     this.isChange = true;
                    //     // const index = this.A02TableIfy.data.findIndex(v => v[key] === row[key]);
                    //     // this.A02TableIfy.data.splice(index, 1);
                    //     // this.A02TableIfy.data = [...this.A02TableIfy.data];
                    //     this.loadA02List();
                    //     // this.updateFormChange.emit(row.TABLE_CODE);
                    // });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        evtMove: (direction: number) => {
            const tblData = this.A02TableIfy.data;
            if (direction === 1 && this.A02TableIfy.selectRowIndex === tblData.length - 1) {
                this.message.info('已经在最底部了。');
                return;
            }
            if (direction === 0 && this.A02TableIfy.selectRowIndex === 0) {
                this.message.info('已经在最顶部了。');
                return;
            }
            const row =
                tblData[
                    this.A02TableIfy.pageSize * (this.A02TableIfy.pageIndex - 1) +
                        this.A02TableIfy.selectRowIndex
                ];
            // this.service
            //     .adjustSortChildData(this.TABLE_CODE, row[`${this.TABLE_CODE}_ID`], direction)
            //     .subscribe(() => {
            //         this.isChange = true;
            //         const x =
            //                 this.A02TableIfy.pageSize * (this.A02TableIfy.pageIndex - 1) +
            //                 this.A02TableIfy.selectRowIndex,
            //             y = direction === 0 ? x - 1 : x + 1;

            //         this.A02TableIfy.data.splice(
            //             x,
            //             1,
            //             ...this.A02TableIfy.data.splice(y, 1, this.A02TableIfy.data[x])
            //         );
            //         this.A02TableIfy.data = [...this.A02TableIfy.data];
            //         this.A02TableIfy.selectRowIndex = -1;
            //     });
        },

        evtSortByA0243: () => {
            // this.service.adjustSortByA0243(this.personInfo.DATA_PERSON_A01_ID).subscribe(result => {
            //     this.A02TableIfy.AllData = result.map(item => {
            //         item.A0281 = item.A0281 === 'TRUE';
            //         return item;
            //     });
            //     this.A02TableIfy.evtIsAllChange(this.A02TableIfy.isAll);
            //     // this.updateFormChange.emit();
            // });
        },
    };

    /**
     * 任职信息编辑
     */
    A02EditorIfy = {
        // 抽屉内容
        width: 500,
        visible: false,
        title: '现任职务信息',
        close: () => {
            this.A02EditorIfy.isEdit = false;
            this.A02EditorIfy.visible = false;
        },
        open: () => {
            this.A02EditorIfy._init();
            this.A02EditorIfy.visible = true;
        },

        key: 'A02_Editor',
        _init: (data?) => {
            if (this.A02EditorIfy.list.length > 0) {
                return;
            }
            this.commonService.getFieldSchemeConent(this.A02EditorIfy.key).subscribe(result => {
                this.A02EditorIfy.list = result.systemSchemeEdit.map(item => {
                    this.A02EditorIfy.form.addControl(
                        item.TABLE_COLUMN_CODE,
                        new FormControl(
                            { value: null, disabled: false },
                            [
                                item.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
                                !!item.SCHEME_EDIT_CHECK_SCRIPT
                                    ? this.commonService.buildValidatorsFn(
                                          item,
                                          item.SCHEME_EDIT_CHECK_SCRIPT,
                                          this.A02EditorIfy.list
                                      )
                                    : null,
                            ].filter(v => v)
                        )
                    );
                    return item;
                });
                if (data) {
                    this.A02EditorIfy.form.reset(data);
                }
            });
        },

        list: [],
        form: new FormGroup({}),
        data: {},
        isEdit: false,
        evtGetTempOutParams: () => {
            return {
                formGroup: this.A02EditorIfy.form,
                fields: this.A02EditorIfy.list,
                inline: false,
                formData: this.A02EditorIfy.data,
            };
        },

        loading: false,
        evtSave: () => {
            if (this.commonService.formVerify(this.A02EditorIfy.form)) {
                this.A02EditorIfy.loading = true;
                const data = this.A02EditorIfy.form.getRawValue();
                data[`${this.TABLE_CODE}_A01_ID`] = this.personInfo.DATA_PERSON_A01_ID;
                const key = this.TABLE_CODE + '_ID';
                if (this.A02EditorIfy.isEdit) {
                    data[key] = this.A02EditorIfy.data[key];
                    // this.service.updateChildData(this.TABLE_CODE, data).subscribe(result => {
                    //     this.isChange = true;
                    //     // const index = this.A02TableIfy.data.findIndex(v => v[key] === result[key]);
                    //     // this.A02TableIfy.data[index] = result;
                    //     // this.A02TableIfy.data = [...this.A02TableIfy.data];

                    //     this.loadA02List();
                    //     // this.updateFormChange.emit();
                    //     this.A02EditorIfy.close();
                    //     this.A02EditorIfy.loading = false;
                    // });
                    return;
                }
                // this.service.addChildData(this.TABLE_CODE, data).subscribe(result => {
                //     this.isChange = true;
                //     // this.A02TableIfy.data.push(result);
                //     // this.A02TableIfy.data = [...this.A02TableIfy.data];

                //     this.loadA02List();
                //     // this.updateFormChange.emit();
                //     this.A02EditorIfy.close();
                //     this.A02EditorIfy.loading = false;
                // });
            }
        },
    };

    /**
     * 集体内排序
     */
    sortJTNIfy = {
        // 抽屉内容
        width: 600,
        visible: false,
        title: '集体内排序',
        close: () => {
            this.sortJTNIfy.visible = false;
        },
        open: () => {
            this.sortJTNIfy.evtLoadList(true);
            this.sortJTNIfy.visible = true;
        },

        pageSize: 10,
        pageIndex: 1,
        totalCount: 0,
        data: [],
        selectRowIndex: -1,
        evtSelectRow: index => {
            this.sortJTNIfy.selectRowIndex = index;
        },

        evtLoadList: (reset: boolean = false): void => {
            if (reset) {
                this.sortJTNIfy.pageIndex = 1;
            }
            this.sortJTNIfy.selectRowIndex = -1;
            const row = this.A02TableIfy.data[this.A02TableIfy.selectRowIndex];
            const data = {
                $PAGE_INDEX$: this.sortJTNIfy.pageIndex,
                $PAGE_SIZE$: this.sortJTNIfy.pageSize,
                DATA_PERSON_A02_ID: row.DATA_PERSON_A02_ID,
            };
            // this.service.selectLitByA0201B(data).subscribe(json => {
            //     this.sortJTNIfy.data = json.result;
            //     this.sortJTNIfy.pageSize = json.pageSize;
            //     this.sortJTNIfy.pageIndex = json.pageIndex;
            //     if (json.totalCount > 0) {
            //         this.sortJTNIfy.totalCount = json.totalCount;
            //     }
            // });
        },

        evtMove: (direction: number) => {
            const tblData = this.sortJTNIfy.data;
            if (direction === 1 && this.sortJTNIfy.selectRowIndex === tblData.length - 1) {
                this.message.info('已经在最底部了。');
                return;
            }
            if (direction === 0 && this.sortJTNIfy.selectRowIndex === 0) {
                this.message.info('已经在最顶部了。');
                return;
            }

            const row = this.sortJTNIfy.data[this.sortJTNIfy.selectRowIndex];
            // this.service.adjustSortByA0225(row.DATA_PERSON_A02_ID, direction).subscribe(() => {
            //     // const x = this.sortJTNIfy.selectRowIndex,
            //     //     y =
            //     //         direction === 0
            //     //             ? this.sortJTNIfy.selectRowIndex - 1
            //     //             : this.sortJTNIfy.selectRowIndex + 1;

            //     // this.sortJTNIfy.data.splice(
            //     //     x,
            //     //     1,
            //     //     ...this.sortJTNIfy.data.splice(y, 1, this.sortJTNIfy.data[x])
            //     // );
            //     // this.sortJTNIfy.data = [...this.sortJTNIfy.data];
            //     // this.sortJTNIfy.selectRowIndex = y;
            //     this.sortJTNIfy.evtLoadList();
            // });
        },
    };

    // 移动到
    orderAdjust = {
        btnLoading: false,
        visible: false,
        change: () => (this.orderAdjust.location = null),

        text: null,
        location: null,
        move: () => {
            if (!this.orderAdjust.location) {
                this.message.error('未填写移动位置。');
                return;
            }

            const row = this.sortJTNIfy.data[this.sortJTNIfy.selectRowIndex];
            // this.service
            //     .adjustSortToByA0225(row.DATA_PERSON_A02_ID, this.orderAdjust.location)
            //     .subscribe(result => {
            //         // if (this.orderAdjust.location <= this.sortJTNIfy.pageSize) {
            //         //     const index = this.sortJTNIfy.data.findIndex(v => v.A0225 === row.A0225);
            //         //     this.sortJTNIfy.data.splice(index, 1);
            //         //     this.sortJTNIfy.data.splice(this.orderAdjust.location - 1, 0, row);
            //         //     this.sortJTNIfy.data = [...this.sortJTNIfy.data];
            //         // }
            //         this.orderAdjust.visible = false;

            //         this.sortJTNIfy.evtLoadList();
            //     });
        },
    };

    constructor(
        private service: FormPageService,
        private modalService: NzModalService,
        private commonService: CommonService,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {
        this.TABLE_CODE = `${this.tableHelper.getTableCode(this.SET_ID)}`;
        this.TABLE_CODE_KEY = `${this.TABLE_CODE}_ID`;
        this.TABLE_CODE_A01_KEY = `${this.tableHelper.getTableCode('A01')}_ID`;
    }

    /**
     * 加载A02子集列表
     */
    loadA02List() {
        this.service
            .getSetChildList(this.SET_ID, this.personInfo[this.TABLE_CODE_A01_KEY])
            .subscribe(result => {
                this.A02TableIfy.AllData = result.map(item => {
                    item.A0281 = item.A0281 === 'TRUE';
                    return item;
                });
                this.A02TableIfy.evtIsAllChange(this.A02TableIfy.isAll);
            });
    }

    show() {
        this.A02TableIfy.open();
    }

    /**
     * 输出标识更新
     * @param event 控件值
     * @param row 编辑行
     */
    evtOutputChange(event, row) {
        const data = {};
        const key = `${this.TABLE_CODE}_ID`;
        data[key] = row[key];
        data[`${this.TABLE_CODE}_A01_ID`] = this.personInfo.DATA_PERSON_A01_ID;
        data['A0281'] = event ? 'TRUE' : 'FALSE';
        // this.service.updateChildData(this.TABLE_CODE, data).subscribe(result => {
        //     this.isChange = true;
        //     // const index = this.A02TableIfy.data.findIndex(v => v[key] === result[key]);
        //     // this.A02TableIfy.data[index] = result;
        //     // this.A02TableIfy.data = [...this.A02TableIfy.data];
        //     // this.A02TableIfy.close();
        //     // this.updateFormChange.emit(this.TABLE_CODE);
        // });
    }

    /**
     * 保存A01冗余字段
     */
    evtUpdateData() {
        const data = {
            DATA_PERSON_A01_ID: this.personInfo.DATA_PERSON_A01_ID,
            A0197: this.personInfo.A0197 ? '1' : '0',
            A0192A: this.personInfo.A0192A,
            A0192: this.personInfo.A0192,
        };

        // this.service.updateChildData('DATA_PERSON_A01', data).subscribe(result => {
        //     this.isChange = true;
        //     this.A02TableIfy.close();
        // });
    }
}
