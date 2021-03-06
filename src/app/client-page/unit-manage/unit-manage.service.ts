import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, filter, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';

import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class UnitManageService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region 机构树相关

    /**
     * 查询机构分组
     */
    getOrgGroupList() {
        const url = 'api/gl-service-data/v1/data/unit/org/group/selectListByParent';
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
        const url = 'api/gl-service-data/v1/data/unit/org/selectListByParent';
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
        const url = 'api/gl-service-data/v1/data/unit/org/selectListAllParentById';
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
        const url = 'api/gl-service-data/v1/data/unit/org/selectListByQuery';
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
     * 保存修改后的数据
     * @param data 保存数据
     */
    addOrgUnitDate(data) {
        const url = 'api/gl-service-data/v1/data/unit/org/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('机构添加成功。');
                } else {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(json => json)
        );
    }

    /**
     * 保存修改后的数据
     * @param param 保存数据
     */
    updateOrgUnitDate(param) {
        const url = 'api/gl-service-data/v1/data/unit/org/update';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('修改成功！');
                } else {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(json => json)
        );
    }

    /**
     * 删除机构
     * @param param 机构编码
     */
    deleteOrgUnitData(param) {
        const url = 'api/gl-service-data/v1/data/unit/org/delete';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                } else {
                    this.message.success('删除成功！');
                }
            }),
            map(json => json)
        );
    }

    /**
     * 通过单位ID获取机构父节点
     * @param B01ID 选中单位的ID
     * @param ORGID 选中的ORGID
     */
    selectParentByChild(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b01/selectParentByChild';
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
    //#endregion

    //#region 机构表格

    /**
     * 获取机构表格信息
     */
    getOrgUnitTableData(param: any) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b01/selectPageListByOrgId';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(json => json.data)
        );
    }

    /**
     * 通过机构获取单位
     * @param id 单位ID
     */
    getUnitB01(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b01/selectOne';
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

    /** 获取实有数统计 */
    getRealityPersonCount(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b01/selectRealityPersonCount';
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

    //#endregion

    //#region 找回机构

    /**
     * 获取回收机构信息
     * @param param 参数
     * @returns 返回回收机构信息数组
     */
    getUnitForDelete(param) {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListForDelete';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(json => json)
        );
    }

    /**
     * 找回节点
     * @param param 参数
     * @returns 找回的节点
     */
    undoDelete(param) {
        const url = 'api/gl-service-data/v1/data/unit/org/undoDelete';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('找回成功！');
                } else {
                    this.message.error(json.msg || '出错啦');
                }
            }),
            map(json => json)
        );
    }

    //#endregion

    //#region 隶属关系转移
    /**
     * 关系转移
     * @param DATA_UNIT_ORG_ID_SRC 需要调整的节点ORG_ID
     * @param DATA_UNIT_ORG_ID_DST 调整之后所在节点的ORG_ID
     */
    moveNode(DATA_UNIT_ORG_ID_SRC: string, DATA_UNIT_ORG_ID_DST: string) {
        const url = 'api/gl-service-data/v1/data/unit/org/moveNode';
        return this.http
            .post<R>(url, {
                DATA_UNIT_ORG_ID_SRC: DATA_UNIT_ORG_ID_SRC,
                DATA_UNIT_ORG_ID_DST: DATA_UNIT_ORG_ID_DST,
            })
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('转移成功！');
                    } else {
                        this.message.error(json.msg);
                    }
                }),
                map(json => json)
            );
    }
    //#endregion

    //#region 机构排序
    /**
     * 上移下移
     * @param direction 方向
     * @param id 机构编码
     */
    moveAdjustSort(direction, id) {
        const url = 'api/gl-service-data/v1/data/unit/org/adjustSort';
        return this.http
            .post<R>(url, {
                $MOVE_TYPE$: direction,
                DATA_UNIT_ORG_ID: id,
            })
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success(`机构${direction === 0 ? '上' : '下'}移成功`);
                    } else {
                        this.message.error(json.msg);
                    }
                }),
                filter(json => json.code === 0)
            );
    }
    //#endregion

    //#region 人员批量转移
    /**
     * 通过机构查询人员
     *
     * @param {*} data 参数
     * @returns
     * @memberof PersonmgrService
     */
    selectPageByOrgId(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectPageByOrgId';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
                return null;
            })
        );
    }
    /**
     * 人员转移
     * @param data 参数对象
     */
    PersonBatchTransfer(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/personBatchTransfer';
        return this.http.post<R>(url, data).pipe(map(json => json));
    }
    //#endregion

    //#region 机构校验
    /**
     * 获取校验公式
     */
    getDataCheckTable(data) {
        const url = `api/gl-service-data-civil/v1/data/check/selectDataCheckTable`;
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
     * 数据校验
     */
    checkExecute(params) {
        const url = `api/gl-service-data-civil/v1/data/check/checkExecute`;
        return this.http.post<R>(url, params).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(json => json)
        );
    }
    //#endregion

    //#region 机构查询
    searchOrg(
        FILTER_CONDITION: any,
        PAGE_INDEX: number,
        PAGE_SIZE: number,
        ORG_GROUP_ID: string,
        QUERY_FIELDS: string = 'B0101,B0114,B0124,B0124_CN,B0127,B0127_CN,B0131,B0131_CN,DATA_3001_UNIT_B01_ID'
    ) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b01/selectPageByQuery';
        return this.http
            .post<R>(url, {
                $FILTER_CONDITION$: FILTER_CONDITION,
                $QUERY_FIELDS$: QUERY_FIELDS,
                ORG_GROUP_ID: ORG_GROUP_ID,
                $PAGE_INDEX$: PAGE_INDEX,
                $PAGE_SIZE$: PAGE_SIZE,
            })
            .pipe(
                map(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg);
                    }
                    return json;
                })
            );
    }
    //#endregion
}
