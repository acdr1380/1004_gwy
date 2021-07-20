import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, filter, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';

import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class JobManagementService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region 机构树相关

    /**
     * 查询机构分组
     */
    getOrgGroupList() {
        const url = 'api/gl-service-data/v1/data/unit/org/group/selectListByParent';
        return this.http
            .post<R>(url, { SYS_PARENT: '-1' })
            .pipe(
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
        return this.http
            .post<R>(url, { DATA_UNIT_ORG_ID: id })
            .pipe(
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
    selectParentByChild(B01ID: string, ORGID: string) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b01/selectParentByChild';
        return this.http
            .post<R>(url, { ORG_B01_ID: B01ID, DATA_UNIT_ORG_ID: ORGID })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg || '出错啦！');
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            )
            .toPromise();
    }
    //#endregion

    //#region 职数管理

    /**
     * 获取职数信息
     * @param param 参数
     * @returns 返回职数列表
     */
    getJobNumDate(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06/selectListByQuery';
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

    /**
     * 添加职数信息
     * @param param 参数
     * @returns 返回职数信息
     */
    postInsertJobNum(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06/insert';
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
     * 删除职数数据
     * @param param 参数
     * @returns 返回数据
     */
    postDeleteJobNum(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06/delete';
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
     * 获取计划列表
     * @returns 返回计划列表
     */
    getPlanList() {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06a/selectListByAuth';
        return this.http.post<R>(url, {}).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /** 反查记录 */
    getCheckList(params) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06b/selectListByB06B01';
        return this.http.post<R>(url, params).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取记录
     * @param param 参数
     * @returns 返回记录
     */
    getRecord(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06/selectLastByQuery';
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
    /**
     * 获取下拉列表
     * @param param 参数
     * @returns 染回下拉列表
     */
    getOptionList(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06/selectItems';
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

    //#region 统筹设置

    /**
     * 获取统筹表格数据
     * @param param 参数
     * @returns
     */
    getOverallDate(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06a/selectListKeyId';
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

    /**
     * 添加统筹信息
     * @param param 参数
     * @returns
     */
    postInsertOverall(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06a/insert';
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
     *删除统筹设置
     * @param param 参数
     * @returns
     */
    postDeleteOverall(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06a/delete';
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
     *删除统筹设置
     * @param param 参数
     * @returns
     */
    postUpdateOverall(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06a/update';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            map(json => json)
        );
    }
    //#endregion

    //#region 使用情况

    /**
     * 获取实有数
     * @param param 参数
     * @returns 返回实有数
     */
    getTheSum(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06/sumCountByField';
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

    /**
     * 获取B01信息
     * @param param 参数
     * @returns 返回B01信息
     */
    getUnitInfo(param) {
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

    /** 获取自己最后一条数据 */
    getLastRow(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06/selectLastRowByKeyId';
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

    /**
     * 获取职数使用信息
     * @param param 参数
     * @returns 返回职数使用信息
     */
    getUseInfo(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/a05g/sumAllByA05G01';
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

    /**
     * 反查信息
     * @param param 参数
     * @returns 返回反查信息
     */
    peverseLookUp(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectPageByA05G01';
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
}
