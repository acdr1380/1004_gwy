import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Base64 } from 'js-base64';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ClientService } from 'app/master-page/client/client.service';
import { CareerPersonSalaryService } from '../career-person-salary.service';

@Component({
    selector: 'app-person-exhibition',
    templateUrl: './person-exhibition.component.html',
    styleUrls: ['./person-exhibition.component.scss'],
})
export class PersonExhibitionComponent implements OnInit, OnDestroy {
    /**
     * 页面参数
     */
    URLParams: any = {
        // DATA_PERSON_A01_ID: null,
        $PAGE_INDEX$: 0,
        $PAGE_SIZE$: 1,
        totalCount: 30,
        params: null,
        redirect: null,
    };

    // DATA_PERSON_A01_ID: data.DATA_PERSON_A01_ID,
    // A0101: data.A0101,
    // A0184: data.A0184,
    salaryParams: any;
    formPageParams: any;
    salaryDetailsParams: any;

    personInfo: any;
    /**
     * 模式
     */
    patternIfy = {
        list: [

            {
                text: '工资信息',
                value: 0,
            },

            // 隐藏个人信息和列表模式
            // {
            //     text: '个人信息',
            //     value: 1,
            // },
            // {
            //     text: '列表模式',
            //     value: 2,
            // },
        ],
        selectedIndex: 0,
        evtChange: ({ index }) => {
            const value = this.patternIfy.list[index].value;
            switch (value) {
                case 0:
                    this.salaryParams = this.personInfo;
                    break;
                case 1:
                    this.formPageParams = this.personInfo;
                    break;
                case 2:
                    this.salaryDetailsParams = this.personInfo;
                    break;
            }
        },
    };

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
            this.patternIfy.evtChange({ index: this.patternIfy.selectedIndex });
        },
    };

    constructor(
        private clientService: ClientService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private service: CareerPersonSalaryService,
        private tableHelper: WfTableHelper
    ) { }

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
