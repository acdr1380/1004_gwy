import { WfTableHelper } from './../../../util/classes/wf-table-helper';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { tap, filter, map } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PersonSalaryGwyService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    /**
     * 获得子集信息
     * @param TABLE_CODE 子集编码
     */
    getPersonChildData(TABLE_CODE, id) {
        const setId = TABLE_CODE.split('_').pop();
        let url1 = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/selectListKeyId`;
        const params = {};
        if (setId === 'A01') {
            url1 = 'api/gl-service-data-civil/v1/data/person/a01/selectOne';
            params[`${this.tableHelper.getTableCode('A01')}_ID`] = id;
        } else {
            params[`${this.tableHelper.getTableCode(setId)}_A01_ID`] = id;
        }
        const url2 =
            'api/gl-service-data-civil/v1/data/person/gz01/selectLastRowGZ01AndGZ02ByKeyId';
        return forkJoin([
            this.http.post<R>(url1, params),
            setId === 'A01' ? this.http.post<R>(url2, params) : of({ data: [] }),
        ]).pipe(
            map(([json1, json2]) => {
                const data = {};
                const result1 = json1.data;
                const result2 = json2.data;
                data[TABLE_CODE] = setId === 'A01' ? [{ ...result1, ...result2 }] : result1;
                return data;
            })
        );
    }
    /**
     * 获得子集信息
     *
     */
    getPersonSubsidy(TABLE_CODE, id) {
        const url = `api/gl-service-data-civil/v1/data/person/${TABLE_CODE.toLocaleLowerCase()}/selectListKeyId`;
        const tableId = `${this.tableHelper.getTableCode(TABLE_CODE)}_A01_ID`;
        return this.http
            .post<R>(url, { [tableId]: id })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
}
