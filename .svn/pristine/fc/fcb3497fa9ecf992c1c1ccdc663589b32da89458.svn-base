import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { tap, filter, map } from 'rxjs/operators';
import { CommonService } from 'app/util/common.service';

@Injectable({
    providedIn: 'root',
})
export class PersonCorrelService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    /**
     * 获取人员库
     * @returns 返回人员库
     */
    selectListByPersonPool() {
        const url = 'api/gl-service-sys-core/v1/core/system/dictionary/item/selectListByPersonPool';
        return this.http.post<R>(url, { SYS_PARENT: '-1' }).pipe(
            filter(json => json.code === 0),
            map(json =>
                json.data
                    .map(item => ({
                        ...item,
                        label: item.DICTIONARY_ITEM_NAME,
                        text: item.DICTIONARY_ITEM_NAME,
                        value: item.DICTIONARY_ITEM_CODE,
                    }))
                    .sort((a, b) => {
                        return a - b;
                    })
            )
        );
    }

    /**
     * 获取代码项
     */
    getCodeList(id) {
        const url =
            'api/gl-service-sys-core/v1/core/system/dictionary/item/selectListByDictionaryCode';
        return this.http.post<R>(url, { DICTIONARY_CODE: id }).pipe(
            filter(json => json.code === 0),
            map(json =>
                json.data
                    .map(item => ({
                        ...item,
                        label: item.DICTIONARY_ITEM_NAME,
                        text: item.DICTIONARY_ITEM_NAME,
                        value: item.DICTIONARY_ITEM_CODE,
                    }))
                    .sort((a, b) => {
                        return a - b;
                    })
            )
        );
    }

    /**
     * 查询多个字典项
     * @param ids 字典项数组
     * @returns
     */
    selectListByCodes(ids) {
        const url = 'api/gl-service-sys-core/v1/core/system/dictionary/item/selectListByCodes';
        return this.http.post<R>(url, { DICTIONARY_ITEM_DICT_CODE_S: ids }).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
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
                            value: item.DATA_3001_PERSON_A01_ID,
                        };
                    })
            )
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
     * 批量导出lrmx
     */
    downloadLrmx(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/downloadLrmx';
        this.commonService.downFilePost(url, data);
    }

    /**
     * 批量输出各种表册
     * @param data 参数
     */
    batDownloadExcel(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/batDownloadExcel';
        this.commonService.downFilePost(url, data);
    }

    /**
     * 输出人员列表
     */
    outputExcelByOrgId(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/outputExcelByOrgId';
        this.commonService.downFilePost(url, data);
    }

    /**
     * 获得账号自定义字段
     * @param data 参数
     */
    selectUserIdFields(data) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/parameter/selectListByUserId';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data || [])
        );
    }
}
