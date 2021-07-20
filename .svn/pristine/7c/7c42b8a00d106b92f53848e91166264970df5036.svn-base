import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DistributeDetailService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    // 查询单位发放信息
    getDistributeDetail(param) {
        const url =
            'api/gl-service-data-civil/v1/data/person/gz61/selectGz61ByB01IdAndYearAndMonth';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    // 删除人员工资
    deletePersonItem(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/gz61/delete';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                this.message.success('删除成功！');
            })
        );
    }

    updatePersonItem(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/gz61/update';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    outputDetailTable(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/gz61/outPutExcel';
        this.commonService.downFilePost(url, param);
    }

    updateSalaryData(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/gz61/updateSalaryData';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
