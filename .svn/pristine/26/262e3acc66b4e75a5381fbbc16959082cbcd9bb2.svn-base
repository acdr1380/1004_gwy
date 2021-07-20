import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PolicyInfo } from '../../db/entity/PolicyInfo';

@Injectable({
    providedIn: 'root',
})
export class ResultService {
    constructor(private http: HttpClient) {}

    /**
     * 取具体政策数据
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
     * 构造树结构
     *
     * @private
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

    /**
     * 获得政策类型统计数量
     * @returns {Observable<any[]>} 政策类型列表
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
