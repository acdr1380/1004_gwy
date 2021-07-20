import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormPageService } from '../form-page.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { CommonService } from 'app/util/common.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'form-page-a15-editor',
    templateUrl: './a15-editor.component.html',
    styleUrls: ['./a15-editor.component.scss'],
})
export class A15EditorComponent implements OnInit {
    SET_ID = 'A15';
    TABLE_CODE;
    TABLE_CODE_KEY;
    TABLE_CODE_A01_KEY;

    columnType = ColumnTypeEnum;
    /**
     * 人员信息
     */
    @Input() personInfo: any = {};

    @Output() updateFormChange = new EventEmitter<any>();
    @Output() updatePersonChange = new EventEmitter<any>();

    A15TableIfy = {
        // 抽屉内容
        width: 800,
        visible: false,
        title: '考核信息',
        close: () => {
            this.A15TableIfy.visible = false;
        },
        open: () => {
            this.A15TableIfy.loadList();
            this.A15TableIfy.visible = true;
        },
        loadList: () => {
            this.service
                .getSetChildList(this.SET_ID, this.personInfo[this.TABLE_CODE_A01_KEY])
                .subscribe(result => {
                    this.A15TableIfy.data = result;
                });
        },

        data: [],
        pageIndex: 1,
        pageSize: 7,
        selectRowIndex: -1,
        evtPageChange: () => {
            this.A15TableIfy.selectRowIndex = -1;
        },
        evtSelectRow: index => {
            this.A15TableIfy.selectRowIndex = index;
        },
        evtAdd: () => {
            this.A15EditorIfy.form.reset();
            this.A15EditorIfy.data = {};
            this.A15EditorIfy.open();
        },
        evtEdit: () => {
            this.A15EditorIfy.isEdit = true;
            const row =
                this.A15TableIfy.data[
                    this.A15TableIfy.pageSize * (this.A15TableIfy.pageIndex - 1) +
                        this.A15TableIfy.selectRowIndex
                ];
            this.A15EditorIfy.data = row;
            if (this.A15EditorIfy.list.length > 0) {
                this.A15EditorIfy.form.reset(row);
            } else {
                this.A15EditorIfy._init(row);
            }
            this.A15EditorIfy.open();
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
                        this.A15TableIfy.data[
                            this.A15TableIfy.pageSize * (this.A15TableIfy.pageIndex - 1) +
                                this.A15TableIfy.selectRowIndex
                        ];
                    const data = {};
                    data[`${this.TABLE_CODE}_A01_ID`] = this.personInfo.DATA_PERSON_A01_ID;
                    data[key] = row[key];
                    // this.service.removeChildData(this.TABLE_CODE, data).subscribe(() => {
                    //     this.isChange = true;
                    //     const index = this.A15TableIfy.data.findIndex(v => v[key] === row[key]);
                    //     this.A15TableIfy.data.splice(index, 1);
                    //     this.A15TableIfy.data = [...this.A15TableIfy.data];
                    //     // this.updateFormChange.emit(row.TABLE_CODE);
                    // });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        evtMove: (direction: number) => {
            const tblData = this.A15TableIfy.data;
            if (direction === 1 && this.A15TableIfy.selectRowIndex === tblData.length - 1) {
                this.message.info('已经在最底部了。');
                return;
            }
            if (
                direction === 0 &&
                this.A15TableIfy.pageSize * (this.A15TableIfy.pageIndex - 1) +
                    this.A15TableIfy.selectRowIndex ===
                    0
            ) {
                this.message.info('已经在最顶部了。');
                return;
            }
            const row =
                tblData[
                    this.A15TableIfy.pageSize * (this.A15TableIfy.pageIndex - 1) +
                        this.A15TableIfy.selectRowIndex
                ];
            // this.service
            //     .adjustSortChildData(this.TABLE_CODE, row[`${this.TABLE_CODE}_ID`], direction)
            //     .subscribe(() => {
            //         this.isChange = true;
            //         const x =
            //                 this.A15TableIfy.pageSize * (this.A15TableIfy.pageIndex - 1) +
            //                 this.A15TableIfy.selectRowIndex,
            //             y = direction === 0 ? x - 1 : x + 1;
            //         this.A15TableIfy.data.splice(
            //             x,
            //             1,
            //             ...this.A15TableIfy.data.splice(y, 1, this.A15TableIfy.data[x])
            //         );
            //         this.A15TableIfy.data = [...this.A15TableIfy.data];
            //         this.A15TableIfy.selectRowIndex = -1;
            //         // this.updateFormChange.subscribe();
            //     });
        },
    };

