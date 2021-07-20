import { Component, Input, OnInit } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'oper-salary-info-drawer',
    templateUrl: './oper-salary-info-drawer.component.html',
    styleUrls: ['./oper-salary-info-drawer.component.scss'],
})
export class OperSalaryInfoDrawerComponent implements OnInit {
    @Input() params;

    /**
     * 人员工资信息
     */
    operSalaryInfoDrawerIfy = {
        width: '100%',
        visible: false,
        title: '人员信息',
        close: () => {
            this.operSalaryInfoDrawerIfy.visible = false;
        },
        open: () => {
            this.operSalaryInfoDrawerIfy.visible = true;
        },
    };
    constructor() {}

    ngOnInit() {}

    /**
     * 展示人员工资信息
     */
    show() {
        this.operSalaryInfoDrawerIfy.open();
    }
}
