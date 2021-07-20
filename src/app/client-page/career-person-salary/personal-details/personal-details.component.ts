import { PersonalDetailsService } from './personal-details.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from 'app/util/common.service';
import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Base64 } from 'js-base64';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'p-personal-details',
    templateUrl: './personal-details.component.html',
    styleUrls: ['./personal-details.component.scss'],
})
export class PersonalDetailsComponent implements OnInit, AfterViewInit {
    @ViewChild('inputEditElement', { static: false }) inputEditElement: ViewChild;
    @ViewChild('chileTableElement', { static: false }) chileTableElement: ViewChild;

    columnType = ColumnTypeEnum;
    personalBaseInfoIfy = {
        src: '',
    };

    /**
     * 人员基本信息
     */
    _personBaseInfo: any;
    @Input() set personBaseInfo(v) {
        if (v) {
            this._personBaseInfo = v;
            this.loadPersonData();
        }
    }
    get personBaseInfo() {
        return this._personBaseInfo;
    }

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
        open: () => (this.cropperPictureIfy.visible = true),

        evtUpload: () => {
            this.cropperPictureIfy.open();
        },
        evtPhotoChange: file => {
            const data = {
                A01BTYPE: file.fileType,
                A01BPATH: file.id,
                A01BNAME: file.fileName,
                A01BSIZE: file.fileSize,
                // DATA_PERSON_A01B_A01_ID: this.personalInfo.DATA_PERSON_A01_ID,
            };
            data[`${this.tableHelper.getTableCode('A01B')}_A01_ID`] = this.personalInfo[
                `${this.tableHelper.getTableCode('A01')}_ID`
            ];
            this.service.updateA01PhotoData(data).subscribe(() => {
                this.personalBaseInfoIfy.src = file.url;
            });
            this.cropperPictureIfy.close();
        },
    };

    /**
     * 界面方案信息
     */
    interfaceSchemeIfy = {
        result: null,
        // 选中表
        selectedTable: null,

        evtSelectorTable: item => {
            if (this.interfaceSchemeIfy.evtGetDisabled(item)) {
                return;
            }
            this.interfaceSchemeIfy.selectedTable = item;

            this.interfaceSchemeIfy._buildEditor();
            this.childMove.selectIndex = -1;
        },
        isEdit: true,
        evtGetDisabled: (item): boolean => {
            return false;
            // return (
            //     !this.interfaceSchemeIfy.isEdit &&
            //     item.systemSchemeTable.TABLE_CODE !== item.systemSchemeTable.TABLE_PARENT_CODES
            // );
        },
        // 是否主集
        evtGetIsMainTable: (): boolean => {
            const item = this.interfaceSchemeIfy.selectedTable;
            return (
                item &&
                item.systemSchemeTable.TABLE_CODE === item.systemSchemeTable.TABLE_PARENT_CODES
            );
        },
        // form: new FormGroup({}),
        // formData: {},
        // 加载界面方案
        _load: () => {
            this.commonService.getSchemeContent('person_info_gyrs').subscribe(result => {
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
                    // form.disable();
                    item.editForm = form;
                    item.formData = {};
                    item.elTemp = this.inputEditElement;

                    this.service
                        .getSetChildData(
                            item.systemSchemeTable.TABLE_CODE,
                            this.personalInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
                        )
                        .subscribe(result => {
                            if (!result) {
                                result = {
                                    A0184: this.personBaseInfo.A0101,
                                };
                            }
                            item.editForm.patchValue(result);

                            item.formData = result;
                        });
                } else {
                    item.elTemp = this.chileTableElement;
                    this.service
                        .getSetChildList(
                            item.systemSchemeTable.TABLE_CODE,
                            this.personalInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
                        )
                        .subscribe(result => {
                            item.tableData = result;
                        });
                }
            }
        },
        evtSave: () => {
            const { editForm, systemSchemeTable, formData } = this.interfaceSchemeIfy.selectedTable;
            if (this.commonService.formVerify(editForm)) {
                const data = editForm.getRawValue();
                if (this.interfaceSchemeIfy.isEdit) {
                    data[`${systemSchemeTable.TABLE_CODE}_ID`] =
                        formData[`${systemSchemeTable.TABLE_CODE}_ID`];
                    this.service
                        .updateChildData(systemSchemeTable.TABLE_CODE, data)
                        .subscribe(result => {
                            const index = this.interfaceSchemeIfy.tableData.findIndex(
                                v =>
                                    v[`${systemSchemeTable.TABLE_CODE}_ID`] ===
                                    result[`${systemSchemeTable.TABLE_CODE}_ID`]
                            );
                            this.interfaceSchemeIfy.tableData[index] = result;
                            this.interfaceSchemeIfy.tableData = [
                                ...this.interfaceSchemeIfy.tableData,
                            ];
                            this.interfaceSchemeIfy.childEditIfy.close();
                        });
                    return;
                }

                this.service.addChildData(systemSchemeTable.TABLE_CODE, data).subscribe(result => {
                    this.interfaceSchemeIfy.tableData.push(result);
                    this.interfaceSchemeIfy.tableData = [...this.interfaceSchemeIfy.tableData];
                });
            }
        },
        evtAddChildData: () => {
            const item = this.interfaceSchemeIfy.selectedTable;
            if (item.editForm) {
                item.editForm.reset();
            }
            item.formData = {};
            this.interfaceSchemeIfy.childEditIfy.open();
        },
        evtEditChildData: row => {
            const item = this.interfaceSchemeIfy.selectedTable;
            this.interfaceSchemeIfy.childEditIfy.isEdit = true;
            item.formData = Object.assign({}, row);
            this.interfaceSchemeIfy.childEditIfy.open();
        },
        evtDeleteChildData: row => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    const setChild = this.interfaceSchemeIfy.selectedTable;
                    const key = `${setChild.systemSchemeTable.TABLE_CODE}_ID`;
                    this.service
                        .removeChildData(setChild.systemSchemeTable.TABLE_CODE, row[key])
                        .subscribe(() => {
                            const item = this.interfaceSchemeIfy.selectedTable;
                            const index = item.tableData.findIndex(v => v[key] === row[key]);
                            item.tableData.splice(index, 1);
                            item.tableData = [...item.tableData];
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
                    // form.disable();
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
            evtSave: () => {
                const {
                    editForm,
                    systemSchemeTable,
                    formData,
                } = this.interfaceSchemeIfy.selectedTable;
                if (this.commonService.formVerify(editForm)) {
                    const data = editForm.getRawValue();
                    const key = `${systemSchemeTable.TABLE_CODE}_ID`;
                    if (this.interfaceSchemeIfy.childEditIfy.isEdit) {
                        data[key] = formData[key];
                        this.service
                            .updateChildData(systemSchemeTable.TABLE_CODE, data)
                            .subscribe(result => {
                                const item = this.interfaceSchemeIfy.selectedTable;
                                const index = item.tableData.findIndex(v => v[key] === result[key]);
                                item.tableData[index] = result;
                                item.tableData = [...item.tableData];
                                this.interfaceSchemeIfy.childEditIfy.close();
                            });
                        return;
                    }
                    data[`${systemSchemeTable.TABLE_CODE}_A01_ID`] = this.personalInfo[
                        `${this.tableHelper.getTableCode('A01')}_ID`
                    ];
                    this.service
                        .addChildData(systemSchemeTable.TABLE_CODE, data)
                        .subscribe(result => {
                            const item = this.interfaceSchemeIfy.selectedTable;
                            item.tableData.push(result);
                            item.tableData = [...item.tableData];
                            this.interfaceSchemeIfy.childEditIfy.close();
                        });
                }
            },
        },
    };

    personalInfo: any;

    /**
     * 上移下移
     */
    childMove = {
        selectIndex: -1,
        click: index => {
            this.childMove.selectIndex = index;
        },
        moveUpOrDown: status => {
            const tar = this.interfaceSchemeIfy.result.systemSchemeList.find(
                v =>
                    v.systemSchemeTable.TABLE_CODE ===
                    this.interfaceSchemeIfy.selectedTable.systemSchemeTable.TABLE_CODE
            );
            const itemId =
                this.interfaceSchemeIfy.selectedTable.systemSchemeTable.TABLE_CODE + '_ID';
            const setId = this.interfaceSchemeIfy.selectedTable.systemSchemeTable.TABLE_CODE.split(
                '_'
            ).pop();
            this.service
                .adjustSort(
                    {
                        $MOVE_TYPE$: status,
                        [itemId]: tar.tableData[this.childMove.selectIndex][itemId],
                    },
                    setId
                )
                .subscribe(result => {
                    result.forEach(element => {
                        // tslint:disable-next-line:no-unused-expression
                        element[itemId];
                        const index = tar.tableData.findIndex(v => v[itemId] === element[itemId]);
                        tar.tableData[index] = element;
                    });
                    tar.tableData.sort((a, b) => {
                        return a.SYS_SORT - b.SYS_SORT;
                    });
                    tar.tableData = [...tar.tableData];
                });
        },
    };

    constructor(
        private service: PersonalDetailsService,
        private commonService: CommonService,
        private modalService: NzModalService,
        private activatedRoute: ActivatedRoute,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {}

    /**
     * 加载用户信息
     */
    loadPersonData() {
        const params = {};
        params[`${this.tableHelper.getTableCode('A01')}_ID`] = this.personBaseInfo[
            `${this.tableHelper.getTableCode('A01')}_ID`
        ];
        this.service.getPersonDataByID(params).subscribe(result => {
            this.personalInfo = result;
            this.loadPersonPhotoData();
            this.interfaceSchemeIfy._load();
        });
    }

    /**
     * 加载照片信息
     */
    loadPersonPhotoData() {
        this.service
            .getSetChildData(
                `${this.tableHelper.getTableCode('A01B')}`,
                this.personalInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
            )
            .subscribe(result => {
                console.log(result);
                if (!result) {
                    return;
                }
                this.personalBaseInfoIfy.src = `api/gl-file-service/photo/${result.A01BPATH}`;
            });
    }
}
