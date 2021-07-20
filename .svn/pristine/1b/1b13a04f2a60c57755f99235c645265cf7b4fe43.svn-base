import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IndexService } from './index.service';

@Component({
    selector: 'gl-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit, AfterViewInit {
    // 业务状态
    operStatusIfy = {
        list: [],

        loadList: async () => {
            this.operStatusIfy.list = await this.service.getWfListInfo().toPromise();
            this.operStatusIfy.loadOperCount();
        },
        loadOperCount: async () => {
            const result = await this.service.getByExcludingWfListCount().toPromise();
            this.operStatusIfy.list.forEach(item => {
                item.count = result[item.key];
                switch (item.value) {
                    case 1:
                        item.msg = `当前需要我办理的业务共计${item.count}条`;
                        break;
                    case 2:
                        item.msg = `其他用户协助办理的业务共计${item.count}条`;
                        break;
                    case 3:
                        item.msg = `我办理完成的业务共计${item.count}条`;
                        break;
                    case 4:
                        item.msg = `已作废${item.count}条`;
                        break;
                }
                return item;
            });
        },
        viewOperWorkbench: item => {
            this.router.navigate(['oper-workbench', { key: item.key }], {
                relativeTo: this.activatedRoute,
            });
        },
    };

    constructor(
        private service: IndexService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.operStatusIfy.loadList();
    }

    ngAfterViewInit(): void {}
}
