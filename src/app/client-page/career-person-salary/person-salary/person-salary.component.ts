import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    ChangeDetectorRef,
} from '@angular/core';
import { PersonSalaryService } from './person-salary.service';
import { forkJoin, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { async } from '@angular/core/testing';
import { field } from './config/field';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'p-person-salary',
    templateUrl: './person-salary.component.html',
    styleUrls: ['./person-salary.component.scss'],
})
export class PersonSalaryComponent implements OnInit, AfterViewInit, OnDestroy {
    /**
     * 人员基本信息
     */
    _personBaseInfo: any = { A01: {} };

    field = field;
    @Input() set personBaseInfo(v) {
        if (v) {
            this._personBaseInfo = v;
            /**加载人员数据 */
            this.personTab.selectChange(0);
        }
    }
    get personBaseInfo() {
        return this._personBaseInfo;
    }
    constructor(
        private service: PersonSalaryService,
        private cdr: ChangeDetectorRef,
        private tableHelper: WfTableHelper
    ) {}

    /**页面等待 */
    pageLoading = false;
    @ViewChild('A01Temp', { static: false }) private A01TempElement: ElementRef;
    @ViewChild('TableTemp', { static: false }) private TableTempElement: ElementRef;
    @ViewChild('JBTTemp', { static: false }) private JBTTempElement: ElementRef;
    @ViewChild('GZA01Temp', { static: false }) private GZA01TempElement: ElementRef;
    /**顶部tab条 */
    personTab = {
        index: -1,
        list: [],
        selectChange: async index => {
            if (this.personTab.list.length <= 0 || !this.personBaseInfo) {
                return;
            }
            this.personTab.index = index;
            this.childTable.fileds = this.personTab.list[this.personTab.index].field;
            this.cdr.detectChanges();

            const keyId = this.personBaseInfo[`${this.tableHelper.getTableCode('A01')}_ID`];
            // 如果是A01 同时取GZA01
            if (this.personTab.list[this.personTab.index].value === 'A01') {
                this.pageLoading = true;
                const res_a01 = await this.service.getSetChildData('A01', keyId).toPromise();
                const res_gz01 = await this.service.getSetChildData('GZ01', keyId).toPromise();
                const res_gz02 = await this.service.getSetChildData('GZ02', keyId).toPromise();
                this.pageLoading = false;
                if (res_a01 && Object.keys(res_a01).length > 0) {
                    this.personBaseInfo.A01 = {
                        ...res_a01,
                        ...res_gz01?.find(x => x.IS_LAST_ROW),
                        ...res_gz02?.find(x => x.IS_LAST_ROW),
                    };
                    if (!this.personBaseInfo['GZDA07Last']) {
                        this.salaryTab.selectedIndexChange(0);
                    }
                }
                return;
            }

            if (!this.personBaseInfo[this.personTab.list[this.personTab.index].value]) {
                this.pageLoading = true;
                this.service
                    .getSetChildData(this.personTab.list[this.personTab.index].value, keyId)
                    .subscribe(res => {
                        this.pageLoading = false;
                        if (res) {
                            this.personBaseInfo[this.personTab.list[this.personTab.index].value] =
                                res;
                            if (!this.personBaseInfo['GZDA07Last']) {
                                this.salaryTab.selectedIndexChange(0);
                            }
                        }
                    });
            }
        },
    };

    /**人员基本信息表格 */
    childTable = {
        fileds: [],
        pageSize: 5,
        pageIndex: 1,
    };

