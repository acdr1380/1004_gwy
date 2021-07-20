import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PolicyGroup } from '../db/entity/PolicyGroup';

@Injectable({
    providedIn: 'root',
})
export class SetClassificationService {
    constructor(private http: HttpClient) {}

    /**
     * 获得政策类型
     */
    getPolicyTypeAll(isCount = false): Observable<any[]> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policyGroup/info/findAll';
        return this.http.get<R>(url).pipe(
            map(json => {
                if (json.code === 0) {
                    const nodes = [];
                    this.buildTreeStructure(json.data, '-1', nodes, isCount);
                    return nodes;
                }
            })
        );
    }

    /**
     * 构造树结构
     * @private
     * @param {PolicyGroup[]} list 分类列表
     * @param {string} [parentId='-1'] 父节点
     * @param {any[]} nodes 树
     */
    private buildTreeStructure(list: any[], parentId = '-1', nodes: any[], isCount = false) {
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
     * 保存政策分类
     */
    savePolicyTypeData(data): Observable<any> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policyGroup/info/save';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    const item = json.data;
                    return {
                        ...item,
                        title: item.groupName,
                        key: item.groupId,
                        isLeaf: !item.haveChild,
                    };
                }
            })
        );
    }

    /**
     * 更新政策类型文件
     * @returns {Observable<any>} 返回更新后的内容
     */
    updatePolicyTypeData(data): Observable<any> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policyGroup/info/update';
        return this.http.put<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    const item = json.data;
                    return {
                        ...item,
                        title: item.groupName,
                        key: item.groupId,
                        isLeaf: !item.haveChild,
                    };
                }
            })
        );
    }

    /**
     * 删除政策类型
     */
    deletePolicyTypeData(groupId: string): Observable<boolean> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policyGroup/info/delete';
        return this.http.delete<R>(`${url}/${groupId}`).pipe(map(json => json.code === 0));
    }

    /**
     * 获得政策类型统计数量（发送）
     *
     * @returns {Observable<any[]>} 政策类型列表
     */
    getPolicyAllCount(): Observable<any[]> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policyGroup/info/findAllByUser';
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
