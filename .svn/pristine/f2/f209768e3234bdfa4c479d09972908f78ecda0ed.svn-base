import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { CommonService } from 'app/util/common.service';
import { FormPageService } from '../form-page.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'form-page-popup-editor',
    templateUrl: './popup-editor.component.html',
    styleUrls: ['./popup-editor.component.scss'],
})
export class PopupEditorComponent implements OnInit {
    /**
     * 人员信息
     */
    @Input() personInfo: any;

    @Output() updateFormChange = new EventEmitter<any>();

    @ViewChild('inputEditElement', { static: false }) inputEditElement: ElementRef;

    columnType = ColumnTypeEnum;

    permission = 'appointdismiss_editor';
    chemeDataList: any;

    /**
     * 是否有所操作
     */
    isChange = false;

    /**
     * 输出标识
     */
    outputPermission = {
        DATA_PERSON_A02: 'A0281',
        DATA_PERSON_A06: 'A0699',
        DATA_PERSON_A08: 'A0898',
        DATA_PERSON_A14: 'A1498',
    };

    /**
     * 普通子集录入
     */
    setChildTableIfy = {
        // 抽屉内容
        width: 800,
        visible: false,
        title: '子集信息',
        close: () => {
            if (this.isChange) {
                this.updateFormChange.emit();
            }
            this.setChildTableIfy.selectRowIndex = -1;
            this.setChildTableIfy.visible = false;
        },
        open: () => {
            this.setChildTableIfy._init();
            this.setChildTableIfy.visible = true;
        },
        config: <any>{},
        _init: () => {
            if (this.chemeDataList) {
                this.setChildTableIfy._buildEditData();
                return;
            }
            this.commonService.getSchemeContent(this.permission).subscribe(result => {
                this.chemeDataList = result;
                this.setChildTableIfy._buildEditData();
            });
        },
        editSet: null,
        pageIndex: 1,
        pageSize: 7,
        selectRowIndex: -1,
        evtPageChange: () => {
            this.setChildTableIfy.selectRowIndex = -1;
        },
        evtSelectRow: index => {
            this.setChildTableIfy.selectRowIndex = index;
        },
        _buildEditData: () => {
            this.setChildTableIfy.editSet = this.chemeDataList.systemSchemeList.find(
                v => v.systemSchemeTable.TABLE_CODE === this.setChildTableIfy.config.tableCode
            );
            if (this.setChildTableIfy.editSet) {
                this.setChildTableIfy.title =
                    this.setChildTableIfy.editSet.systemSchemeTable.TABLE_NAME;
                this.setChildTableIfy.childEditIfy.title =
                    this.setChildTableIfy.editSet.systemSchemeTable.TABLE_NAME;

                const { TABLE_CODE } = this.setChildTableIfy.editSet.systemSchemeTable;

                if (!this.setChildTableIfy.editSet.editForm) {
                    const form = new FormGroup({});
                    this.setChildTableIfy.editSet.systemSchemeEdit.forEach(item => {
                        form.addControl(
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
                    });
                    this.setChildTableIfy.editSet.drawerTemp = this.inputEditElement;
                    this.setChildTableIfy.editSet.editForm = form;
                }

                if (this.setChildTableIfy.editSet.tableData) {
                    return;
                }
                this.service
                    .getSetChildList(TABLE_CODE, this.personInfo.DATA_PERSON_A01_ID)
                    .subscribe(result => {
                        this.setChildTableIfy.editSet.tableData = result.map(item => {
                            const field =
                                this.outputPermission[this.setChildTableIfy.config.tableCode];
                            item[field] = item[field] === 'TRUE';
                            return item;
                        });
                    });
            }
        },

        evtAdd: () => {
            this.setChildTableIfy.editSet.editForm.reset();
            this.setChildTableIfy.editSet.formData = {};
            this.setChildTableIfy.childEditIfy.open();
        },
        evtEdit: () => {
            this.setChildTableIfy.childEditIfy.isEdit = true;
            const rowData =
                this.setChildTableIfy.editSet.tableData[this.setChildTableIfy.selectRowIndex];

            this.setChildTableIfy.editSet.formData = rowData;
            this.setChildTableIfy.editSet.editForm.reset(rowData);
            this.setChildTableIfy.childEditIfy.open();
        },
        evtDelete: () => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const item = this.setChildTableIfy.editSet;
                    const row =
                        this.setChildTableIfy.editSet.tableData[
                            this.setChildTableIfy.selectRowIndex
                        ];
                    const key = `${item.systemSchemeTable.TABLE_CODE}_ID`;
                    const data = {};
                    data[`${item.systemSchemeTable.TABLE_CODE}_A01_ID`] =
                        this.personInfo.DATA_PERSON_A01_ID;
                    data[key] = row[key];
                    this.service
                        .removeChildData(item.systemSchemeTable.TABLE_CODE, data)
                        .subscribe(() => {
                            this.isChange = true;
                            const index = this.setChildTableIfy.editSet.tableData.findIndex(
                                v => v[key] === row[key]
                            );
                            this.setChildTableIfy.editSet.tableData.splice(index, 1);
                            this.setChildTableIfy.editSet.tableData = [
                                ...this.setChildTableIfy.editSet.tableData,
                            ];
                            // this.updateFormChange.emit(row.TABLE_CODE);
                        });
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        evtMove: (direction: number) => {
            const tblData = this.setChildTableIfy.editSet.tableData;
            if (direction === 1 && this.setChildTableIfy.selectRowIndex === tblData.length - 1) {
                this.message.info('已经在最底部了。');
                return;
            }
            if (direction === 0 && this.setChildTableIfy.selectRowIndex === 0) {
                this.message.info('已经在最顶部了。');
                return;
            }
            const item = this.setChildTableIfy.editSet;
            const row =
                tblData[
                    this.setChildTableIfy.pageSize * (this.setChildTableIfy.pageIndex - 1) +
                        this.setChildTableIfy.selectRowIndex
                ];
            this.service
                .adjustSortChildData(
                    item.systemSchemeTable.TABLE_CODE,
                    row[`${item.systemSchemeTable.TABLE_CODE}_ID`],
                    direction
                )
                .subscribe(() => {
                    this.isChange = true;
                    const x =
                            this.setChildTableIfy.pageSize * (this.setChildTableIfy.pageIndex - 1) +
                            this.setChildTableIfy.selectRowIndex,
                        y = direction === 0 ? x - 1 : x + 1;

                    this.setChildTableIfy.editSet.tableData.splice(
                        x,
                        1,
                        ...this.setChildTableIfy.editSet.tableData.splice(
                            y,
                            1,
                            this.setChildTableIfy.editSet.tableData[x]
                        )
                    );
                    this.setChildTableIfy.editSet.tableData = [
                        ...this.setChildTableIfy.editSet.tableData,
                    ];
                    this.setChildTableIfy.selectRowIndex = -1;
                });
        },
        childEditIfy: {
            // 抽屉内容
            width: 480,
            visible: false,
            title: '详细信息',
            close: () => {
                this.setChildTableIfy.childEditIfy.isEdit = false;
                this.setChildTableIfy.childEditIfy.visible = false;
            },
            open: () => {
                this.setChildTableIfy.childEditIfy.visible = true;
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
            evtSave: () => {
                const { editForm, systemSchemeTable, formData } = this.setChildTableIfy.editSet;
                if (this.commonService.formVerify(editForm)) {
                    const data = editForm.getRawValue();
                    const key = `${systemSchemeTable.TABLE_CODE}_ID`;
                    data[`${systemSchemeTable.TABLE_CODE}_A01_ID`] =
                        this.personInfo.DATA_PERSON_A01_ID;

                    if (this.setChildTableIfy.childEditIfy.isEdit) {
                        // data[key] = formData[key];
                        this.service
                            .updateChildData(systemSchemeTable.TABLE_CODE, data)
                            .subscribe(result => {
                                this.isChange = true;
                                // 输出字段特殊处理
                                const field =
                                    this.outputPermission[this.setChildTableIfy.config.tableCode];
                                if (field) {
                                    result[field] = result[field] ? true : false;
                                }
                                const index = this.setChildTableIfy.editSet.tableData.findIndex(
                                    v => v[key] === result[key]
                                );
                                this.setChildTableIfy.editSet.tableData[index] = result;
                                this.setChildTableIfy.editSet.tableData = [
                                    ...this.setChildTableIfy.editSet.tableData,
                                ];
                                this.setChildTableIfy.childEditIfy.close();
                                // this.updateFormChange.emit(systemSchemeTable.TABLE_CODE);
                            });
                        return;
                    }
                    this.service
                        .addChildData(systemSchemeTable.TABLE_CODE, data)
                        .subscribe(result => {
                            this.isChange = true;
                            // 输出字段特殊处理
                            const field =
                                this.outputPermission[this.setChildTableIfy.config.tableCode];
                            if (field) {
                                result[field] = result[field] ? true : false;
                            }
                            this.setChildTableIfy.editSet.tableData.push(result);
                            this.setChildTableIfy.editSet.tableData = [
                                ...this.setChildTableIfy.editSet.tableData,
                            ];
                            this.setChildTableIfy.childEditIfy.close();
                            // this.updateFormChange.emit(systemSchemeTable.TABLE_CODE);
                        });
                }
            },
        },
    };

    constructor(
        private commonService: CommonService,
        private service: FormPageService,
        private modalService: NzModalService,
        private message: NzMessageService
    ) {}

    ngOnInit() {}

    show(config) {
        this.isChange = false;
        this.setChildTableIfy.config = config;
        this.setChildTableIfy.open();
    }

    /**
     * 输出标识更新
     * @param event 控件值
     * @param row 编辑行
     */
    evtOutputChange(event, row) {
        const data = {};
        const key = `${this.setChildTableIfy.config.tableCode}_ID`;
        data[`${this.setChildTableIfy.config.tableCode}_A01_ID`] =
            this.personInfo.DATA_PERSON_A01_ID;
        data[key] = row[key];
        const field = this.outputPermission[this.setChildTableIfy.config.tableCode];
        data[field] = event ? 'TRUE' : 'FALSE';
        this.service
            .updateChildData(this.setChildTableIfy.config.tableCode, data)
            .subscribe(result => {
                this.isChange = true;
                this.setChildTableIfy.childEditIfy.close();
                // this.updateFormChange.emit(this.setChildTableIfy.config.tableCode);
            });
    }
}
