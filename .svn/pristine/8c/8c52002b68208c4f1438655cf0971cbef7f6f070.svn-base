import { CommonService } from './../../../util/common.service';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { A30EditorService } from './a30-editor.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'form-page-a30-editor',
    templateUrl: './a30-editor.component.html',
    styleUrls: ['./a30-editor.component.scss'],
})
export class A30EditorComponent implements OnInit {
    columnType = ColumnTypeEnum;
    SET_ID = 'A30';
    TABLE_CODE;
    TABLE_CODE_KEY;
    TABLE_CODE_A01_KEY;

    /**
     * 人员信息
     */
    @Input() personInfo: any = {};

    /**
     * 退出管理
     */
    A30EditorIfy = {
        // 抽屉内容
        width: 480,
        visible: false,
        title: '退出管理',
        close: () => {
            this.A30EditorIfy.visible = false;
        },
        open: () => {
            this.A30EditorIfy._init();
            this.A30EditorIfy.visible = true;
        },
        key: 'A30_Editor',
        list: <any[]>[],
        form: new FormGroup({}),
        _init: () => {
            if (this.A30EditorIfy.list.length > 0) {
                return;
            }
            this.commonService.getFieldSchemeConent(this.A30EditorIfy.key).subscribe(result => {
                this.A30EditorIfy.list = result.systemSchemeEdit.map(item => {
                    this.A30EditorIfy.form.addControl(
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
                this.A30EditorIfy.form.disable();
                this.A30EditorIfy._loadData();
            });
        },
        data: null,
        _loadData: () => {
            this.service.loadA30Data(this.personInfo[this.TABLE_CODE_A01_KEY]).subscribe(result => {
                this.A30EditorIfy.data = result;
                this.A30EditorIfy.form.patchValue(result);
            });
        },
        evtGetTempOutParams: () => {
            return {
                formGroup: this.A30EditorIfy.form,
                fields: this.A30EditorIfy.list,
                inline: false,
                formData: this.A30EditorIfy.data,
            };
        },
        evtSave: () => {
            if (this.commonService.formVerify(this.A30EditorIfy.form)) {
                const data = this.A30EditorIfy.form.getRawValue();
                data.DATA_PERSON_A30_A01_ID = this.personInfo.DATA_PERSON_A01_ID;
                this.service.saveA30Data(data).subscribe(result => {
                    this.A30EditorIfy.close();
                    this.A30EditorIfy.data = result;
                });
            }
        },
    };

    constructor(
        private commonService: CommonService,
        private service: A30EditorService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {
        this.TABLE_CODE = `${this.tableHelper.getTableCode(this.SET_ID)}`;
        this.TABLE_CODE_KEY = `${this.TABLE_CODE}_ID`;
        this.TABLE_CODE_A01_KEY = `${this.tableHelper.getTableCode('A01')}_ID`;
    }

    show() {
        this.A30EditorIfy.open();
    }
}
