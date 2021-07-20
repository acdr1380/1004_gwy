import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormPageService } from '../form-page.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'app/util/common.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'form-page-a14-editor',
    templateUrl: './a14-editor.component.html',
    styleUrls: ['./a14-editor.component.scss'],
})
export class A14EditorComponent implements OnInit {
    SET_ID = 'A14';
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

    A14TableIfy = {
        // 抽屉内容
        width: 800,
        visible: false,
        title: '奖惩信息',
        close: () => {
            this.A14TableIfy.visible = false;
        },
        open: () => {
            this.A14TableIfy.loadList();
            this.A14TableIfy.visible = true;
        },

        loadList: () => {
            this.service
                .getSetChildList(this.SET_ID, this.personInfo[this.TABLE_CODE_A01_KEY])
                .subscribe(result => {
                    this.A14TableIfy.data = result.map(item => {
                        item.A1498 = item.A1498 === 'TRUE';
                        return item;
                    });
                });
        },

        data: [],
        pageIndex: 1,
        pageSize: 7,
        selectRowIndex: -1,
        evtSelectRow: index => {
            this.A14TableIfy.selectRowIndex = index;
        },
        evtAdd: () => {
            this.A14EditorIfy.form.reset();
            this.A14EditorIfy.data = {};
            this.A14EditorIfy.open();
        },
        evtEdit: () => {
            this.A14EditorIfy.isEdit = true;
            const row =
                this.A14TableIfy.data[
                    this.A14TableIfy.pageSize * (this.A14TableIfy.pageIndex - 1) +
                        this.A14TableIfy.selectRowIndex
                ];
            this.A14EditorIfy.data = row;
            if (this.A14EditorIfy.list.length > 0) {
                this.A14EditorIfy.form.reset(row);
            } else {
                this.A14EditorIfy._init(row);
            }
            this.A14EditorIfy.open();
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
                        this.A14TableIfy.data[
                            this.A14TableIfy.pageSize * (this.A14TableIfy.pageIndex - 1) +
                                this.A14TableIfy.selectRowIndex
                        ];
                    const data = {};
                    data[`${this.TABLE_CODE}_A01_ID`] = this.personInfo.DATA_PERSON_A01_ID;
                    data[key] = row[key];
                    // this.service.removeChildData(this.TABLE_CODE, data).subscribe(() => {
                    //     this.isChange = true;
                    //     const index = this.A14TableIfy.data.findIndex(v => v[key] === row[key]);
                    //     this.A14TableIfy.data.splice(index, 1);
                    //     this.A14TableIfy.data = [...this.A14TableIfy.data];
                    //     // this.updateFormChange.emit(row.TABLE_CODE);
                    // });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        evtMove: (direction: number) => {
            const tblData = this.A14TableIfy.data;
            if (direction === 1 && this.A14TableIfy.selectRowIndex === tblData.length - 1) {
                this.message.info('已经在最底部了。');
                return;
            }
            if (
                direction === 0 &&
                this.A14TableIfy.pageSize * (this.A14TableIfy.pageIndex - 1) +
                    this.A14TableIfy.selectRowIndex ===
                    0
            ) {
                this.message.info('已经在最顶部了。');
                return;
            }
            const row =
                tblData[
                    this.A14TableIfy.pageSize * (this.A14TableIfy.pageIndex - 1) +
                        this.A14TableIfy.selectRowIndex
                ];
            // this.service
            //     .adjustSortChildData(this.TABLE_CODE, row[`${this.TABLE_CODE}_ID`], direction)
            //     .subscribe(() => {
            //         this.isChange = true;
            //         const x =
            //                 this.A14TableIfy.pageSize * (this.A14TableIfy.pageIndex - 1) +
            //                 this.A14TableIfy.selectRowIndex,
            //             y = direction === 0 ? x - 1 : x + 1;
            //         this.A14TableIfy.data.splice(
            //             x,
            //             1,
            //             ...this.A14TableIfy.data.splice(y, 1, this.A14TableIfy.data[x])
            //         );
            //         this.A14TableIfy.data = [...this.A14TableIfy.data];
            //         this.A14TableIfy.selectRowIndex = -1;
            //         // this.updateFormChange.subscribe();
            //     });
        },
    };

