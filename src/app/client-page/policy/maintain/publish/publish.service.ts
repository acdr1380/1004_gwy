import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { BackInfo } from '../../db/entity/BackInfo';
import { PolicyInfoVO } from '../../db/vo/PolicyInfoVO';

@Injectable({
    providedIn: 'root',
})
export class PublishService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 保存新发布政策
     */
    savePolicyData(data: PolicyInfoVO): Observable<PolicyInfoVO> {
        data.content = this.documentPretreatment(data.content);
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/save';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '政策发布失败。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 查询政策内容
     */
    getPolicyData(policyId: string): Observable<PolicyInfoVO> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/detail';
        return this.http.get<R>(`${url}/${policyId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 更新政策内容
     */
    updatePolicyData(data: PolicyInfoVO): Observable<PolicyInfoVO> {
        data.content = this.documentPretreatment(data.content);
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/update';
        return this.http.put<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 更新反馈状态
     */
    updateOperation(data): Observable<BackInfo> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/back/info/updateOperation';
        return this.http
            .put<R>(url, null, { params: data })
            .pipe(
                map(json => {
                    if (json.code === 0) {
                        return json.data;
                    }
                })
            );
    }

    /**
     * 预处理政策内容
     */
    private documentPretreatment(html: string): string {
        const doc = document.createElement('div');
        doc.innerHTML = html;
        const domList = doc.getElementsByTagName('*');
        [].forEach.call(domList, (el: Element, index: number) => {
            el.setAttribute('cy_mark', Math.random().toString(36).substr(2));
        });
        return doc.innerHTML;
    }

    /**
     * 删除政策
     */
    deletePolicyData(policyId: string): Observable<boolean> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/delete';
        return this.http.delete<R>(`${url}/${policyId}`).pipe(map(json => json.code === 0));
    }

    /**
     * 获得反馈信息
     */
    getBackSubList(policyId: string): Observable<Array<BackInfo>> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/back/info/findByPolicyId';
        return this.http.get<R>(`${url}/${policyId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    //#region 机构相关
    /**
     * 获取机构树数据
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
    //#endregion
}
