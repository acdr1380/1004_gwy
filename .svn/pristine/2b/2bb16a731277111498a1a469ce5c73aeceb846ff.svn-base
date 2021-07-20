import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PolicyInfo } from '../../db/entity/PolicyInfo';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    constructor(private http: HttpClient) {}

    /**
     * 构造树结构
     * @param {PolicyGroup[]} list 分类列表
     * @param {string} [parentId='-1'] 父节点
     * @param {any[]} nodes 树
     */
    private buildTreeStructure(list: any[], parentId = '-1', nodes: any[], isCount = false) {
        if (!list) {
            return [];
        }
        list.forEach(item => {
            if (item.parentId === parentId) {
                const node = {
                    ...item,
                    title: !isCount ? item.groupName : `${item.groupName}（${item.count}）`,
                    key: item.groupId,
                    isLeaf: !item.haveChild,
                    children: [],
                };
                nodes.push(node);
                if (item.haveChild) {
                    this.buildTreeStructure(list, item.groupId, node.children, isCount);
                }
            }
        });
    }

    //#region 常用文号
    findByHits() {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/findByHits';
        return this.http.get<R>(url).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }
    //#endregion

    getSysDynamicStateList(rowNumber: number): Observable<Array<any>> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/findCount';
        return this.http.get<R>(`${url}/${rowNumber}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 获取对应类型所有政策数据
     */
    searchPolicyInfo(data): Observable<Array<PolicyInfo>> {
        let url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/search';
        if (data.isType) {
            url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/selectByGroupId';
        }
        const params = new HttpParams({ fromObject: data });
        return this.http
            .get<R>(url, { params })
            .pipe(
                map(json => {
                    if (json.code === 0) {
                        return json.data;
                    }
                })
            );
    }

    /**
     * 获得政策类型统计数量
     */
    getPolicyTypeAllCount(): Observable<any[]> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policyGroup/info/findAllGroupAndCount';
        return this.http.get<R>(url).pipe(
            map(json => {
                if (json.code === 0) {
                    const nodes = [];
                    this.buildTreeStructure(json.data, '-1', nodes, true);
                    return nodes;
                }
            })
        );
    }
}
