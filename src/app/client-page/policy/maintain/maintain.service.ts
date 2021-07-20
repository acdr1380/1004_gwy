import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PolicyInfo } from '../db/entity/PolicyInfo';
import { PolicyInfoVO } from '../db/vo/PolicyInfoVO';

@Injectable({
    providedIn: 'root',
})
export class MaintainService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 获得政策
     */
    getPolicyDataList(data: any): Observable<PolicyInfo> {
        let url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/select';
        switch (data.status) {
            case 0:
                url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/selectSendByGroupId';
                break;
            case -1:
                url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/selectByFlag';
                break;
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
     * 作废
     */
    updatePolicyData(policyId: string, content: string): Observable<PolicyInfoVO> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/updateStatusInvalid';
        return this.http
            .put<R>(url, { policyId, content })
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
     * 删除政策
     */
    deletePolicyData(policyId: string): Observable<boolean> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/policy/info/delete';
        return this.http.delete<R>(`${url}/${policyId}`).pipe(map(json => json.code === 0));
    }
}