    @ViewChild('GZDA07LastTemp', { static: false }) private GZDA07LastTempElement: ElementRef;
    @ViewChild('GZTableTemp', { static: false }) private GZTableTemp: ElementRef;
    /**工资信息Tab */
    salaryTab = {
        loading: false,
        index: 0,
        list: [],
        selectedIndexChange: index => {
            if (this.salaryTab.list.length <= 0) {
                return;
            }

            this.salaryTab.index = index;
            this.salaryTable.fileds = this.salaryTab.list[this.salaryTab.index].field;
            this.cdr.detectChanges();

            if (!this.personBaseInfo[this.salaryTab.list[this.salaryTab.index].value]) {
                switch (this.salaryTab.list[this.salaryTab.index].value) {
                    case 'GZDA07Last':
                        this.salaryTab.loading = true;
                        this.service
                            .getExcuteSituation(
                                this.personBaseInfo[`${this.tableHelper.getTableCode('A01')}_ID`],
                                this.personBaseInfo.A01.A0151
                            )
                            .subscribe(res => {
                                this.salaryTab.loading = false;
                                this.personBaseInfo[
                                    this.salaryTab.list[this.salaryTab.index].value
                                ] = res || {};
                            });
                        break;
                    default:
                        this.salaryTab.loading = true;
                        this.service
                            .getSetChildData(
                                this.salaryTab.list[this.salaryTab.index].value,
                                this.personBaseInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
                            )
                            .subscribe(res => {
                                this.salaryTab.loading = false;
                                this.personBaseInfo[
                                    this.salaryTab.list[this.salaryTab.index].value
                                ] = res;
                                this.evtResize();
                            });
                        break;
                }
            }
        },
    };

    /**工资基本变动表 */
    salaryTable = {
        pageIndex: 1,
        pageSize: 15,
        fileds: [],
        scorll: { x: '2000px', y: '1200px' },
    };

    // 津补贴信息
    subsidiesIfy = {
        visible: false,
        width: 600,
        title: '津补贴信息',
        scorll: {
            x: '1000px',
        },

        // 字段类型
        fieldType: 0,
        code: '',

        //表格字段
        fields: <any>[],

        tbl_rows_1: [],
        tbl_rows_2: [],

        open: (type: number, code: string) => {
            this.subsidiesIfy.fieldType = type;
            this.subsidiesIfy.code = code;
            this.subsidiesIfy.init();
            this.subsidiesIfy.visible = true;
        },
        close: () => {
            this.subsidiesIfy.visible = false;
        },
        init: async () => {
            const keyId = this.personBaseInfo[`${this.tableHelper.getTableCode('A01')}_ID`];
            const param = {};
            switch (this.subsidiesIfy.fieldType) {
                case 0:
                    this.subsidiesIfy.fields = this.field[0];
                    this.subsidiesIfy.tbl_rows_1 = await this.service
                        .getSetChildData('GZ40', keyId)
                        .toPromise();
                    // this.subsidiesIfy.tbl_rows_2 = await this.service
                    //     .getGz21aDate(param)
                    //     .toPromise();
                    this.subsidiesIfy.tbl_rows_2 = await this.service
                        .getSetChildData('GZ21A', keyId)
                        .toPromise();
                        this.subsidiesIfy.tbl_rows_2 = this.subsidiesIfy.tbl_rows_2.filter(x => x.GZ21A03 === this.subsidiesIfy.code);
                    break;
                case 1:
                    this.subsidiesIfy.fields = this.field[1];
                    this.subsidiesIfy.tbl_rows_1 = await this.service
                        .getSetChildData('GZ21A', keyId)
                        .toPromise();
                        this.subsidiesIfy.tbl_rows_1 = this.subsidiesIfy.tbl_rows_1.filter(x => x.GZ21A03 === this.subsidiesIfy.code);
                    break;
                case 2:
                    this.subsidiesIfy.fields = this.field[2];
                    this.subsidiesIfy.tbl_rows_1 = await this.service
                        .getSetChildData('GZ21A', keyId)
                        .toPromise();
                        this.subsidiesIfy.tbl_rows_1 = this.subsidiesIfy.tbl_rows_1.filter(x => x.GZ21A03 === this.subsidiesIfy.code);
                    break;
                case 3:
                    this.subsidiesIfy.fields = this.field[3];
                    this.subsidiesIfy.tbl_rows_1 = await this.service
                        .getSetChildData('GZ54', keyId)
                        .toPromise();
                    this.subsidiesIfy.tbl_rows_2 = await this.service
                        .getSetChildData('GZ21A', keyId)
                        .toPromise();
                        this.subsidiesIfy.tbl_rows_2 = this.subsidiesIfy.tbl_rows_2.filter(x => x.GZ21A03 === this.subsidiesIfy.code);
                    break;
            }
        },
    };

