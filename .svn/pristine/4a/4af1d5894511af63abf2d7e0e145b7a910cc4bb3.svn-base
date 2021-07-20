import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LoadingService } from 'app/components/loading/loading.service';
import { OrgTypeEnum_CN } from 'app/entity/enums/OrgTypeEnum';
import { UnitManageService } from '../unit-manage.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'unit-recover-view',
    templateUrl: './unit-recover-view.component.html',
    styleUrls: ['./unit-recover-view.component.scss'],
})
export class UnitRecoverViewComponent implements OnInit {
    /**
     * 找回触发
     */
    @Output() recoverChange = new EventEmitter();

    OrgTypeEnum_CN = OrgTypeEnum_CN;

    /**
     * 机构回收抽屉
     */
    recoverDra = {
        visible: false,
        title: '找回机构',
        width: 800,
        open: () => {
            this.recoverDra.visible = true;
            this.recoverDra.table.loadRows();
        },
        close: () => {
            this.recoverDra.visible = false;
            this.recoverDra.table.pageIndex = 1;
            this.recoverDra.table.pageSize = 10;
        },
        table: {
            pageIndex: 1,
            pageSize: 10,
            total: 0,
            rows: [],
            loading: false,
            loadRows: () => {
                const param = {
                    $PAGE_SIZE$: this.recoverDra.table.pageSize,
                    $PAGE_INDEX$: this.recoverDra.table.pageIndex,
                };

                this.recoverDra.table.loading = true;
                this.service.getUnitForDelete(param).subscribe(res => {
                    this.recoverDra.table.loading = false;
                    if (res.data) {
                        if (res.data.pageIndex === 1) {
                            this.recoverDra.table.total = res.data.totalCount;
                        }
                        this.recoverDra.table.rows = res.data.result;
                    }
                });
            },
        },
    };

    constructor(private service: UnitManageService, private loading: LoadingService) {}

    ngOnInit() {}

    /**
     * 找回机构
     * @param item 要找回的机构
     */
    recoverUnit(item) {
        const param = {
            DATA_UNIT_ORG_ID: item.DATA_UNIT_ORG_ID,
            ORG_GROUP_ID: item.ORG_GROUP_ID,
            SYS_PARENT: item.SYS_PARENT,
        };
        const _loading = this.loading.show();
        this.service.undoDelete(param).subscribe(res => {
            _loading.close();
            if (res.code === 0) {
                this.recoverChange.emit({
                    ...res.data,
                    title: res.data.ORG_NAME,
                    key: res.data.DATA_UNIT_ORG_ID,
                    isLeaf: !res.data.SYS_HAVE_CHILD,
                    nodeType: res.data.ORG_TYPE,
                });
                this.recoverDra.close();
            }
        });
    }

    public show() {
        this.recoverDra.open();
    }
}
