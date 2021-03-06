import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import * as moment from 'moment';
import { PersonSalaryGwyService } from './person-salary-gwy.service';
import { SalaryFields } from './fields';
import { AllowFields } from './allowance-field/fields';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'p-person-salary-gwy',
    templateUrl: './person-salary-gwy.component.html',
    styleUrls: ['./person-salary-gwy.component.scss'],
})
export class PersonSalaryGwyComponent implements OnInit, AfterViewInit {
    isUpFullScreen = false;
    isDownFullScreen = false;

    /**
     * 人员基本信息
     */
    _personBaseInfo: any;
    @Input() set personBaseInfo(v) {
        if (v) {
            this._personBaseInfo = v;
            this.personBaseInfoIfy.tabs.setChange();
            this.personsalaryInfoIfy.tabs.setChange();
            this.subsidyInformation.personAllSub = null;
        }
    }
    get personBaseInfo() {
        return this._personBaseInfo;
    }

    wfInfo;

    /**
     * 人员基本信息
     */
    personBaseInfoIfy = {
        TABLE_DISPLAY_CODE: 'A01',
        tabs: {
            setList: <any>[
                {
                    TABLE_DISPLAY_CODE: 'A01',
                    TABLE_CODE: `${this.tableHelper.getTableCode('A01')}`,
                    TABLE_NAME: '个人信息',
                    showMain: true,
                    isMain: true,
                },
                {
                    TABLE_DISPLAY_CODE: 'GZ01',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZ01')}`,
                    TABLE_NAME: '学历情况',
                },
                {
                    TABLE_DISPLAY_CODE: 'GZ02',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZ02')}`,
                    TABLE_NAME: '任职情况',
                },
                {
                    TABLE_DISPLAY_CODE: 'GZ06',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZ06')}`,
                    TABLE_NAME: '考核情况',
                },
                {
                    TABLE_DISPLAY_CODE: 'GZ42',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZ42')}`,
                    TABLE_NAME: '处分情况',
                },
                {
                    TABLE_DISPLAY_CODE: 'GZ09',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZ09')}`,
                    TABLE_NAME: '高低定情况',
                },
                {
                    TABLE_DISPLAY_CODE: 'JBT',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZDA07')}`,
                    TABLE_NAME: '津补贴信息',
                    showMain: true,
                    isMain: false,
                },
            ],
            _init: () => {
                this.personBaseInfoIfy.tabs.setList.forEach(item => {
                    item.fields = SalaryFields[item.TABLE_DISPLAY_CODE];
                    item.pageIndex = 1;
                    item.result = [];
                });
            },
            setChange: () => {
                const item = this.personBaseInfoIfy.tabs.setList.find(
                    v => v.TABLE_DISPLAY_CODE === this.personBaseInfoIfy.TABLE_DISPLAY_CODE
                );
                if (item) {
                    this.loadPersonData(item.TABLE_CODE);
                }
            },
        },
    };

    /**
     * 人员工资信息
     */
    personsalaryInfoIfy = {
        TABLE_DISPLAY_CODE: 'GZDA07',
        tabs: {
            setList: <any>[
                {
                    TABLE_DISPLAY_CODE: 'GZDA07',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZDA07')}`,
                    TABLE_NAME: '现执行工资',
                    showMain: true,
                    isMain: false,
                },
                {
                    TABLE_DISPLAY_CODE: 'GZ07',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZ07')}`,
                    TABLE_NAME: '工资变迁',
                },
                {
                    TABLE_DISPLAY_CODE: 'GZ10',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZ10')}`,
                    TABLE_NAME: '套改情况',
                },
                {
                    TABLE_DISPLAY_CODE: 'GZDA07_OLD',
                    TABLE_CODE: `${this.tableHelper.getTableCode('GZDA07')}`,
                    TABLE_NAME: '业务记录',
                },
            ],
            _init: () => {
                this.personsalaryInfoIfy.tabs.setList.forEach(item => {
                    item.fields = SalaryFields[item.TABLE_DISPLAY_CODE];
                    item.result = [];
                    item.pageIndex = 1;
                });
            },
            setChange: () => {
                const item = this.personsalaryInfoIfy.tabs.setList.find(
                    v => v.TABLE_DISPLAY_CODE === this.personsalaryInfoIfy.TABLE_DISPLAY_CODE
                );
                if (item) {
                    this.loadPersonData(item.TABLE_CODE);
                }
            },
        },
    };

