import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'gl-salary-gzda07-jbt-drawer',
    templateUrl: './salary-gzda07-jbt-drawer.component.html',
    styleUrls: ['./salary-gzda07-jbt-drawer.component.scss'],
})
export class SalaryGzda07JbtDrawerComponent implements OnInit {
    @Input() type: 'sy' | 'gwy' = 'gwy';
    @Input() params: { jobId: string; jobStepId: string; keyId: string };

    /**
     * 津补贴变动情况
     */
    personJBTChangeIfy = {
        visible: false,
        title: '津补贴变动情况',
        width: 480,
        close: () => (this.personJBTChangeIfy.visible = false),
        open: () => {
            this.personJBTChangeIfy.visible = true;
        },
    };

    constructor() {}

    ngOnInit(): void {
        console.dir(this.type);
    }

    open(params?) {
        if (params) {
            this.params = params;
        }
        this.personJBTChangeIfy.open();
    }

    close() {
        this.personJBTChangeIfy.close();
    }
}
