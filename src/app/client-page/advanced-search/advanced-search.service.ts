import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, filter, tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import * as localForage from 'localforage';
import { environment } from 'environments/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppConfig } from 'app/app.config';
@Injectable({
    providedIn: 'root',
})
export class AdvancedSearchService {
    protected appSettings = AppConfig.settings;
    constructor(private http: HttpClient, private message: NzMessageService) {}
    /**
     * 解析查询字符串
     */
    getExpression(queryKey: string) {
        const url = 'api/gl-service-data/v1/data/core/senior/query/getExpression';
        const params = new HttpParams({ fromObject: { content: queryKey } });
        return this.http.get<R>(url, { params }).pipe(
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
     * 查询匹配人员
     * @param data 查询内容
     */
    getQueryExecute(data) {
        const url = 'api/gl-service-data/v1/data/core/senior/query/execute';
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

    /***
     * 获取系统默认显示字段
     */
    selectByParameterCodes(SYSTEM_PARAMETER_CODE) {
        const url = 'api/gl-service-sys-core/v1/core/table/column/selectByParameterCodes';
        return this.http
            .post<R>(url, {
                SYSTEM_PARAMETER_CODE,
            })
            .pipe(
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
    //#endregion

    /**
     * 输出excel
     */
    downloadExecute(data) {
        const url = 'api/gl-service-data/v1/data/core/senior/query/downloadExecute';
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
     * 查询已存条件
     */
    selectCondition(data) {
        const url = 'api/gl-service-data/v1/data/core/senior/query/selectByPage';
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
     * 保存条件
     */
    saveCondition(data) {
        const url = 'api/gl-service-data/v1/data/core/senior/query/insert';
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
     * 删除条件
     */
    deleteCondition(keyId) {
        const url = 'api/gl-service-data/v1/data/core/senior/query/deleteByWhere';
        return this.http.post<R>(url, { SYS_USER_QUERY_HISTORY_ID: [keyId] }).pipe(
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
     * 获取界面方案信息
     * @param permission 界面方案编码
     */
    getChemeContent(permission: string) {
        const url = 'api/gl-service-sys-core/v1/core/system/scheme/selectSchemeByPermission';
        return this.http.post<R>(url, { SCHEME_PERMISSION: permission }).pipe(
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
    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
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
}
