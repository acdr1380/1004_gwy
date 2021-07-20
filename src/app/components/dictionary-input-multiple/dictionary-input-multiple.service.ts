import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from 'app/app.config';
import { R } from 'app/entity/vo/R';
import { CommonService } from 'app/util/common.service';
import { filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DictionaryInputMultipleService {
    protected appSettings = AppConfig.settings;
    constructor(private http: HttpClient, private commonService: CommonService) {}

    /**
     * 代码信息
     * @param id 编码
     */
    getDictionaryInfo(id) {
        const url = 'api/gl-service-sys-core/v1/core/system/dictionary/selectOneByDictionaryCode';
        return this.http.post<R>(url, { DICTIONARY_CODE: id }).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得字典项
     * @param code 编码
     * @param parent 父节点
     */
    async getSysDicItemList(code, parent = '-1') {
        let url =
            'api/gl-service-sys-core/v1/core/system/dictionary/item/selectListByDictionaryCode';
        let data: any = { DICTIONARY_CODE: code, SYS_PARENT: parent };
        switch (code) {
            case 'N':
                url = 'api/gl-service-data/v1/data/unit/org/selectListByParent';
                data = {
                    ORG_GROUP_ID: this.appSettings.appServer.DATA_UNIT_ORG_GROUP_ID,
                    SYS_PARENT: parent,
                };
                break;
        }
        return this.http
            .post<R>(url, data)
            .pipe(
                filter(json => json.code === 0),
                map(json =>
                    json.data.map(item => {
                        let result = {
                            ...item,
                            title: item.DICTIONARY_ITEM_NAME,
                            key: item.SYSTEM_DICTIONARY_ITEM_ID,
                            value: item.DICTIONARY_ITEM_CODE,
                            isLeaf: !Boolean(item.SYS_HAVE_CHILD),
                        };
                        switch (code) {
                            case 'N':
                                result = {
                                    ...item,
                                    title: item.ORG_NAME,
                                    key: item.DATA_UNIT_ORG_ID,
                                    value: item.ORG_B01_ID,
                                    isLeaf: !Boolean(item.SYS_HAVE_CHILD),
                                };
                                break;
                        }

                        return result;
                    })
                )
            )
            .toPromise();
    }

    /**
     * 搜索代码
     * @param code 代码
     * @param keyword 关键字
     */
    async searchKeyword(code: string, keyword: string) {
        let url = 'api/gl-service-sys-core/v1/core/system/dictionary/item/selectListByQuery';
        let data: any = { DICTIONARY_CODE: code, DICTIONARY_ITEM_NAME: keyword };
        switch (code) {
            case 'N':
                url = 'api/gl-service-data/v1/data/unit/org/selectListByQuery';
                data = {
                    ORG_GROUP_ID: this.appSettings.appServer.DATA_UNIT_ORG_GROUP_ID,
                    ORG_NAME: keyword,
                };
                break;
        }
        return this.http
            .post<R>(url, data)
            .pipe(
                filter(json => json.code === 0),
                map(json =>
                    json.data
                        .filter((_, index) => index < 10)
                        .map(item => {
                            let result = {
                                ...item,
                                label: item.DICTIONARY_ITEM_NAME,
                                key: item.SYSTEM_DICTIONARY_ITEM_ID,
                                value: item.DICTIONARY_ITEM_CODE,
                            };
                            switch (code) {
                                case 'N':
                                    result = {
                                        ...item,
                                        label: item.ORG_NAME,
                                        key: item.DATA_UNIT_ORG_ID,
                                        value: item.ORG_B01_ID,
                                    };
                                    break;
                            }
                            return result;
                        })
                )
            )
            .toPromise();
    }

    /**
     * 获得所有父节点
     * @param id 编码
     */
    getParentAllList(code, id) {
        let url =
            'api/gl-service-sys-core/v1/core/system/dictionary/item/selectListAllParentByCode';
        let data: any = { DICTIONARY_CODE: code, DICTIONARY_ITEM_CODE: id };
        switch (code) {
            case 'N':
                url = 'api/gl-service-data/v1/data/unit/org/selectListAllParentById';
                data = { DATA_UNIT_ORG_ID: id };
                break;
        }
        return this.http.post<R>(url, data).pipe(
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => {
                    let result = {
                        key: item,
                        value: item,
                    };
                    switch (code) {
                        case 'N':
                            result = {
                                ...item,
                                key: item.DATA_UNIT_ORG_ID,
                                value: item.ORG_B01_ID,
                            };
                            break;
                    }
                    return result;
                })
            )
        );
    }
}
