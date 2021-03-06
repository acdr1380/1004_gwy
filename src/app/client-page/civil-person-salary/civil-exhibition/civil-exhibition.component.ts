import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { ClientService } from 'app/master-page/client/client.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { CivilPersonSalaryService } from '../civil-person-salary.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Base64 } from 'js-base64';
import { yearSalaryFields } from './year-salary-fields';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Component({
    selector: 'app-civil-exhibition',
    templateUrl: './civil-exhibition.component.html',
    styleUrls: ['./civil-exhibition.component.scss'],
})
export class CivilExhibitionComponent implements OnInit, OnDestroy {
    /**
     * 页面参数
     */
    URLParams: any = {
        $PAGE_INDEX$: 0,
        $PAGE_SIZE$: 1,
        totalCount: 30,
        params: null,
        redirect: null,
    };

    salaryParams: any;
    formPageParams: any;
    salaryDetailsParams: any;

    personInfo: any;

    @ViewChild('personListView', { static: true })
    private personListView: CdkVirtualScrollViewport;

    /**
     * 搜索订阅者
     */
    private searchKey$ = new Subject<string>();

    /**
     * 人员列表
     */
    personListIfy = {
        find: {
            placeholder: '请输入业务标题关键字搜索',
            value: null,
            nzFilterOption: () => true,
            list: [],
            Parents: [],
            orgid: null,
            evtChange: value => {
                if (value === null) {
                    return;
                }
                const data = { ...this.URLParams.params };
                data[`${this.tableHelper.getTableCode('A01')}_ID`] = value;
                this.service.queryPersonRowNumber(data).subscribe(num => {
                    this.personListIfy.pageIndex =
                        // tslint:disable-next-line:radix
                        parseInt(num / this.personListIfy.pageSize + '') + 1;
                    this.personListIfy.selectedIndex = num % this.personListIfy.pageSize;
                    this.personListIfy.pageChange(false, true);
                });
            },
            evtSearch: event => {
                if (event) {
                    this.searchKey$.next(event.trim());
                }
            },
        },
        selectedIndex: -1,
        list: [],
        totalCount: 0,
        pageIndex: 1,
        pageSize: 30,
        pageChange: (isInit = false, isScroll = false) => {
            const params = {
                ...this.URLParams.params,
                $QUERY_FIELDS$: 'A0101,A0184',
                $PAGE_INDEX$: this.personListIfy.pageIndex,
                $PAGE_SIZE$: this.personListIfy.pageSize,
            };

            this.service.getPersonDataPage(params).subscribe(data => {
                this.personListIfy.list = data.result.map(item => ({ ...item, name: item.A0101 }));
                if (isInit) {
                    const index = data.result.findIndex(
                        item =>
                            item[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                            this.URLParams[`${this.tableHelper.getTableCode('A01')}_ID`]
                    );
                    this.personListIfy.selectedIndex = index;
                    this.personListIfy.pageIndex = data.pageIndex;
                    this.personListIfy.pageSize = data.pageSize;
                }
                this.personListIfy.evtSelectedPerson(this.personListIfy.selectedIndex);
                if (isScroll) {
                    setTimeout(() => {
                        this.personListView.scrollToIndex(this.personListIfy.selectedIndex);
                    }, 1);
                }
            });
        },
        evtSelectedPerson: index => {
            this.personListIfy.selectedIndex = index;
            const row = this.personListIfy.list[index];
            this.personInfo = {
                // DATA_PERSON_A01_ID: row.DATA_PERSON_A01_ID,
                A0101: row.A0101,
                A0184: row.A0184,
            };
            this.personInfo[`${this.tableHelper.getTableCode('A01')}_ID`] =
                row[`${this.tableHelper.getTableCode('A01')}_ID`];
            this.formPageParams = this.personInfo;
        },
    };

    /**
     * 模式
     */
    patternIfy = {
        list: [
            {
                text: '个人信息',
                value: 0,
            },
            {
                text: '年内工资信息',
                value: 1,
            },
        ],
        selectedIndex: 0,
        evtChange: ({ index }) => {
            const value = this.patternIfy.list[index].value;
            switch (value) {
                case 0:
                    break;
                case 1:
                    break;
            }
        },
    };

    yearSalaryInfoIfy = {
        fields: yearSalaryFields,
        result: [],
    };

    constructor(
        private clientService: ClientService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private service: CivilPersonSalaryService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {
        // 人员表格搜索
        this.searchKey$
            .pipe(
                // wait 300ms after each keystroke before considering the term
                debounceTime(100),

                // ignore new term if same as previous term
                distinctUntilChanged()
            )
            .subscribe(keyword => {
                const data = {
                    A0101: keyword.trim(),
                    ...this.URLParams.params,
                };
                this.service.queryPersonList(data).subscribe(result => {
                    this.personListIfy.find.list = result;
                });
            });
        this.loadRouterParams();
        this.loadBreadcrumbNav();
    }

    /**
     * 加载面包屑导航
     */
    loadBreadcrumbNav() {
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'event',
                text: '人员相关',
                event: () => {
                    // this.router.navigate(['/client/person-correl/person-manage']);
                    this.router.navigateByUrl(this.URLParams.redirect);
                },
            },
            {
                type: 'text',
                text: '人员详情',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 获取路由参数
     */
    loadRouterParams() {
        // 获取路由参数
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                this.personListIfy.totalCount = this.URLParams.totalCount;
                this.personListIfy.pageIndex = this.URLParams['$PAGE_INDEX$'];
                this.personListIfy.pageSize = this.URLParams['$PAGE_SIZE$'];
                this.personListIfy.pageChange(true, true);
            }
        });
    }
}
