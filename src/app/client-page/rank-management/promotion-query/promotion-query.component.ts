import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectOrgDrawerComponent } from 'app/components/select-org/select-org-drawer/select-org-drawer.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
    selector: 'gl-promotion-query',
    templateUrl: './promotion-query.component.html',
    styleUrls: ['./promotion-query.component.scss'],
})
export class PromotionQueryComponent implements OnInit {
    constructor(private message: NzMessageService) {}

    ngOnInit() {}

    @ViewChild('selectOrgDrawerElement', { static: false })
    selectOrgDrawerElement: SelectOrgDrawerComponent;

    /**
     * 选择单位
     */
    selectUnit = {
        unitName: '',
        level: false,
        selectUnitData: {},
        selectUnitShow: () => {
            this.selectOrgDrawerElement.show();
        },
        evtSelectOrgChange: event => {
            this.selectUnit.level = event.level;
            this.selectUnit.selectUnitData = event.selectedNode;
            this.selectUnit.unitName = event.selectedNode.title;
        },
    };

    /**
     * 查询
     */
    queryInfo = {
        jobLevel: [],
        startTime: null,
        endTime: null,
        startQuery: () => {
            if (!this.selectUnit.selectUnitData['key']) {
                this.message.warning('请选择单位');
                return;
            } else if (this.queryInfo.jobLevel?.length <= 0) {
                this.message.warning('请选择职级范围');
                return;
            } else if (!this.queryInfo.startTime || !this.queryInfo.endTime) {
                this.message.warning('请选择时间范围');
                return;
            }
            const query = {
                jobLevel: this.queryInfo.jobLevel,
                startTime: this.queryInfo.startTime,
                endTime: this.queryInfo.endTime,
            };
            console.log(query);
        },
        valueChange: event => {
            console.log(event);
        },
    };

    /**
     * 人员搜索
     */
    selectPerson = {
        selectedValue: null,
        listOfOption: [],
        nzFilterOption: true,
        search: value => {},
    };

    /**
     * 人员表格
     */
    personTable = {
        list: [],
        total: 0,
        pageIndex: 1,
        pageSize: 5,
        pageSizeOptions: [5, 10, 20, 50],
        nameClick: data => {},
    };

    /**
     * 下载
     */
    download() {
        console.log('下载');
    }
}
