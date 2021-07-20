import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';
import { BackInfo } from '../../db/entity/BackInfo';

@Injectable({
    providedIn: 'root',
})
export class DocumentService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 获得文档对象数据
     */
    getDocumentData(policyId: string) {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/detail';
        return this.http.get<R>(`${url}/${policyId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    //#region 标记笔记
    /**
     * 获得笔记
     * @param {string} policyId 政策编码
     */
    getPolicyFavoritesList(policyId: string) {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/note/info/findByPolicyId';
        return this.http.get<R>(`${url}/${policyId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 保存标记
     * @param {*} data 标记内容
     */
    saveTagData(data) {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/tag/info/save';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }
    //#endregion

    //#region 纠错
    /**
     * 保存纠错信息
     * @param {BackInfo} data 纠错信息
     */
    saveBackData(data: BackInfo) {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/back/info/save';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 获得反馈列表
     * @param {string} policyId 政策编码
     */
    getBackDataList(policyId: string) {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/back/info/findByUser';
        return this.http.get<R>(`${url}/${policyId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 删除反馈
     */
    deleteBackData(backId: string) {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/back/info/delete';
        return this.http.delete<R>(`${url}/${backId}`).pipe(map(json => json.code === 0));
    }

    /**
     * 更新反馈
     */
    updateBackData(data) {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/back/info/update';
        return this.http.put<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    //#endregion
}
