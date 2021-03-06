import {
    AfterViewInit,
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { OperSelectPersonComponent } from 'app/components/oper-select-person/oper-select-person.component';
import { SelectOrgDrawerComponent } from 'app/components/select-org/select-org-drawer/select-org-drawer.component';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { OrgTypeEnum } from 'app/entity/enums/OrgTypeEnum';
import { UserParameterTypeEnum } from 'app/entity/enums/UserParameterTypeEnum';
import { ClientService } from 'app/master-page/client/client.service';
import { CommonService } from 'app/util/common.service';
import { SettingFieldComponent } from './setting-field/setting-field.component';
import { SpecialRecruitmentService } from './special-recruitment.service';
import { Base64 } from 'js-base64';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'gl-special-recruitment',
    templateUrl: './special-recruitment.component.html',
    styleUrls: ['./special-recruitment.component.scss'],
})
export class SpecialRecruitmentComponent implements OnInit, AfterViewInit, OnDestroy {
    /** 用户登录参数 */
    session = this.commonService.getUserLoginInfo();

    zh_CN = {};

    /** 字段类型 */
    ColumnTypeEnum = ColumnTypeEnum;

    _A3709 = [
        { label: '985', value: '1' },
        { label: '211', value: '2' },
        { label: '其他', value: '3' },
    ];
    _A3710 = [
        { label: '一流大学', value: '1' },
        { label: '一流学科', value: '2' },
        { label: '否', value: '3' },
    ];

    /**
     * 顶部条件栏
     */
    headerConditionIfy = {
        //当前单位
        unit: <any>{},
        //是否包含下层
        isInclude: false,
        // 其他条件信息
        form: new FormGroup({
            A3702: new FormControl(null), // 招录年份
            A3708: new FormControl(null), // 招录身份
            A3704: new FormControl(null), // 招录类别
            A3701: new FormControl(null), // 招录生源地
            A3703: new FormControl(null), // 招录市县
            A3705: new FormControl(null), // 招录院校
            A3707: new FormControl(null), // 招录学历
            A3706: new FormControl(null), // 招录专业
            A3709: new FormControl(this._A3709), // 院校标识
            A3710: new FormControl(this._A3710), // 双一流标识
        }),
        reset: () => {
            this.headerConditionIfy.form.reset(
                {
                    A3709: this._A3709,
                    A3710: this._A3710,
                },
                { emitEvent: false }
            );
        },
    };

    /**
     * 人员库
     */
    pClassIfy = {
        index: 0,
        current: null,
        list: [],
        indexChange: async index => {
            this.pClassIfy.index = index;
            this.pClassIfy.current = this.pClassIfy.list[index];

            const _loading = this.loading.show();
            await this.personnelCategoryIfy._loadList();
            await this.personTableIfy._loadRows();
            _loading.close();
        },
        init: async () => {
            const data = this.getParams();
            const param = {
                ORG_B01_ID: this.headerConditionIfy.unit?.ORG_B01_ID,
                $TREE_INCLUDE_LOWER_LEVEL$: this.headerConditionIfy.isInclude,
                $FILTER_CONDITION$: data,
            };
            const res = await this.service.getPersonCount(param).toPromise();

            this.pClassIfy.list = [
                {
                    text: `在职人员(${res.ON_JOB})`,
                    value: '01',
                },
                {
                    text: `非在职人员(${res.NOT_JOB})`,
                    value: '02',
                },
            ];
        },

        // 搜索
        find: {
            placeholder: '输入关键字搜索',
            value: null,
            searchKey: new Subject<string>(),
            change: (value: string) => {
                this.pClassIfy.find.searchKey.next(value.trim());
            },
        },
    };

    /**
     * 招录类别
     */
    personnelCategoryIfy = {
        list: [],
        value: '1',
        valueChange: event => {
            this.personnelCategoryIfy.value = event;
            this.personTableIfy._loadRows();
        },
        _loadList: async () => {
            const data = this.getParams();
            const param = {
                DATA_UNIT_ORG_ID: this.headerConditionIfy.unit?.DATA_UNIT_ORG_ID,
                ORG_B01_ID: this.headerConditionIfy.unit?.ORG_B01_ID,
                $TREE_INCLUDE_LOWER_LEVEL$: this.headerConditionIfy.isInclude,
                $FILTER_CONDITION$: data,
                A0103: this.pClassIfy.current?.value,
            };
            // 获取A37统计信息
            const result = await this.service.getA37Count(param).toPromise();
            this.personnelCategoryIfy.list = result;
        },
    };

