import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { filter, map, tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';
import * as localForage from 'localforage';
import { AppConfig } from 'app/app.config';

@Injectable({
    providedIn: 'root',
})
export class AdvancedQueryService {
    protected appSettings = AppConfig.settings;
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private router: Router
    ) {}
    /**
     * 获取页面配置
     */
    getPageLayout(): Observable<Array<any>> {
        return this.http.get('assets/report/advanced-query/pageLayout.json').pipe(
            map((data: []) => {
                if (data.length > 0) {
                    return data;
                }
                return [];
            })
        );
    }

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
     * 获取机构树数据
     * @param groupId 分组编码
     * @param parent 父节点
     */
    getTreeData(groupId: string, parent = '-1') {
        const url = 'api/gl-service-data-civil/v1/data/unit/org/selectListByParent';
        const data = this.http.post<R>(url, {
            ORG_GROUP_ID: groupId,
            SYS_PARENT: parent,
        });
        return this.http
            .post<R>(url, {
                ORG_GROUP_ID: groupId,
                SYS_PARENT: parent,
            })
            .pipe(
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
    /**
     * 搜索单位
     * @param groupId 分组编码
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
     * 获取查询历史
     */
    getHistoryquery(data) {
        const url = 'api/gl-service-data-civil/v1/data/core/senior/query/selectByPage';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(json => json)
        );
    }

    /**
     * 获取查询结果
     */
    getQueryResult(data) {
        const url = 'api/gl-service-data-civil/v1/data/core/senior/query/seniorQuery';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '查询出错！');
                }
            }),
            map(json => json)
        );
    }

    /**
     * 保存历史条件
     * @param data 查询条件
     */
    saveWhere(data) {
        const url = 'api/gl-service-data-civil/v1/data/core/senior/query/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                } else {
                    this.message.success('添加成功！');
                }
            }),
            map(json => json)
        );
    }

    /**
     * 删除查询条件
     * @param data 删除的数组
     */
    removeWhere(data) {
        const url = 'api/gl-service-data-civil/v1/data/core/senior/query/deleteByWhere';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                } else {
                    this.message.success('已删除!');
                }
            }),
            map(json => json)
        );
    }

    getSessionUser(): any {
        const userinfo: any =
            JSON.parse(
                sessionStorage.getItem(`${environment.config.PROJECT_PATH_ROOT}_UserInfo`)
            ) || {};
        console.log(sessionStorage);
        if (!userinfo.userId) {
            this.message.error('您已经掉线，请重新登录');
            // this.router.navigate(['login']);
            return;
        }
        return userinfo;
    }

    /**
     * 保存用户调整后的字段
     *
     * @param {*} data 保存内容
     * @returns {Observable<SysUserParameter>}
     * @memberof PersonmgrService
     */
    saveParameterData(data) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/parameter/save';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 获得用户保存的字段
     */
    getParameterData(id: string, pramType: any) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/parameter/selectListByUserId';
        return this.http
            .post<R>(url, { USER_PARAMETER_USER_ID: id, USER_PARAMETER_TYPE: pramType })
            .pipe(
                map(json => {
                    if (json.code === 0) {
                        return json.data;
                    }
                    this.message.error(json.msg);
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
            name: `GL_${this.appSettings.appInsights.PROJECT_NAME_SIGN}_SET_DB`, // DB NAME
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
