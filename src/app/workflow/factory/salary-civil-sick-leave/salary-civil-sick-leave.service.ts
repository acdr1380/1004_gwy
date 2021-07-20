import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SalaryCivilSickLeaveService {
    /**
     * 业务编码
     */
    public wfId = 'salary_civil_sick_leave';

    /**
     * 业务名称
     */
    public wfName = '长期病假业务(公务员)';

    constructor() {}
}
