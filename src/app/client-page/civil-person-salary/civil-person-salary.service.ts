import { Injectable } from '@angular/core';
import { CommonService } from 'app/util/common.service';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Injectable({
    providedIn: 'root',
})
export class CivilPersonSalaryService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService,
        private tableHelper: WfTableHelper
    ) {}

    /**
     * 获得人员库已经统计
     */
    selectListByA0103Count(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectListByA0103Count';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => ({
                    ...item,
                    label: item.A0103_CN,
                    text: item.A0103_CN,
                    value: item.A0103,
                }))
            )
        );
    }

    /**
     * 获得人员数据
     * @param id 编码
     */
    getPersonDataPage(params) {
        const url = `api/gl-service-data-civil/v1/data/person/a01/selectPageByOrgId`;
        return this.http.post<R>(url, params).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 查询人员定位
     * @param data 参数
     */
    queryPersonRowNumber(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectByQueryForRowNumber';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data.ROWNUMBER - 1)
        );
    }

    /**
     * 查询人员
     * @param data 参数
     */
    queryPersonList(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectListByQuery';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data
                    .filter((_, index) => index < 10)
                    .map(item => {
                        return {
                            ...item,
                            label: `${item.A0101}【${item.A0104_CN}】`,
                            value: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        };
                    })
            )
        );
    }

    /**
     * 输出excel
     */
    outputExcelByOrgId(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/outputExcelByOrgId';
        this.commonService.downFilePost(url, data);
    }
}
