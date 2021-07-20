import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SalaryRetireService {
    /**
     * 业务编码
     */
    public wfId = 'salary_retire';

    /**
     * 业务名称
     */
    public wfName = '退休工资业务';

    constructor() {}
}
