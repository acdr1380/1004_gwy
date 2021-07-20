import { Component, Input, OnInit } from '@angular/core';
import { JBT as JBT_gwy } from './JBT_gwy';
import { JBT as JBT_sy } from './JBT_sy';
import { SalaryGzda07JbtService } from './salary-gzda07-jbt.service';

@Component({
    selector: 'gl-salary-gzda07-jbt',
    templateUrl: './salary-gzda07-jbt.component.html',
    styleUrls: ['./salary-gzda07-jbt.component.scss'],
})
export class SalaryGZDA07JBTComponent implements OnInit {
    _type: 'sy' | 'gwy' = 'gwy';
    @Input() set type(v) {
        this._type = v;
        console.dir(v);
    }
    get type() {
        return this._type;
    }

    _params: { jobId: string; jobStepId: string; keyId: string };
    @Input() set params(v) {
        if (!v || Object.keys(v).length === 0) {
            return;
        }
        this._params = v;
        this.loadTableData();
    }
    get params() {
        return this._params;
    }

    rowList = JBT_gwy;
    constructor(private service: SalaryGzda07JbtService) {}

    ngOnInit(): void {
        this.rowList = this.type === 'sy' ? JBT_sy : JBT_gwy;
        console.dir(this.type);
    }

    loadTableData() {
        const data = {
            jobId: this.params.jobId,
            jobStepId: this.params.jobStepId,
            keyIds: [this.params.keyId],
        };
        this.service.getWfListData(data).subscribe(result => {
            const [first] = result;
            this.rowList.forEach(item => {
                item[item.TABLE_COLUMN_CODE] = first[item.TABLE_COLUMN_CODE];
                item[`New${item.TABLE_COLUMN_CODE}`] = first[`New${item.TABLE_COLUMN_CODE}`];
                item[`New${item.TABLE_COLUMN_CODE}Change`] =
                    first[`New${item.TABLE_COLUMN_CODE}Change`];
            });
        });
    }
}