    /**
     * 奖惩编辑
     */
    A15EditorIfy = {
        // 抽屉内容
        width: 500,
        visible: false,
        title: '现任职务信息',
        close: () => {
            this.A15EditorIfy.isEdit = false;
            this.A15EditorIfy.visible = false;
        },
        open: () => {
            this.A15EditorIfy._init();
            this.A15EditorIfy.visible = true;
        },

        key: 'A15_Editor',
        _init: (data?) => {
            if (this.A15EditorIfy.list.length > 0) {
                return;
            }
            this.commonService.getFieldSchemeConent(this.A15EditorIfy.key).subscribe(result => {
                this.A15EditorIfy.list = result.systemSchemeEdit.map(item => {
                    this.A15EditorIfy.form.addControl(
                        item.TABLE_COLUMN_CODE,
                        new FormControl(
                            { value: null, disabled: false },
                            [
                                item.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
                                !!item.SCHEME_EDIT_CHECK_SCRIPT
                                    ? this.commonService.buildValidatorsFn(
                                          item,
                                          item.SCHEME_EDIT_CHECK_SCRIPT
                                      )
                                    : null,
                            ].filter(v => v)
                        )
                    );
                    return item;
                });
                if (data) {
                    this.A15EditorIfy.form.reset(data);
                }
            });
        },

        list: [],
        form: new FormGroup({}),
        data: {},
        isEdit: false,
        evtGetTempOutParams: () => {
            return {
                formGroup: this.A15EditorIfy.form,
                fields: this.A15EditorIfy.list,
                inline: false,
                formData: this.A15EditorIfy.data,
            };
        },

        loading: false,
        evtSave: () => {
            if (this.commonService.formVerify(this.A15EditorIfy.form)) {
                this.A15EditorIfy.loading = true;
                const data = this.A15EditorIfy.form.getRawValue();
                data[`${this.TABLE_CODE}_A01_ID`] = this.personInfo.DATA_PERSON_A01_ID;
                const key = this.TABLE_CODE + '_ID';
                if (this.A15EditorIfy.isEdit) {
                    data[key] = this.A15EditorIfy.data[key];
                    // this.service.updateChildData(this.TABLE_CODE, data).subscribe(result => {
                    //     this.isChange = true;
                    //     const index = this.A15TableIfy.data.findIndex(v => v[key] === result[key]);
                    //     this.A15TableIfy.data[index] = result;
                    //     this.A15TableIfy.data = [...this.A15TableIfy.data];
                    //     // this.updateFormChange.emit();
                    //     this.A15EditorIfy.close();
                    //     this.A15EditorIfy.loading = false;
                    // });
                    // return;
                }
                // this.service.addChildData(this.TABLE_CODE, data).subscribe(result => {
                //     this.isChange = true;
                //     this.A15TableIfy.data.push(result);
                //     this.A15TableIfy.data = [...this.A15TableIfy.data];
                //     // this.updateFormChange.emit();
                //     this.A15EditorIfy.close();
                //     this.A15EditorIfy.loading = false;
                // });
            }
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

    show() {
        this.A15TableIfy.open();
    }

    evtUpdateData() {
        const data = {
            DATA_PERSON_A01_ID: this.personInfo.DATA_PERSON_A01_ID,
            A15Z101: this.personInfo.A15Z101,
        };

        // this.service.updateChildData('DATA_PERSON_A01', data).subscribe(result => {
        //     this.isChange = true;
        //     this.A15TableIfy.close();
        // });
    }
}
