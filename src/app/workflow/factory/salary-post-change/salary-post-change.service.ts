import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SalaryPostChangeService {
    /**
     * 业务编码
     */
    public wfId = 'salary_post_change';

    /**
     * 业务名称
     */
    public wfName = '岗位变动工资业务';

    constructor() {}
}
