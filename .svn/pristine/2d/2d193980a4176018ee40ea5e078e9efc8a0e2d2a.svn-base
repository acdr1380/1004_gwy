import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NzTreeNode } from 'ng-zorro-antd/tree';

@Component({
    selector: 'gl-unit-excel-view',
    templateUrl: './unit-excel-view.component.html',
    styleUrls: ['./unit-excel-view.component.scss'],
})
export class UnitExcelViewComponent implements OnInit, AfterViewInit {
    /** 当前选中节点 */
    private _node: NzTreeNode;
    @Input() set node(v) {
        if (v) {
            this._node = v;
            this.tabBarIfy.setParam();
        }
    }
    get node() {
        return this._node;
    }

    /** 是否包含下层 */
    private _isInclude: boolean;
    @Input() set isInclude(v) {
        this._isInclude = v;
        this.tabBarIfy.setParam();
    }
    get isInclude() {
        return this._isInclude;
    }

    /** 顶部表册切换 */
    tabBarIfy = {
        list: [],
        index: 0,
        current: null,
        indexChange: index => {
            this.tabBarIfy.index = index;
            this.tabBarIfy.current = this.tabBarIfy.list[index];
        },

        param: {},
        setParam: () => {
            this.tabBarIfy.param = {
                ...this.node.origin,
                isInclude: this.isInclude,
            }
        }
    };

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.tabBarIfy.list = [
            {
                title: '各单位编制与人员配备表',
                permission: 'tibet_person_allocate',
                getDataURL: 'api/gl-service-data-civil/v1/data/person/a01/tibetPersonAllocate'
            },
            {
                title: '各单位领导职数配备情况表',
                permission: 'tibet_lead_allocate',
                getDataURL: 'api/gl-service-data-civil/v1/data/person/a01/selectLeadPersonCount'
            },
        ];
        this.cdr.detectChanges();
    }
}
