import { filter, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class PersonalDetailsService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 获得用户信息
     * @param A0184 身份证
     */
    getPersonData(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectByIdCard';
        return this.http.post<R>(url, data).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得用户信息
     * @param ID 人员ID
     */
    getPersonDataByID(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectOne';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 更新照片
     * @param data 参数
     */
    updateA01PhotoData(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01b/insert';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('照片上传成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得子集信息
     * @param TABLE_CODE 子集编码
     */
    getSetChildData(TABLE_CODE, id) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/selectOne`;
        const data = {};
        data[`${TABLE_CODE.toLocaleUpperCase()}${setId !== 'A01' ? '_A01' : ''}_ID`] = id;
        return this.http.post<R>(url, data).pipe(
            filter(json => {
                console.log(json);
                return json.code === 0;
            }),
            map(json => json.data)
        );
    }

    /**
     * 获得子集列表
     * @param TABLE_CODE 子集编码
     * @param id 主键
     */
    getSetChildList(TABLE_CODE, id) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/selectListKeyId`;
        const data = {};
        data[`${TABLE_CODE}_A01_ID`] = id;
        return this.http.post<R>(url, data).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 添加子集信息
     * @param TABLE_CODE 子集编码
     * @param data 添加内容
     */
    addChildData(TABLE_CODE, data) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/insert`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('信息添加成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 更新子集信息
     * @param TABLE_CODE 子集编码
     * @param data 更新内容
     */
    updateChildData(TABLE_CODE, data) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/update`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('信息更新成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 删除子集信息
     * @param TABLE_CODE 子集编码
     * @param id 删除编码
     */
    removeChildData(TABLE_CODE, id) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/delete`;
        const data = {};
        data[`${TABLE_CODE}_ID`] = id;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('信息删除成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
    /**
     * 子集上移下移
     */
    adjustSort(data, setId) {
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/adjustSort`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('移动成功');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
