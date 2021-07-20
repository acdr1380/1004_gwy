import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SalaryCivilPostChangeService {
    /**
     * 业务编码
     */
    public wfId = 'salary_civil_post_change';

    /**
     * 业务名称
     */
    public wfName = '职务变动工资业务';

    constructor() {}
}
