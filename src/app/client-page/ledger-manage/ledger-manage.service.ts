import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, map, filter } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class LedgerManageService {
    tblData: any[];

    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region 机构相关

    /**
     * 查询机构分组
     */
    getOrgGroupList() {
        const url = 'api/gl-service-data-civil/v1/data/unit/org/group/selectListByParent';
        return this.http.post<R>(url, { SYS_PARENT: '-1' }).pipe(
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => ({
                    ...item,
                    label: item.ORG_GROUP_NAME,
                    value: item.DATA_UNIT_ORG_GROUP_ID,
                }))
            )
        );
    }

    /**
     * 获得机构树
     * @param groupId 分组编码
     * @param parent 父节点
     */
    getOrgUnitTree(params) {
        const url = 'api/gl-service-data-civil/v1/data/unit/org/selectListByParent';
        return this.http.post<R>(url, params).pipe(
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => {
                    return {
                        ...item,
                        title: item.ORG_NAME,
                        key: item.DATA_UNIT_ORG_ID,
                        isLeaf: !Boolean(item.SYS_HAVE_CHILD),
                        nodeType: item.ORG_TYPE,
                    };
                })
            )
        );
    }

    /**
     * 搜索单位
     * @param groupId 分组
     * @param keyword 搜索关键字
     */
    selectListByQuery(groupId: string, keyword: string) {
        const url = 'api/gl-service-data-civil/v1/data/unit/org/selectListByQuery';
        return this.http
            .post<R>(url, {
                ORG_GROUP_ID: groupId,
                ORG_NAME: keyword,
            })
            .pipe(
                filter(json => json.code === 0),
                map(json =>
                    json.data
                        .filter((_, index) => index < 10)
                        .map(item => {
                            return {
                                ...item,
                                label: item.ORG_NAME,
                                value: item.DATA_UNIT_ORG_ID,
                            };
                        })
                )
            );
    }

    /**
     * 获得机构所有父节点
     * @param id 编码
     */
    getOrgParentAllList(id) {
        const url = 'api/gl-service-data-civil/v1/data/unit/org/selectListAllParentById';
        return this.http.post<R>(url, { DATA_UNIT_ORG_ID: id }).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    //#endregion

    //#region 人员相关

    /**
     * 查询多个字典项
     * @param ids 字典项数组
     * @returns
     */
    selectListByCodes(ids) {
        const url = 'api/gl-service-sys-core/v1/core/system/dictionary/item/selectListByCodes';
        return this.http.post<R>(url, { DICTIONARY_ITEM_DICT_CODE_S: ids }).pipe(
            filter(json => json.code === 0),
            map(json => {
                for (const key in json.data) {
                    if (Object.prototype.hasOwnProperty.call(json.data, key)) {
                        const result = json.data[key];
                        json.data[key] = result.map(item => ({
                            ...item,
                            label: item.DICTIONARY_ITEM_NAME,
                            text: item.DICTIONARY_ITEM_NAME,
                            value: item.DICTIONARY_ITEM_CODE,
                        }));
                    }
                }
                return json.data;
            })
        );
    }

    /**
     * 获取代码项
     */
    getCodeList(id) {
        const url =
            'api/gl-service-sys-core/v1/core/system/dictionary/item/selectListByDictionaryCode';
        return this.http.post<R>(url, { DICTIONARY_CODE: id }).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => ({
                    ...item,
                    label: item.DICTIONARY_ITEM_NAME,
                    text: item.DICTIONARY_ITEM_NAME,
                    value: item.DICTIONARY_ITEM_CODE,
                }))
            )
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
                if (json.code === 1) {
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
                            text: `${item.A0101}`,
                            value: item.DATA_1002_PERSON_A01_ID,
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
     * 获得人员数据
     * @param id 编码
     */
    getPersonDataPage(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectPageByOrgId';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    getPersonDataByIDCard(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectListByIdCard';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    //#endregion

    /**
     * 获取账本年份
     *
     * @returns {Observable<any>}
     * @memberof LedgerManageService
     */
    getLedgerYears(): Observable<any> {
        const data = [
            { value: '2021', labelName: '2021' },
            { value: '2020', labelName: '2020' },
            { value: '2019', labelName: '2019' },
            { value: '2018', labelName: '2018' },
        ];
        const observer = from([data]);
        return observer;
    }

    /**
     * 获取账本子选项卡
     */
    getLedgerChildTab(data) {
        const url = 'api/gl-service-data-civil/v1/data/core/charge/account/selectCountByTableCode';
        return this.http.post<R>(url, data).pipe(
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
     * 获取表格数据
     */
    getLedgerTblData(data) {
        const url = 'api/gl-service-data-civil/v1/data/core/charge/account/selectPage';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    syncUpdate(data) {
        const url = 'api/gl-service-data-civil/v1/data/core/charge/account/syncUpdate';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            map(json => json.code === 0)
        );
    }
    /**
     * 删除表格数据
     *
     * @param {*} param
     * @returns {Observable<any>}
     * @memberof LedgerManageService
     */
    deleteTblData(param: any): Observable<any> {
        const url = 'api/gl-service-data-civil/v1/data/core/charge/account/delete';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('删除成功');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0)
        );
    }
    /**
     * 批量修改数据
     *
     * @param {*} params
     * @returns {Observable<any>}
     * @memberof LedgerManageService
     */
    batchEditTblData(params: any): Observable<any> {
        const url = 'api/gl-service-data-civil/v1/data/core/charge/account/update';
        return this.http.post<R>(url, params).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('修改成功');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0)
        );
    }

    //#region 选人抽屉
    /**
     * 新增账本
     *
     * @param {*} params
     * @returns {Observable<any>}
     * @memberof LedgerManageService
     */
    addLedgerData(data: any): Observable<any> {
        const url = 'api/gl-service-data-civil/v1/data/core/charge/account/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('添加成功');
                }
            }),
            filter(json => json.code === 0)
        );
    }
    //#endregion
}
