import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { PersonOrderService } from './person-order.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'p-person-order',
    templateUrl: './person-order.component.html',
    styleUrls: ['./person-order.component.scss'],
})
export class PersonOrderComponent implements OnInit {
    /**
     * 页面参数
     */
    @Input() pageParams: any;

    @Output() updateChange = new EventEmitter<any>();

    @ViewChild('scrollOrderAdjust', { static: false })
    private _scrollOrderAdjust: CdkVirtualScrollViewport;

    // 人员顺序调整相关
    personOrderAdjustIfy = {
        title: '人员顺序调整',
        visible: false,
        width: 500,

        close: () => {
            this.personOrderAdjustIfy.find.searchKey = null;
            this.personOrderAdjustIfy.visible = false;
        },
        open: () => {
            this.personOrderAdjustIfy.visible = true;
        },

        find: {
            searchWidth: 170,
            placeholder: '输入姓名关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,
            evtChange: event => {
                const index = this.personOrderAdjustIfy.personList.data.findIndex(
                    v => v[`${this.tableHelper.getTableCode('A01')}_ID`] === event
                );

                this.personOrderAdjustIfy.personList.evtSelector(index);
                this._scrollOrderAdjust.scrollToIndex(index);
            },
            evtSearch: event => {
                if (event) {
                    this.personOrderAdjustIfy.find.searchList = this.personOrderAdjustIfy.personList.data
                        .filter(v => v.A0101.indexOf(event) > -1)
                        .map(v => ({
                            text: v.A0101,
                            value: v[`${this.tableHelper.getTableCode('A01')}_ID`],
                        }));
                }
            },
        },

        location: null,
        handle: {
            btnLoading: false,
            visible: false,
            // MOVE_UP(0, "上移"), MOVE_DOWN(1, "下移")
            evtMove: (direction: 0 | 1) => {
                if (this.personOrderAdjustIfy.personList.selectedIndex === 0 && direction === 0) {
                    this.message.warning('已经在顶部了。');
                    return;
                }
                if (
                    this.personOrderAdjustIfy.personList.selectedIndex ===
                        this.personOrderAdjustIfy.personList.data.length - 1 &&
                    direction === 1
                ) {
                    this.message.warning('已经在底部了。');
                    return;
                }
                this.personOrderAdjustIfy.handle.btnLoading = true;
                const item = this.personOrderAdjustIfy.personList.data[
                    this.personOrderAdjustIfy.personList.selectedIndex
                ];
                const data = {
                    $MOVE_TYPE$: direction,
                    // DATA_PERSON_A01_ID: item.DATA_PERSON_A01_ID,
                };
                data[`${this.tableHelper.getTableCode('A01')}_ID`] =
                    item[`${this.tableHelper.getTableCode('A01')}_ID`];
                this.service.adjustSort(data).subscribe(isSucceed => {
                    const index1 = this.personOrderAdjustIfy.personList.data.findIndex(
                        v =>
                            v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                            item[`${this.tableHelper.getTableCode('A01')}_ID`]
                    );
                    const index2 = direction === 0 ? index1 - 1 : index1 + 1;
                    this.personOrderAdjustIfy.personList.data.splice(index1, 1);
                    this.personOrderAdjustIfy.personList.data.splice(index2, 0, item);
                    this.personOrderAdjustIfy.personList.selectedIndex = index2;

                    this.personOrderAdjustIfy.handle.btnLoading = false;

                    this.updateChange.emit();
                });
            },

            evtVisibleChange: () => {
                this.personOrderAdjustIfy.location = null;
            },
            evtAffirm: () => {
                const index2 = this.personOrderAdjustIfy.location - 1;
                const item = this.personOrderAdjustIfy.personList.data[
                    this.personOrderAdjustIfy.personList.selectedIndex
                ];
                const data = {
                    $MOVE_POSITION$: this.personOrderAdjustIfy.location,
                    // DATA_PERSON_A01_ID: item.DATA_PERSON_A01_ID,
                };
                data[`${this.tableHelper.getTableCode('A01')}_ID`] =
                    item[`${this.tableHelper.getTableCode('A01')}_ID`];
                this.service.adjustSortTo(data).subscribe(isSucceed => {
                    if (isSucceed) {
                        const index1 = this.personOrderAdjustIfy.personList.data.findIndex(
                            v =>
                                v[`${this.tableHelper.getTableCode('A01')}_ID`] ===
                                item[`${this.tableHelper.getTableCode('A01')}_ID`]
                        );
                        this.personOrderAdjustIfy.personList.data.splice(index1, 1);
                        this.personOrderAdjustIfy.personList.data.splice(index2, 0, item);

                        this.personOrderAdjustIfy.personList.selectedIndex = index2;
                        this._scrollOrderAdjust.scrollToIndex(index2);
                        this.personOrderAdjustIfy.handle.visible = false;

                        this.updateChange.emit();
                    }
                });
            },
        },

        personList: {
            data: [],
            selectedIndex: -1,
            evtSelector: index => {
                this.personOrderAdjustIfy.personList.selectedIndex = index;
            },
            _loadList: () => {
                const data = {
                    ...this.pageParams,
                    $QUERY_FIELDS$: 'A0101,A0184',
                };
                this.service.getPersonList(data).subscribe(result => {
                    this.personOrderAdjustIfy.personList.data = result;
                });
            },
        },
    };

    constructor(
        private service: PersonOrderService,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    /**
     * 打开人员调整抽屉
     */
    show() {
        setTimeout(() => {
            this.personOrderAdjustIfy.personList._loadList();
        }, 1);
        this.personOrderAdjustIfy.open();
    }
}
