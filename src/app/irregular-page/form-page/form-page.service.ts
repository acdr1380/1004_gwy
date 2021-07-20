import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { tap, filter, map } from 'rxjs/operators';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { CommonService } from 'app/util/common.service';

@Injectable({
    providedIn: 'root',
})
export class FormPageService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private tableHelper: WfTableHelper,
        private commonService: CommonService
    ) {}

    /**
     * 查询人员信息
     * @param params 参数
     * @returns
     */
    selectPersonOtherInfo(params) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectPersonOtherInfo';
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
     * 获得用户信息
     * @param ID 人员ID
     */
    getPersonDataByID(id) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectOne';
        const data = {};
        const key = `${this.tableHelper.getTableCode('A01')}_ID`;
        data[key] = id;
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
     * 校验个人数据
     * @param keyId 个人编码
     * @returns
     */
    checkExecute(keyId) {
        const url = 'api/gl-service-data-civil/v1/data/check/checkExecute';
        return this.http
            .post<R>(url, {
                keyIds: [keyId],
                checkType: 1,
            })
            .pipe(
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
     * 获得子集列表
     * @param TABLE_CODE 子集编码
     * @param id 主键
     */
    getSetChildList(TABLE_CODE, id) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/selectListKeyId`;
        const data = {};
        data[`${TABLE_CODE}${setId !== 'A01' ? '_A01' : ''}_ID`] = id;
        return this.http.post<R>(url, data).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 添加子集信息
     * @param TABLE_CODE 子集编码
     * @param data 添加内容
     */
    addChildData(TABLE_CODE, data) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/insert`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('信息添加成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 更新子集信息
     * @param TABLE_CODE 子集编码
     * @param data 更新内容
     */
    updateChildData(TABLE_CODE, data) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/update`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('信息更新成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 删除子集信息
     * @param TABLE_CODE 子集编码
     * @param data 参数
     */
    removeChildData(TABLE_CODE, data) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/delete`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('信息删除成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 子集编辑
     * @param TABLE_CODE 表编码
     * @param id 人员编码
     * @param direction 方向
     */
    adjustSortChildData(TABLE_CODE, id, direction = 1) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/adjustSort`;
        const data = {
            $MOVE_TYPE$: direction,
        };
        data[`${TABLE_CODE}_ID`] = id;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('顺序调整成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 批量导出lrmx
     */
    downloadLrmx(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/downloadLrmx';
        this.commonService.downFilePost(url, data);
    }
}