    // 业务记录对比
    recordComparativeIfy = {
        scrollConfig: { x: '3500px', y: '600px' },
        pageIndex: 1,
        widthConfig: [
            // 变动前
            '60px',
            '100px',
            '140px',
            '150px',
            '100px',
            '140px',
            '100px',
            '100px',
            '100px',
            '100px',
            '100px',
            '100px',
            '100px',
            // 变动后
            '100px',
            '140px',
            '150px',
            '100px',
            '100px',
            '100px',
            '100px',
            '100px',
            '100px',
            '100px',
            '100px',
            '100px',
        ],
    };
    allowFields = AllowFields;
    /**
     *
     *  津补贴
     */
    subsidyInformation = {
        visible: false,
        width: 500,
        data: [],
        dataSpecial: [],
        headerList: [],
        headerListSpecial: [],
        title: '',
        nzPageIndex: 1,
        open: row => {
            this.subsidyInformation.title = row.TABLE_COLUMN_NAME;
            this.subsidyInformation.status = row;
            this.subsidyInformation.headerListSpecial = this.allowFields.GZ21A;
            this.subsidyInformation.getPersonData({
                ...row,
                SON_TABLE_FIELD: 'GZ21A',
            });
            this.subsidyInformation.headerList = this.allowFields[row.SON_TABLE_FIELD];
            this.subsidyInformation.visible = true;
            this.subsidyInformation.getPersonData(row);
        },
        close: () => {
            this.subsidyInformation.visible = false;
        },
        /**
         * 单个人员所有津补贴数据
         */
        personAllSub: null,
        /**
         * 当前标识
         */
        status: {
            IS_SHOW_TYPE: 1,
        },
        /**
         * 获取人员数据
         */
        getPersonData: row => {
            if (
                this.subsidyInformation.personAllSub &&
                this.subsidyInformation.personAllSub[row.SON_TABLE_FIELD]
            ) {
                this.subsidyInformation.filterPerson(row);
                return;
            }
            this.service
                .getPersonSubsidy(
                    row.SON_TABLE_FIELD,
                    this.personBaseInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
                )
                .subscribe(result => {
                    this.subsidyInformation.personAllSub = {
                        ...this.subsidyInformation.personAllSub,
                        [row.SON_TABLE_FIELD]: result,
                    };
                    this.subsidyInformation.filterPerson(row);
                });
        },
        /**
         * 筛选数据
         */
        filterPerson: row => {
            const tableData = this.subsidyInformation.personAllSub[row.SON_TABLE_FIELD];

            if (row.SON_TABLE_FIELD === 'GZ21A') {
                const value = row.TABLE_COLUMN_CODE.substr(6);
                this.subsidyInformation.data = tableData.filter(v => v.GZ21A03 === value);
            } else {
                if (row.IS_SHOW_TYPE === 0) {
                    const value = row.TABLE_COLUMN_CODE.substr(6);
                    if (this.subsidyInformation.personAllSub.GZ21A) {
                        this.subsidyInformation.dataSpecial = this.subsidyInformation.personAllSub.GZ21A.filter(
                            v => v.GZ21A03 === value
                        );
                    } else {
                        this.subsidyInformation.dataSpecial = [];
                    }
                }
                this.subsidyInformation.data = tableData;
            }
        },
    };
    constructor(private service: PersonSalaryGwyService, private tableHelper: WfTableHelper) {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.personBaseInfoIfy.tabs._init();
        this.personsalaryInfoIfy.tabs._init();
    }

    /**
     * 加载人员数据
     */
    loadPersonData(TABLE_CODE) {
        // if (this.wfInfo) {
        //     this.buildPersonData();
        //     return;
        // }
        // const childFields = {};
        this.service
            .getPersonChildData(
                TABLE_CODE,
                this.personBaseInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
            )
            .pipe(
                map(result => {
                    let fields = [];
                    for (const key in SalaryFields) {
                        if (SalaryFields.hasOwnProperty(key)) {
                            fields = fields.concat(SalaryFields[key]);
                        }
                    }
                    for (const key in result) {
                        if (result.hasOwnProperty(key)) {
                            result[key].forEach(row => {
                                for (const c in row) {
                                    if (row.hasOwnProperty(c)) {
                                        const item = fields.find(v => v.TABLE_COLUMN_CODE === c);
                                        if (
                                            item &&
                                            item.TABLE_COLUMN_TYPE === ColumnTypeEnum.DATE &&
                                            moment(row[c]).isValid()
                                        ) {
                                            row[c] = moment(row[c]).format('YYYY-MM-DD');
                                        }
                                    }
                                }
                            });
                        }
                    }
                    return result;
                })
            )
            .subscribe(result => {
                this.wfInfo = result;
                this.buildPersonData();
                // if (this.personBaseInfoIfy.TABLE_DISPLAY_CODE === 'JBT') {
                //     this.subsidyInformation.structureSubsidy();
                // }
            });
    }

