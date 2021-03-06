import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, filter, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Injectable({
    providedIn: 'root',
})
export class PersonSalaryService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    /**
     * 获得子集信息
     * @param TABLE_CODE 子集编码
     */
    getSetChildData(TABLE_CODE, id) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/${
            setId.toLocaleLowerCase() === 'a01' ? 'selectOneBySalary' : 'selectListKeyId'
        }`;
        const param = {};
        param[
            `${this.tableHelper.getTableCode(TABLE_CODE)}${setId !== 'A01' ? '_A01' : ''}_ID`
        ] = id;
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    getExcuteSituation(id: string, A0151: string) {
        const url = 'api/gl-service-data-civil/v1/data/person/gzda07/selectExcuteSituation';
        const data = {
            // DATA_1002_PERSON_GZDA07_A01_ID: id,
            A0151: A0151 || '',
        };
        data[`${this.tableHelper.getTableCode('GZDA07')}_A01_ID`] = id;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    getselectListByKeyId(id: string) {
        const url = 'api/gl-service-data-civil/v1/data/person/gz21a/selectListByKeyId';
        const data = {
            // DATA_1002_PERSON_GZ21A_A01_ID: id,
        };
        data[`${this.tableHelper.getTableCode('GZ21A')}_A01_ID`] = id;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取参公前学历
     */
    getByBeforeWork(id: string) {
        const url = 'api/gl-service-data-civil/v1/data/person/gz01/selectOneByBeforeWork';
        const params = {};
        params[`${this.tableHelper.getTableCode('A01')}_ID`] = id;
        return this.http.post<R>(url, params).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取参公后学历
     * @param Id 人员Id
     */
    getByAfterWorking(id: string) {
        const url = 'api/gl-service-data-civil/v1/data/person/gz01/selectListByAfterWorking';
        const params = {};
        params[`${this.tableHelper.getTableCode('A01')}_ID`] = id;
        return this.http.post<R>(url, params).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取人员工资变迁
     * @param id 人员id
     */
    getByBasicChanges(id: string) {
        const url = 'api/gl-service-data-civil/v1/data/person/gzda07/selectByBasicChanges';
        const params = {};
        params[`${this.tableHelper.getTableCode('GZDA07')}_A01_ID`] = id;
        return this.http.post<R>(url, params).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /** 津补贴反查 */
    getGz21aDate(param) {
        const url = `api/gl-service-data-civil/v1/data/person/gz21a/selectListByQuery`;
        return this.http.post<R>(url, param).pipe(
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
