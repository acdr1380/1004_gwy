import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SalaryCivilDefineLevelService {
    /**
     * 业务编码
     */
    public wfId = 'salary_civil_define_level';

    /**
     * 业务名称
     */
    public wfName = '转正定级工资业务（公务员）';

    constructor() {}
}
