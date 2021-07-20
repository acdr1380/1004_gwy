import { Component, OnInit, Input } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'p-person-form-page',
    templateUrl: './person-form-page.component.html',
    styleUrls: ['./person-form-page.component.scss'],
})
export class PersonFormPageComponent implements OnInit {
    /**
     * 人员基本信息
     */
    _personBaseInfo: any;
    @Input() set personBaseInfo(v) {
        if (v) {
            this._personBaseInfo = v;
            console.dir('加载数据');
        }
    }
    get personBaseInfo() {
        return this._personBaseInfo;
    }

    constructor() {}

    ngOnInit() {}
}