    /**
     * 人员表
     */
    personTableIfy = {
        rows: [],
        fields: [],
        pageIndex: 1,
        pageSize: 10,
        total: 0,
        loading: false,
        _loadRows: async () => {
            const data = this.getParams();
            const param = {
                A0103: this.pClassIfy.current?.value,
                A0101: this.pClassIfy.find.value,
                A3704: this.personnelCategoryIfy.value,
                ORG_B01_ID: this.headerConditionIfy.unit?.ORG_B01_ID,
                ORG_TYPE: this.headerConditionIfy.unit?.ORG_TYPE,
                $TREE_INCLUDE_LOWER_LEVEL$: this.headerConditionIfy.isInclude,
                $FILTER_CONDITION$: data,
                $PAGE_SIZE$: this.personTableIfy.pageSize,
                $PAGE_INDEX$: this.personTableIfy.pageIndex,
                VIEW_FIELD_TYPE: UserParameterTypeEnum.PERSON_VIEW_FIELD_CIVIL_DESIGNED,
            };
            this.personTableIfy.loading = true;
            const res = await this.service.getA37List(param).toPromise();
            this.personTableIfy.loading = false;
            if (res.code === 0) {
                this.personTableIfy.rows = res.data.result;
                if (res.data.pageIndex === 1) {
                    this.personTableIfy.total = res.data.totalCount;
                }
            }
        },
        delete: item => {
            const tableId = this.tableHelper.getTableCode('A01');
            const param = {};
            param[tableId + '_ID'] = item[tableId + '_ID'];
            const _loading = this.loading.show();
            this.service.deleteA37(param).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    this.loadPageData();
                }
            });
        },
        editor: item => {
            const GL = Base64.encode(JSON.stringify([item]));
            this.router.navigate(['./info', { GL: GL }], { relativeTo: this.activeRouter });
        },
    };

    hide: boolean = true;

    constructor(
        private service: SpecialRecruitmentService,
        private loading: LoadingService,
        private clientService: ClientService,
        private cdr: ChangeDetectorRef,
        private commonService: CommonService,
        private router: Router,
        private activeRouter: ActivatedRoute,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {
        // 创建面包屑导航
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'text',
                text: '系统功能',
            },
            {
                type: 'text',
                text: '专招管理',
            },
        ]);

        // 默认设置选中单位
        this.headerConditionIfy.unit.ORG_NAME = this.session.unitName;
        this.headerConditionIfy.unit.ORG_TYPE = OrgTypeEnum.UNIT;
        this.headerConditionIfy.unit.ORG_B01_ID = this.session.unitId;

        // 获取人员表格字段
        this.loadUserFields();

        this.loadPageData();

        this.pClassIfy.find.searchKey.pipe(debounceTime(500)).subscribe(_ => {
            this.personTableIfy._loadRows();
        });

        // 添加条件改变事件
        for (let key in this.headerConditionIfy.form.controls) {
            this.headerConditionIfy.form.get(key).valueChanges.subscribe(res => {
                this.loadPageData();
            });
        }
    }

    ngAfterViewInit(): void {
        this.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        this.clientService.clearBreadCrumb();
    }

    /** 获取参数对象 */
    getParams() {
        const data = this.headerConditionIfy.form.getRawValue();
        // 处理年份
        if (data.A3702) {
            data.A3702 = data.A3702.getFullYear();
        }

        // 处理多选checkBox
        data.A3709 = data.A3709.filter(x => x.checked).map(x => x.value);
        if (data.A3709.length === 0) {
            data.A3709 = null;
        }
        data.A3710 = data.A3710.filter(x => x.checked).map(x => x.value);
        if (data.A3710.length === 0) {
            data.A3710 = null;
        }
        return data;
    }

    async loadPageData() {
        const _loading = this.loading.show();
        // 加载人员库
        await this.pClassIfy.init();

        await this.personnelCategoryIfy._loadList();

        await this.personTableIfy._loadRows();
        _loading.close();
    }

    downFile() {
        const data = this.getParams();
        const params = {
            A0103: this.pClassIfy.current?.value,
            ORG_B01_ID: this.headerConditionIfy.unit?.ORG_B01_ID,
            ORG_TYPE: this.headerConditionIfy.unit?.ORG_TYPE,
            $TREE_INCLUDE_LOWER_LEVEL$: this.headerConditionIfy.isInclude,
            $FILTER_CONDITION$: data,
            $PAGE_SIZE$: this.personTableIfy.pageSize,
            $PAGE_INDEX$: this.personTableIfy.pageIndex,
            VIEW_FIELD_TYPE: UserParameterTypeEnum.PERSON_VIEW_FIELD_CIVIL_DESIGNED,
        };
        this.commonService.downFilePost(
            'api/gl-service-data-civil/v1/data/person/a37/outputExcelByOrgId',
            params
        );
    }

    @ViewChild('selectedOrgView') private selectedOrgViewEl: SelectOrgDrawerComponent;

    /** 打开选择单位抽屉 */
    openOrgDra() {
        this.selectedOrgViewEl.show();
    }

    /** 选择单位后回调 */
    selectOrgChange(event) {
        this.headerConditionIfy.isInclude = event.level;
        this.headerConditionIfy.unit = event.selectedNode;
        this.loadPageData();
    }

    /** 加载表格字段 */
    async loadUserFields() {
        if (!this.session) {
            return;
        }
        const param = {
            USER_PARAMETER_USER_ID: this.session.authId,
            USER_PARAMETER_TYPE: UserParameterTypeEnum.PERSON_VIEW_FIELD_CIVIL_DESIGNED,
        };
        const data = await this.service.getParameterData(param).toPromise();

        if (!!data && data.length !== 0) {
            const itemIds = data.map(x => x.TABLE_COLUMN_CODE);
            const result = await this.commonService
                .getSchemeContent('special-recruitment-fields')
                .toPromise();
            if (result) {
                this.personTableIfy.fields = this.getChemeSetItemInfo(result, itemIds);
            }
        } else {
            this.service.getSetItems(['A0101']).then(fields => {
                if (fields) {
                    this.personTableIfy.fields = fields.map(v => ({
                        ...v,
                        SCHEME_EDIT_DISPLAY_NAME: v.TABLE_COLUMN_NAME,
                        tableId: v.TABLE_COLUMN_CODE.slice(0, 3),
                    }));
                }
            });
        }
    }

    getChemeSetItemInfo(data, fields: any[]): any[] {
        const fieldsInfo: Array<any> = [];
        data.systemSchemeList.forEach(item => {
            item.systemSchemeEdit.forEach(field => {
                if (fields.indexOf(field.TABLE_COLUMN_CODE) > -1) {
                    fieldsInfo.push(field);
                }
            });
        });
        return fieldsInfo;
    }

    @ViewChild('settingFild') private settingFildEl: SettingFieldComponent;

    showFileds() {
        this.settingFildEl.show();
    }
    /** 字段回调 */
    filesChange(event) {
        this.personTableIfy.fields = event;
        this.personTableIfy._loadRows();
    }

    @ViewChild('selectPerson') private selectPersonEl: OperSelectPersonComponent;

    showSelectPerosn() {
        this.selectPersonEl.show();
    }

    /** 自定义导人方法 */
    importPerson(event) {
        const GL = Base64.encode(JSON.stringify(event));
        this.router.navigate(['./info', { GL: GL }], { relativeTo: this.activeRouter });
    }

    /** 打开人员信息 */
    showInfo() {
        this.router.navigate(['./info'], { relativeTo: this.activeRouter });
    }

    @ViewChild('parent') private parent: ElementRef;

    /**
     * 隐藏显示条件
     */
    toggleClick() {
        this.hide = !this.hide;
        // const parent = this.parent.nativeElement;
        // if (this.hide) {
        //     parent.style['border-bottom'] = '1px solid #eee';
        // } else {
        //     parent.style['border-bottom'] = 'none';
        // }
    }
}
