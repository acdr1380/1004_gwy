import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SalaryHighLowService {
    /**
     * 业务编码
     */
    public wfId = 'salary_high_low';

    /**
     * 业务名称
     */
    public wfName = '高低定工资业务';
    constructor() {}
}