    /**
     * 奖惩编辑
     */
    A14EditorIfy = {
        // 抽屉内容
        width: 500,
        visible: false,
        title: '现任职务信息',
        close: () => {
            this.A14EditorIfy.isEdit = false;
            this.A14EditorIfy.visible = false;
        },
        open: () => {
            this.A14EditorIfy._init();
            this.A14EditorIfy.visible = true;
        },

        key: 'A14_Editor',
        _init: (data?) => {
            if (this.A14EditorIfy.list.length > 0) {
                return;
            }
            this.commonService.getFieldSchemeConent(this.A14EditorIfy.key).subscribe(result => {
                this.A14EditorIfy.list = result.systemSchemeEdit.map(item => {
                    this.A14EditorIfy.form.addControl(
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
                    this.A14EditorIfy.form.reset(data);
                }
            });
        },

        list: [],
        form: new FormGroup({}),
        data: {},
        isEdit: false,
        evtGetTempOutParams: () => {
            return {
                formGroup: this.A14EditorIfy.form,
                fields: this.A14EditorIfy.list,
                inline: false,
                formData: this.A14EditorIfy.data,
            };
        },

        loading: false,
        evtSave: () => {
            if (this.commonService.formVerify(this.A14EditorIfy.form)) {
                this.A14EditorIfy.loading = true;
                const data = this.A14EditorIfy.form.getRawValue();
                data[`${this.TABLE_CODE}_A01_ID`] = this.personInfo.DATA_PERSON_A01_ID;
                const key = this.TABLE_CODE + '_ID';
                if (this.A14EditorIfy.isEdit) {
                    data[key] = this.A14EditorIfy.data[key];
                    // this.service.updateChildData(this.TABLE_CODE, data).subscribe(result => {
                    //     this.isChange = true;
                    //     const index = this.A14TableIfy.data.findIndex(v => v[key] === result[key]);
                    //     result.A1498 = result.A1498 === 'TRUE';
                    //     this.A14TableIfy.data[index] = result;
                    //     this.A14TableIfy.data = [...this.A14TableIfy.data];
                    //     // this.updateFormChange.emit();
                    //     this.A14EditorIfy.close();
                    //     this.A14EditorIfy.loading = false;
                    // });
                    return;
                }
                // this.service.addChildData(this.TABLE_CODE, data).subscribe(result => {
                //     this.isChange = true;
                //     result.A1498 = result.A1498 === 'TRUE';
                //     this.A14TableIfy.data.push(result);
                //     this.A14TableIfy.data = [...this.A14TableIfy.data];
                //     // this.updateFormChange.emit();
                //     this.A14EditorIfy.close();
                //     this.A14EditorIfy.loading = false;
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
        this.A14TableIfy.open();
    }

    /**
     * 输出标识更新
     * @param event 控件值
     * @param row 编辑行
     */
    evtOutputChange(event, row) {
        const data = {};
        const key = `${this.TABLE_CODE}_ID`;
        data[`${this.TABLE_CODE}_A01_ID`] = this.personInfo.DATA_PERSON_A01_ID;
        data[key] = row[key];
        data['A1498'] = event ? 'TRUE' : 'FALSE';
        // this.service.updateChildData(this.TABLE_CODE, data).subscribe(result => {
        //     this.isChange = true;
        //     const index = this.A14TableIfy.data.findIndex(v => v[key] === result[key]);
        //     this.A14TableIfy.data[index] = result;
        //     this.A14TableIfy.data = [...this.A14TableIfy.data];
        //     this.updateFormChange.emit(this.TABLE_CODE);
        // });
    }

    /**
     * 保存A01冗余字段
     */
    evtUpdateData() {
        const data = {
            DATA_PERSON_A01_ID: this.personInfo.DATA_PERSON_A01_ID,
            A14Z101: this.personInfo.A14Z101,
        };

        // this.service.updateChildData('DATA_PERSON_A01', data).subscribe(result => {
        //     this.isChange = true;
        //     this.A14TableIfy.close();
        // });
    }
}