    /**
     * 构建个人数据
     */
    buildPersonData() {
        const tableList = this.personBaseInfoIfy.tabs.setList.concat(
            this.personsalaryInfoIfy.tabs.setList
        );

        tableList.forEach(item => {
            const data = this.wfInfo[item.TABLE_CODE];
            if (item && data) {
                // 主集取数
                if (item.showMain && item.isMain) {
                    item.result =
                        data.find(
                            v =>
                                v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                this.personBaseInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
                        ) || {};
                }

                // 子集取最后一条显示
                if (item.showMain && !item.isMain) {
                    const fields = SalaryFields[item.TABLE_DISPLAY_CODE] || [];
                    item.result = data.find(
                        v =>
                            v[`${item.TABLE_CODE}_A01_ID`] ===
                                this.personBaseInfo[`${this.tableHelper.getTableCode('A01')}_ID`] &&
                            v.IS_LAST_ROW
                    );
                    if (item.result) {
                        fields.forEach(f => {
                            if (f.TABLE_COLUMN_CODE.indexOf('|') > 0) {
                                if (f.TABLE_COLUMN_CODE_UNION) {
                                    item.result[f.TABLE_COLUMN_CODE] =
                                        (item.result[`${f.TABLE_COLUMN_CODE.split('|')[0]}_CN`] ||
                                            '') +
                                        ' ' +
                                        (item.result[`${f.TABLE_COLUMN_CODE.split('|')[1]}_CN`] ||
                                            '');
                                } else {
                                    item.result[f.TABLE_COLUMN_CODE] =
                                        (item.result[f.TABLE_COLUMN_CODE.split('|')[0]] || '') +
                                        ' ' +
                                        (item.result[f.TABLE_COLUMN_CODE.split('|')[1]] || '');
                                }
                            }
                        });

                        return;
                    }
                    item.result = {};
                }

                // 子集所有记录
                if (!item.showMain) {
                    const fields = SalaryFields[item.TABLE_DISPLAY_CODE] || [];
                    item.result = data
                        .filter(
                            v =>
                                v[`${item.TABLE_CODE}_A01_ID`] ===
                                this.personBaseInfo[`${this.tableHelper.getTableCode('A01')}_ID`]
                        )
                        .map(row => {
                            fields.forEach(f => {
                                if (f.TABLE_COLUMN_CODE.indexOf('|') > 0) {
                                    if (f.TABLE_COLUMN_CODE_UNION) {
                                        if (item.TABLE_DISPLAY_CODE === 'GZDA07_OLD') {
                                            row[f.TABLE_COLUMN_CODE] =
                                                (row[
                                                    f.TABLE_COLUMN_CODE.split('|')[0].split(
                                                        '_'
                                                    )[0] + '_CN_OLD'
                                                ] || '') +
                                                ' ' +
                                                (row[
                                                    f.TABLE_COLUMN_CODE.split('|')[1].split(
                                                        '_'
                                                    )[0] + '_CN_OLD'
                                                ] || '');
                                        } else {
                                            row[f.TABLE_COLUMN_CODE] =
                                                (row[f.TABLE_COLUMN_CODE.split('|')[0] + '_CN'] ||
                                                    '') +
                                                ' ' +
                                                (row[f.TABLE_COLUMN_CODE.split('|')[1] + '_CN'] ||
                                                    '');
                                        }
                                    } else {
                                        row[f.TABLE_COLUMN_CODE] =
                                            (row[f.TABLE_COLUMN_CODE.split('|')[0]] || '') +
                                            ' ' +
                                            (row[f.TABLE_COLUMN_CODE.split('|')[1]] || '');
                                    }
                                }
                            });
                            return row;
                        });
                }
            }
        });
    }

    evtArrows(direction) {
        if (direction === 'up') {
            this.isUpFullScreen = !this.isUpFullScreen;
        }
        if (direction === 'down') {
            this.isDownFullScreen = !this.isDownFullScreen;
        }
    }
    /**
     * 改变页码
     */
    pageIndexChange(event, status) {
        const index = this.personBaseInfoIfy.tabs.setList.findIndex(
            v => v.TABLE_DISPLAY_CODE === status
        );
        if (index > -1) {
            this.personBaseInfoIfy.tabs.setList[index].pageIndex = event;
            return;
        }
        const index2 = this.personsalaryInfoIfy.tabs.setList.findIndex(
            v => v.TABLE_DISPLAY_CODE === status
        );
        this.personsalaryInfoIfy.tabs.setList[index2].pageIndex = event;
    }
}
