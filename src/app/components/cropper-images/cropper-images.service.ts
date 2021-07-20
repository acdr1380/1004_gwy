import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class CropperImagesService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 附件上传
     *
     * @param {FormData} data FormData数据
     */
    fileUpload(data: FormData) {
        const url = 'api/gl-file-service/photo/upload';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            })
            // filter(json => json.code === 0),
            // map(json => json.data)
        );
    }
}
