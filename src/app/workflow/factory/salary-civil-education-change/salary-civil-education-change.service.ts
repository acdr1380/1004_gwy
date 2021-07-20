import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SalaryCivilEducationChangeService {
    /**
     * 业务编码
     */
    public wfId = 'salary_civil_education_change';

    /**
     * 业务名称
     */
    public wfName = '学历变动工资业务';

    constructor() {}
}
