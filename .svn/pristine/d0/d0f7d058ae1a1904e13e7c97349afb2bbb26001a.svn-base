import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';
import * as Mock from 'mockjs';


@Injectable({
    providedIn: 'root'
})
export class TibetPersonEditService {

    /**
     * 业务编码
     */
    public wfId = 'tibet_person_edit';

    /**
     * 业务名称
     */
    public wfName = '人员初始化';

    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) { }

    /**
     * 校验人员信息
     */
    checkPerson() {
        // keyId   A0184 checkContent
        let obj = Mock.mock({
            'array|1-10': [
                {
                    keyId: Mock.mock('@id()'),
                    A0184: Mock.mock('@id()'),
                    name: Mock.mock('@cname()'),
                    count: Mock.mock('@natural(2,6)'),
                    checkContent: Mock.mock('@csentence()'),
                },
            ],
        });
        return obj.array;
    }

    /**
     * 获取人员列表
     */
    getPersonList(data) {
        return new Promise((resolve, reject) => {
            const url = `api/gl-1004-workflow-tibet/v1/workflow/job/wf/data/getWfData`;
            this.http
                .post<R>(url, data)
                .pipe(
                    tap(json => {
                        if (json.code !== 0) {
                            this.message.error(json.msg);
                        }
                    }),
                    map(json => json.data)
                )
                .subscribe(result => resolve(result));
        });
    }

    /**
     * 下载表册
     * @param data 参数
     */
    batDownloadExcel(data) {
        const url = 'api/gl-service-data/v1/data/form/batDownloadExcel';
        return this.commonService.downFilePost(url, data);
    }

    /**
     * 判断业务是否需要直接归档
     */
    getSubmitState(data) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/tibet/person/edit/job/getSubmitState`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
