import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class OperSelectContactsService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 获得联系人联系方式
     * @param id 单位编码
     */
    getContactsList(id) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b01c/selectListKeyId';
        return this.http.post<R>(url, { DATA_8001_UNIT_B01C_B01_ID: id }).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => {
                    return {
                        contacts: item.B01C01,
                        contactNumber: item.B01C02,
                    };
                })
            )
        );
    }
}
