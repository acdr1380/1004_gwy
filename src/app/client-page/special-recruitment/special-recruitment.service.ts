import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { catchError, filter, map, tap } from 'rxjs/operators';
import * as localForage from 'localforage';
import { environment } from 'environments/environment';
import { Observable, of } from 'rxjs';
import { AppConfig } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class SpecialRecruitmentService {
    protected appSettings = AppConfig.settings;
    constructor(private http: HttpClient, private message: NzMessageService) {}

    deleteA37(param: any) {
        const url = `api/gl-service-data-civil/v1/data/person/a37/deleteByKeyId`;
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(josn => josn)
        );
    }

    //#region 调整字段
    /**
     * 保存用户调整后的字段
     */
    saveParameterData(data) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/parameter/save';
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
    /**
     * 获得用户保存的字段
     *
     * @param {string} id 编码
     * @param {UserParameterTypeEnum} pramType 类型
     * @param {AuthTypeEnum} authType 类型
     * @memberof PersonmgrService
     */
    getParameterData(data: any) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/parameter/selectListByUserId';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }
    /**
     * 获得字段信息列表
     *
     * @param {Array<string>} itemIds 字段列表
     * @returns {Promise<Array<any>>} 字段信息列表Promise对象
     * @memberof TableCodeSocketService
     */
    getSetItems(itemIds: Array<string>): Promise<Array<any>> {
        return new Promise(async resolve => {
            const list: Array<any> = [];
            for (const itemId of itemIds) {
                const item = await this.getSetItem(itemId);
                if (item) {
                    list.push(item);
                }
            }
            resolve(list);
        });
    }
    /**
     * 获得字段信息
     *
     * @param {string} itemId 字段编码
     * @returns {Promise<any>} 返回字段信息Promise对象
     * @memberof TableCodeSocketService
     */
    getSetItem(itemId: string): Promise<any> {
        return this.setItemForage.getItem(itemId).then(data => {
            if (!data) {
                const url = 'api/gl-service-sys-core/v1/core/table/column/selectByTableColumnCode';
                return this.http
                    .post<R>(url, { TABLE_COLUMN_CODE: itemId })
                    .pipe(
                        map(json => {
                            if (json.code === 0) {
                                const items = json.data;
                                if (items) {
                                    // 处理数据后以itemId为健保存在内存中
                                    this.setItemForage.setItem(items.TABLE_COLUMN_CODE, items);
                                    return items;
                                }
                            }
                        }),
                        catchError(
                            this.handleError<any>('table-code-socket.service ---> getSetItem', null)
                        )
                    )
                    .toPromise();
            } else {
                return data;
            }
        });
    }
    /**
     * 建立前端缓存表 SYS_SET_ITEM
     *
     * @readonly
     * @private
     * @type {LocalForage}
     */
    private get setItemForage(): LocalForage {
        return localForage.createInstance({
            name: `GL_${environment.config.PROJECT_PATH_ROOT}_SET_DB`, // DB NAME
            storeName: 'SYS_SET_ITEM', // TABLE or collection NAME
            driver: [localForage.INDEXEDDB],
        });
    }
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            // console.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(<T>result);
        };
    }
    //#endregion

    //#region 专招显示
    /**
     * 获取专招统计
     * @param param 参数
     */
    getA37Count(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/a37/selectA3704CodeCount';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(json =>
                json.data.map(x => {
                    return {
                        text: x.CODE_NAME,
                        code: x.CODE_ID,
                        Totalcount: x.COUNT,
                    };
                })
            )
        );
    }

    /**
     * 获取A37列表
     * @param param 参数
     */
    getA37List(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/a37/selectPageByOrgId';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(josn => josn)
        );
    }

    /** 获取人员库统计数 */
    getPersonCount(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/a37/sumPersonByA0103';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(json => json.data)
        );
    }
    //#endregion

    //#region 专招人员管理

    /**
     * 添加人员信息
     * @param param 参数
     * @param tableId 表名
     * @returns 返回对应子集信息
     */
    insertPersonInfo(param: any, tableId: string) {
        const index = tableId.lastIndexOf('_');
        tableId = tableId.substring(index + 1, tableId.length).toLocaleLowerCase();
        const url = `api/gl-service-data-civil/v1/data/person/${tableId}/insert`;
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(josn => josn)
        );
    }

    /**
     * 添加人员信息
     * @param param 参数
     * @param tableId 表名
     * @returns 返回对应子集信息
     */
    deletePersonInfo(param: any, tableId: string) {
        const index = tableId.lastIndexOf('_');
        tableId = tableId.substring(index + 1, tableId.length).toLocaleLowerCase();
        const url = `api/gl-service-data-civil/v1/data/person/${tableId}/delete`;
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(josn => josn)
        );
    }

    /**
     * 修改人员信息
     * @param param 参数
     * @param tableId 表名
     * @returns 返回对应子集信息
     */
    updatePersonInfo(param: any, tableId: string) {
        const index = tableId.lastIndexOf('_');
        tableId = tableId.substring(index + 1, tableId.length).toLocaleLowerCase();
        const url = `api/gl-service-data-civil/v1/data/person/${tableId}/update`;
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(josn => josn)
        );
    }

    /**
     * 获取主集人员信息
     * @param param 参数
     * @param tableId 表名
     * @returns 返回信息
     */
    getPersonA01Info(param: any, tableId: string) {
        const index = tableId.lastIndexOf('_');
        tableId = tableId.substring(index + 1, tableId.length).toLocaleLowerCase();
        const url = `api/gl-service-data-civil/v1/data/person/${tableId}/selectOne`;

        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(josn => josn)
        );
    }

    /**
     * 获取子集人员信息
     * @param param 参数
     * @param tableId 表名
     * @returns 返回信息
     */
    getPersonChildInfo(param: any, tableId: string) {
        const index = tableId.lastIndexOf('_');
        tableId = tableId.substring(index + 1, tableId.length).toLocaleLowerCase();
        const url = `api/gl-service-data-civil/v1/data/person/${tableId}/selectListKeyId`;
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(josn => josn)
        );
    }
    //#endregion
}
