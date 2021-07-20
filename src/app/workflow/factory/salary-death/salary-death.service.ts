import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SalaryDeathService {
    /**
     * 业务编码
     */
    public wfId = 'salary_death';

    /**
     * 业务名称
     */
    public wfName = '死亡工资业务';

    constructor() {}
}
