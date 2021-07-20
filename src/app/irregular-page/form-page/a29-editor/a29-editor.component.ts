import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from 'app/util/common.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { A29EditorService } from './a29-editor.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'form-page-a29-editor',
    templateUrl: './a29-editor.component.html',
    styleUrls: ['./a29-editor.component.scss'],
})
export class A29EditorComponent implements OnInit {
    columnType = ColumnTypeEnum;
    SET_ID = 'A29';
    TABLE_CODE;
    TABLE_CODE_KEY;
    TABLE_CODE_A01_KEY;

    /**
     * 人员信息
     */
    @Input() personInfo: any = {};

    /**
     * 进入管理
     */
    A29EditorIfy = {
        // 抽屉内容
        width: 480,
        visible: false,
        title: '进入管理',
        close: () => {
            this.A29EditorIfy.visible = false;
        },
        open: () => {
            this.A29EditorIfy._init();
            this.A29EditorIfy.visible = true;
        },

        key: 'A29_Editor',
        list: <any[]>[],
        form: new FormGroup({}),
        _init: () => {
            if (this.A29EditorIfy.list.length > 0) {
                return;
            }
            this.commonService.getFieldSchemeConent(this.A29EditorIfy.key).subscribe(result => {
                this.A29EditorIfy.list = result.systemSchemeEdit.map(item => {
                    this.A29EditorIfy.form.addControl(
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

                this.A29EditorIfy.form.disable();
                this.A29EditorIfy._loadData();
            });
        },
        data: null,
        _loadData: () => {
            this.service.loadA29Data(this.personInfo[this.TABLE_CODE_A01_KEY]).subscribe(result => {
                this.A29EditorIfy.data = result;
                this.A29EditorIfy.form.patchValue(result);
            });
        },
        evtGetTempOutParams: () => {
            return {
                formGroup: this.A29EditorIfy.form,
                fields: this.A29EditorIfy.list,
                inline: false,
                formData: this.A29EditorIfy.data,
            };
        },
        evtSave: () => {
            if (this.commonService.formVerify(this.A29EditorIfy.form)) {
                const data = this.A29EditorIfy.form.getRawValue();
                data.DATA_PERSON_A29_A01_ID = this.personInfo.DATA_PERSON_A01_ID;
                this.service.saveA29Data(data).subscribe(result => {
                    this.A29EditorIfy.close();
                    this.A29EditorIfy.data = result;
                });
            }
        },
    };

    constructor(
        private commonService: CommonService,
        private service: A29EditorService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {
        this.TABLE_CODE = `${this.tableHelper.getTableCode(this.SET_ID)}`;
        this.TABLE_CODE_KEY = `${this.TABLE_CODE}_ID`;
        this.TABLE_CODE_A01_KEY = `${this.tableHelper.getTableCode('A01')}_ID`;
    }

    show() {
        this.A29EditorIfy.open();
    }
}
