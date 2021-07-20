import { CommonService } from 'app/util/common.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { FormPageService } from '../form-page.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'form-page-a0144-editor',
    templateUrl: './a0144-editor.component.html',
    styleUrls: ['./a0144-editor.component.scss'],
})
export class A0144EditorComponent implements OnInit {
    columnType = ColumnTypeEnum;

    /**
     * 人员信息
     */
    @Input() personInfo: any;

    @Output() updateFormChange = new EventEmitter<any>();

    /**
     * 入党时间 相关弹框
     */
    A0144EditorIfy = {
        // 抽屉内容
        width: 500,
        visible: false,
        title: '入党时间相关',
        close: () => {
            this.A0144EditorIfy.visible = false;
        },
        open: () => {
            this.A0144EditorIfy.load();
            this.A0144EditorIfy.visible = true;
        },

        key: 'A0144_Editor',
        list: <any>[],
        form: new FormGroup({}),

        data: {},
        evtGetTempOutParams: () => {
            return {
                formGroup: this.A0144EditorIfy.form,
                fields: this.A0144EditorIfy.list,
                inline: false,
                formData: this.A0144EditorIfy.data,
            };
        },

        load: () => {
            if (this.A0144EditorIfy.list.length > 0) {
                return;
            }
            this.commonService.getFieldSchemeConent(this.A0144EditorIfy.key).subscribe(result => {
                this.A0144EditorIfy.list = result.systemSchemeEdit.map(item => {
                    this.A0144EditorIfy.form.addControl(
                        item.TABLE_COLUMN_CODE,
                        new FormControl(null)
                    );
                    return item;
                });
                // this.A0144EditorIfy.data = this.personInfo;
                this.A0144EditorIfy.form.disable();
                this.A0144EditorIfy.form.patchValue(this.personInfo);
            });
        },
    };
    constructor(
        private commonService: CommonService,
        private service: FormPageService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    show() {
        this.A0144EditorIfy.open();
    }

    /**
     * 更新入党时间
     */
    evtUpdateData() {
        if (this.commonService.formVerify(this.A0144EditorIfy.form)) {
            const data = this.A0144EditorIfy.form.getRawValue();
            data.DATA_PERSON_A01_ID = this.personInfo.DATA_PERSON_A01_ID;
            // this.formPageService.updateChildData('DATA_PERSON_A01', data).subscribe(result => {
            //     this.isChange = true;
            //     this.A0144EditorIfy.close();
            // });
        }
    }
}
