import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { SalaryGZ07Component } from '../salary-gz07.component';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'salary-gz07-drawer',
    templateUrl: './salary-gz07-drawer.component.html',
    styleUrls: ['./salary-gz07-drawer.component.scss'],
})
export class SalaryGz07DrawerComponent implements OnInit {
    /**
     * 业务信息
     */
    @Input() jobStepInfo: JobStepInfo;

    @Input() keyId;
    @Input() type: 'sy' | 'gwy' = 'gwy';

    @ViewChild('salaryGZ07', { static: false }) salaryGZ07: SalaryGZ07Component;
    /**
     * 工资变迁抽屉
     */
    salaryGZ07DrawerIfy = {
        title: '工资变迁',
        width: 1340,
        visible: false,
        close: () => {
            this.salaryGZ07DrawerIfy.visible = false;
        },
        open: () => {
            this.salaryGZ07DrawerIfy.visible = true;
        },
    };
    constructor() {}

    ngOnInit() {}

    /**
     * 打开选择单位抽屉
     */
    show() {
        this.salaryGZ07.loadSalaryGZ07Data();
        this.salaryGZ07DrawerIfy.open();
    }
}
