import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { R } from 'app/entity/vo/R';
import { map, filter, tap } from 'rxjs/operators';
import * as Mock from 'mockjs';
import { CommonService } from 'app/util/common.service';

@Injectable({
    providedIn: 'root'
})
export class TibetPersonEnterService {
    /**
     * 业务编码
     */
    public wfId = 'tibet_person_enter';

    /**
     * 业务名称
     */
    public wfName = '人员新进';

    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) { }
    /**
     * 批量上传照片
     */
    batchFile(data: FormData) {
        return this.http
            .post<R>('api/gl-file-service/photo/upload-zip', data)
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    } else {
                        this.message.success('上传成功!');
                    }
                }),
                // filter(json => json.code === 0),
                map(json => json.data)
            )
            .toPromise();
    }
    /**
     * 批量上传附件
     */
    uploadPersonFile(data: FormData) {
        return this.http
            .post<R>('api/gl-file-service/attachment/upload-zip', data)
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    } else {
                        this.message.success('上传成功!');
                    }
                }),
                // filter(json => json.code === 0),
                map(json => json.data)
            )
            .toPromise();
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
     * 批量保存照片
     */
    batchSavePhoto(data) {
        return new Promise((resolve, reject) => {
            const url = `api/gl-1004-workflow-tibet/v1/workflow/tibet/person/enter/job/batchUploadPhoto`;
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
     * 批量保存附件
     */
    batchSaveFile(data) {
        return new Promise((resolve, reject) => {
            const url = `api/gl-1004-workflow-tibet/v1/workflow/tibet/person/enter/job/batchUploadAnnex`;
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
     *
     * 取表格数据
     */
    getPersonTable(data) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/tibet/person/enter/job/getWfTableList`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            map(json => json.data)
        );
    }
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
     * 批量导入模板数据
     */
    importExcel(data: any) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/tibet/person/enter/job/importExcel`;
        return this.http
            .post<R>(url, data)
            .pipe(
                tap(res => {
                    if (res.code !== 0) {
                        this.message.error(res.msg);
                    }
                }),
                map(res => res.data)
            )
            .toPromise();
    }

    /**
     * 下载表册
     * @param data 参数
     */
    batDownloadExcel(data) {
        const url = 'api/gl-service-data/v1/data/form/batDownloadExcel';
        return this.commonService.downFilePost(url, data);
    }


    /** 获取预览表数据 */
    getPersonTableData(params: any) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/tibet/person/enter/job/getWfTableList`;
        return this.http
            .post<R>(url, params)
            .pipe(
                tap(res => {
                    if (res.code !== 0) {
                        this.message.error(res.msg);
                    }
                }),
                map(res => res.data)
            )
    }

    /** 根据身份证查人 */
    getPersonData(params: any) {
        const url = `api/gl-service-data-civil/v1/data/person/a01/selectNotOfficeListByA0184`;
        return this.http
            .post<R>(url, params)
            .pipe(
                tap(res => {
                    if (res.code !== 0) {
                        this.message.error(res.msg);
                    }
                }),
                map(res => res.data)
            )
    }

    /**
     * 业务LRMX文件导入
     */
    importlrmx(data: any) {
        const url = `api/gl-1002-workflow-core/v1/workflow/data/lrmx/importExcel`;
        return this.http
            .post<R>(url, data)
            .pipe(
                tap(res => {
                    if (res.code !== 0) {
                        this.message.error(res.msg);
                    }
                }),
                map(res => res)
            )
            .toPromise();
    }
}
