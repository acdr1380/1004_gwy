import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { R } from 'app/entity/vo/R';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SelectOrgService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region 机构相关

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
     * 通过B01Id和groupId查找机构
     */
    getOrgByB01Id(data) {
        const url = 'api/gl-service-data/v1/data/unit/org/selectOneByB01Id';
        return this.http.post<R>(url, data).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得机构树
     * @param groupId 分组编码
     * @param parent 父节点
     */
    getOrgUnitTree(groupId: string, parent = '-1') {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListByParent';
        return this.http
            .post<R>(url, {
                ORG_GROUP_ID: groupId,
                SYS_PARENT: parent,
            })
            .pipe(
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
        const url = 'api/gl-service-data/v1/data/unit/org/selectListByQuery';
        return this.http
            .post<R>(url, {
                ORG_GROUP_ID: groupId,
                ORG_NAME: keyword,
            })
            .pipe(
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
        const url = 'api/gl-service-data/v1/data/unit/org/selectListAllParentById';
        return this.http
            .post<R>(url, { DATA_UNIT_ORG_ID: id })
            .pipe(
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
    //#endregion
}
