import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SalaryCivilRetireService {
    /**
     * 业务编码
     */
    public wfId = 'salary_civil_retire';

    /**
     * 业务名称
     */
    public wfName = '退休工资业务(公务员)';

    constructor() {}
}