    @ViewChild('salaryHeight', { static: false }) private salaryHeightEl: ElementRef;
    ngOnInit() {
        fromEvent(window, 'resize').subscribe(() => this.evtResize());
    }

    ngAfterViewInit() {
        /**顶部tab条 */
        this.personTab.list = [
            {
                text: '人员基本信息',
                value: 'A01',
                el: this.A01TempElement,
                field: [],
            },
            {
                text: '学历信息',
                value: 'GZ01',
                el: this.TableTempElement,
                field: [
                    { text: '教育类别', item: 'GZ0107_CN' },
                    { text: '毕业时间', item: 'GZ0102', isTime: true },
                    { text: '学历', item: 'GZ0101_CN' },
                    { text: '学位', item: 'GZ0106_CN' },
                    { text: '毕业院校及专业', item: 'GZ0104' },
                    // { text: '学制', item: 'GZ0105' },
                ],
            },
            {
                text: '任职情况',
                value: 'GZ02',
                el: this.TableTempElement,
                field: [
                    { text: '任职时间', item: 'GZ0206', isTime: true },
                    { text: '办理时间', item: 'GZ0211', isTime: true },
                    { text: '岗位/技术等级', item: 'GZ0232_CN' },
                    { text: '职务名称', item: 'GZ0209' },
                    { text: '职务标识', item: 'GZ0203_CN' },
                    { text: '津补贴岗位', item: 'GZ0233_CN' },
                    { text: '变动说明', item: 'GZ0231' },
                ],
            },
            {
                text: '考核情况',
                value: 'GZ06',
                el: this.TableTempElement,
                field: [
                    { text: '考核年度', item: 'GZ0601' },
                    { text: '考核结果', item: 'GZ0602_CN' },
                ],
            },
            {
                text: '处分情况',
                value: 'GZ42',
                el: this.TableTempElement,
                field: [
                    { text: '起薪时间', item: 'GZ4201', isTime: true },
                    { text: '办理时间', item: 'GZ4205', isTime: true },
                    { text: '惩罚类别', item: 'GZ4203_CN' },
                    { text: '撤职级数', item: 'GZ4204' },
                    { text: '停薪时间', item: 'GZ4202', isTime: true },
                    { text: '变动依据', item: 'GZ4208' },
                ],
            },
            {
                text: '高低定情况',
                value: 'GZ09',
                el: this.TableTempElement,
                field: [
                    { text: '起薪时间', item: 'GZ0901', isTime: true },
                    { text: '办理时间', item: 'GZ0905', isTime: true },
                    { text: '高低定类型', item: 'GZ0903_CN' },
                    { text: '高低定值', item: 'GZ0904' },
                    { text: '停薪时间', item: 'GZ0902', isTime: true },
                    { text: '变动依据', item: 'GZ0908' },
                ],
            },
            {
                text: '津补贴信息',
                value: 'GZDA07Last',
                el: this.JBTTempElement,
                field: [],
            },
            {
                text: '工资标识信息',
                value: 'GZA01',
                el: this.GZA01TempElement,
                field: [],
            },
        ];

        /**人员工资信息 */
        this.salaryTab.list = [
            {
                text: '现执行情况',
                value: 'GZDA07Last',
                el: this.GZDA07LastTempElement,
                field: [],
            },
            {
                text: '工资变迁',
                value: 'GZ07',
                el: this.GZTableTemp,
                field: [
                    { text: '起薪时间', item: 'GZ0704', isTime: true },
                    { text: '办理时间', item: 'GZ0701', isTime: true },
                    { text: '变动原因', item: 'GZ0702' },
                    { text: '技术工等级', item: 'GZ0708_CN', items: ['GZ0710_CN', 'GZ0708_CN'] },
                    { text: '技术工等级工资', item: 'GZ0721', items: ['GZ0711_CN', 'GZ0709_CN'] },
                    { text: '岗位', item: 'GZ0710_CN' },
                    { text: '岗位工资', item: 'GZ0719' },
                    { text: '薪级', item: 'GZ0711_CN', items: ['GZ0720_CN', 'GZ0721_CN'] },
                    { text: '薪级工资', item: 'GZ0720' },
                    { text: '试用期工资', item: 'GZ0723' },
                    { text: '提高10%工资', item: 'GZ0729' },
                    { text: '浮动工资', item: 'GZ0722' },
                    { text: '津补贴合计', item: 'GZ0724' },
                    { text: '工资合计', item: 'GZ0734' },
                    { text: '增资额', item: 'GZ0742' },
                    // { text: '补发月数', item: 'GZ0745' },
                    // { text: '补发额', item: 'GZ0746' },
                    { text: '薪级起考年度', item: 'GZ0727' },
                    { text: '档次起考年度', item: 'GZ0726' },
                ],
                widthConfig: [
                    '60px',
                    '100px',
                    '100px',
                    '100px',
                    '160px',
                    '120px',
                    '120px',
                    '180px',
                    '100px',
                    '120px',
                    '100px',
                    '100px',
                    '100px',
                    '100px',
                    '100px',
                    '100px',
                    '100px',
                    '100px',
                ],
            },
            {
                text: '06年套改情况',
                value: 'GZ10',
                el: this.GZTableTemp,
                field: [
                    { text: '套改方法', item: 'GZ1001' },
                    { text: '套改年限', item: 'GZ1002' },
                    { text: '任职年限', item: 'GZ1003' },
                    { text: '技术工等级', item: 'GZ1007_CN' },
                    { text: '技术工等级工资', item: 'GZ1015_CN' },
                    { text: '岗位级别', item: 'GZ1008_CN' },
                    { text: '岗位工资', item: 'GZ1013' },
                    { text: '薪级', item: 'GZ1010_CN' },
                    { text: '薪级工资', item: 'GZ1014' },
                ],
                widthConfig: [
                    '60px',
                    '100px',
                    '100px',
                    '100px',
                    '160px',
                    '120px',
                    '120px',
                    '100px',
                    '100px',
                    '100px',
                ],
            },
            {
                text: '业务记录情况',
                value: 'GZDA07',
                el: this.GZTableTemp,
                field: [
                    { text: '起薪时间', item: 'GZDA0704', isTime: true },
                    { text: '办理时间', item: 'GZDA0704', isTime: true },
                    { text: '变动原因', item: 'GZDA0702' },
                    { text: '岗位级别/技术工等级', items: ['GZDA0710_CN', 'GZDA0708_CN'] },
                    { text: '薪级/岗位等次', items: ['GZDA0711_CN', 'GZDA0709_CN'] },
                    { text: '岗位工资', item: 'GZDA0719' },
                    { text: '薪级工资/技术工等级工资', items: ['GZDA0720_CN', 'GZDA0721_CN'] },
                    { text: '试用期工资', item: 'GZDA0723' },
                    { text: '提高10%工资', item: 'GZDA0729' },
                    { text: '津补贴合计', item: 'GZDA0724' },
                    { text: '工资合计', item: 'GZDA0730' },
                    { text: '增资额', item: 'GZDA0742' },
                    { text: '补发月数', item: 'GZDA0745' },
                    { text: '补发额', item: 'GZDA0746' },
                    { text: '薪级起考年度', item: 'GZDA0727' },
                    { text: '档次起考年限', item: 'GZDA0726' },
                ],
                widthConfig: [
                    '60px',
                    '100px',
                    '100px',
                    '100px',
                    '160px',
                    '120px',
                    '120px',
                    '180px',
                    '100px',
                    '120px',
                    '100px',
                    '100px',
                    '100px',
                    '100px',
                    '100px',
                    '100px',
                ],
            },
        ];
    }

    ngOnDestroy() {}

    /** 设置表格滚动高度 */
    evtResize() {
        this.salaryTable.scorll.y = `${this.salaryHeightEl.nativeElement.offsetHeight - 110}px`;
    }
}
