import { ExcelControlComponent } from 'app/components/excel-control/excel-control.component';
import { FormPageService } from './form-page.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonService } from 'app/util/common.service';
import { environment } from 'environments/environment';
import { Base64 } from 'js-base64';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { FormControl, FormGroup } from '@angular/forms';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { FormEditTypeEnum } from 'app/components/excel-control/enums/FormEditTypeEnum';
import { A0144EditorComponent } from './a0144-editor/a0144-editor.component';
import { A02EditorComponent } from './a02-editor/a02-editor.component';
import { A14EditorComponent } from './a14-editor/a14-editor.component';
import { A15EditorComponent } from './a15-editor/a15-editor.component';
import { A29EditorComponent } from './a29-editor/a29-editor.component';
import { A30EditorComponent } from './a30-editor/a30-editor.component';
import { AppConfig } from 'app/app.config';
import { PopupEditorComponent } from './popup-editor/popup-editor.component';

@Component({
    selector: 'gl-form-page',
    templateUrl: './form-page.component.html',
    styleUrls: ['./form-page.component.scss'],
})
export class FormPageComponent implements OnInit {
    protected appSettings = AppConfig.settings;
    columnType = ColumnTypeEnum;
    isEdit = false;
    URLParams;
    personInfo;

    @ViewChild('A29EditorComponent', { static: false }) A29EditorComponent: A29EditorComponent;
    @ViewChild('A30EditorComponent', { static: false }) A30EditorComponent: A30EditorComponent;

    @ViewChild('popupEditorElement', { static: false }) popupEditorElement: PopupEditorComponent;

    @ViewChild('excelControlElement') excelControlElement: ExcelControlComponent;
    /**
     * 头部功能
     */
    headHandleIfy = {
        evtA29Editor: () => {
            this.A29EditorComponent.show();
        },
        evtA30Editor: () => {
            this.A30EditorComponent.show();
        },

        evtVerify: () => {
            const key = `${this.tableHelper.getTableCode('A01')}_ID`;
            this.service.checkExecute(this.URLParams[key]).subscribe(result => {
                if (result && result.length > 0) {
                    this.personVerifyIfy.table.data = result;
                    this.personVerifyIfy.open();
                }
            });
        },
        evtDown: () => {
            this.excelControlElement.down();
        },
        evtLrmx: () => {
            const key = `${this.tableHelper.getTableCode('A01')}_ID`;
            const params = {
                DATA_3001_PERSON_A01_IDS: [this.URLParams[key]],
            };
            this.service.downloadLrmx(params);
        },
    };

    /**
     * 人员信息校验
     */
    personVerifyIfy = {
        title: '人员信息校验',
        visible: false,
        width: 700,

        close: () => {
            this.personVerifyIfy.visible = false;
        },
        open: () => {
            this.personVerifyIfy.visible = true;
        },

        table: {
            data: [],
            checkRules: [],
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            BufferPx: 500,
            loading: false,

            selectedRowIndex: -1,
        },
    };

    /**
     * 人员其他信息
     */
    personOtherIfy = {
        list: [],

        key: 'person_other',
        _init: async () => {
            const result = await this.commonService
                .getFieldSchemeConent(this.personOtherIfy.key)
                .toPromise();
            this.personOtherIfy.list = result.systemSchemeEdit;
            this.personOtherIfy.loadData();
        },
        data: {},
        loadData: () => {
            const params: any = {};
            params.$QUERY_FIELDS$ = this.personOtherIfy.list
                .map(item => item.TABLE_COLUMN_CODE)
                .join(',');
            const key = `${this.tableHelper.getTableCode('A01')}_ID`;
            params[key] = this.URLParams[key];
            this.service.selectPersonOtherInfo(params).subscribe(result => {
                this.personOtherIfy.data = result;
            });
        },
    };

    @ViewChild('A0144EditorElement', { static: false }) A0144EditorElement: A0144EditorComponent;
    @ViewChild('A02AEditorElement', { static: false }) A02EditorComponent: A02EditorComponent;
    @ViewChild('A14EditorComponent', { static: false }) A14EditorComponent: A14EditorComponent;
    @ViewChild('A15EditorComponent', { static: false }) A15EditorComponent: A15EditorComponent;

    /**
     * 入党时间 相关弹框
     */
    A0144EditorIfy = {
        // 抽屉内容
        width: 420,
        visible: false,
        title: '入党时间相关',
        close: () => {
            this.A0144EditorIfy.visible = false;
        },
        open: () => (this.A0144EditorIfy.visible = true),

        key: 'A0144_Editor',
        list: <any>[],
        form: new FormGroup({}),

        data: {},
        load: () => {
            this.A0144EditorIfy.open();
            if (this.A0144EditorIfy.list.length > 0) {
                return;
            }
            this.commonService.getFieldSchemeConent(this.A0144EditorIfy.key).subscribe(result => {
                this.A0144EditorIfy.list = result.systemSchemeEdit.map(item => {
                    this.A0144EditorIfy.form.addControl(
                        item.TABLE_COLUMN_CODE,
                        // new FormControl({ value: null, disabled: this.isEdit })
                        new FormControl(null)
                    );
                    return item;
                });
                // this.A0144EditorIfy.data = this.personInfo;
                // this.A0144EditorIfy.form.patchValue(this.personInfo);
                this.A0144EditorIfy.form.disable();
            });
        },
        evtGetTempOutParams: () => {
            return {
                formGroup: this.A0144EditorIfy.form,
                fields: this.A0144EditorIfy.list,
                inline: false,
                formData: this.A0144EditorIfy.data,
            };
        },
    };

    constructor(
        private title: Title,
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService,
        private service: FormPageService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {
        this.title.setTitle(this.appSettings.appInsights.PROJECT_NAME);
        this.initRouterParams();
    }

    /**
     * 解析路由参数
     */
    initRouterParams() {
        // 获取路由参数
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));

                const key = `${this.tableHelper.getTableCode('A01')}_ID`;
                this.personInfo = await this.service
                    .getPersonDataByID(this.URLParams[key])
                    .toPromise();

                this.personOtherIfy._init();
            }
        });
    }

    /**
     * 表格点击事件
     */
    tdEventChange(event) {
        console.dir(event);
        // 格子是特殊编辑项
        switch (event.config.editType) {
            case FormEditTypeEnum.READONLY:
                break;
            case FormEditTypeEnum.GENERAL:
                break;
            case FormEditTypeEnum.POPUP:
                this.popupEditorElement.show(event.config);
                break;
            case FormEditTypeEnum.SPECIAL:
                this.loadSpecialEditor(event.config);
                break;
            case FormEditTypeEnum.PHOTO:
                break;
        }
    }

    /**
     * 特殊编辑框
     */
    loadSpecialEditor(config) {
        switch (config.editIdentifier) {
            case 'A0144_Editor':
                this.A0144EditorElement.show();
                break;
            case 'A0192A_Editor':
                this.A02EditorComponent.show();
                break;
            case 'A14_Editor':
                this.A14EditorComponent.show();
                break;
            case 'A15_Editor':
                this.A15EditorComponent.show();
                break;
        }
    }

    /**
     * 刷新子集信息
     */
    refChildData(event) {}
}
