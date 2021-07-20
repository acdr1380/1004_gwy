import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FavoritesGroup } from '../../db/entity/FavoritesGroup';
import { FavoritesInfo } from '../../db/entity/FavoritesInfo';

/**
 * 收藏数节点类型
 */
export enum FavoritesNodeType {
    /**
     * 分组
     */
    group = 0,
    /**
     * 收藏
     */
    policy = 1,
}

@Injectable({
    providedIn: 'root',
})
export class FavoritesService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 获取收藏分组
     */
    getfavoritesGroupNodes(): Observable<Array<any>> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/favoritesGroup/info/findAll';
        return this.http.get<R>(url).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data.map((item: FavoritesGroup) => ({
                        ...item,
                        title: item.groupName,
                        key: item.groupId,
                        isLeaf: !item.haveChild,
                        nodeType: FavoritesNodeType.group,
                    }));
                }
            })
        );
    }

    /**
     * 获取收藏文件
     * @param {string} groupId 分类编码
     */
    getfavoritesFileList(groupId: string): Observable<Array<any>> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/favoritesGroup/info/findByGroupId';
        return this.http.get<R>(`${url}/${groupId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data.map((item: FavoritesInfo) => ({
                        ...item,
                        title: item.favoritesName,
                        key: item.favoritesId,
                        isLeaf: true,
                        nodeType: FavoritesNodeType.policy,
                    }));
                }
            })
        );
    }

    /**
     * 获取收藏分组
     */
    getfavoritesGroupAll(): Observable<Array<FavoritesGroup>> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/favoritesGroup/info/findAll';
        return this.http.get<R>(url).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 新增分类
     */
    saveFavoritesGroupData(data): Observable<FavoritesGroup> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/favoritesGroup/info/save';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 更新分类
     */
    updateFavoritesGroupData(data: FavoritesGroup): Observable<FavoritesGroup> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/favoritesGroup/info/update';
        return this.http.put<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 删除分类
     */
    deleteFavoritesGroup(groupId: string): Observable<boolean> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/favoritesGroup/info/delete';
        return this.http.delete<R>(`${url}/${groupId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return true;
                }
                this.message.error(json.msg);
                return false;
            })
        );
    }

    /**
     * 添加收藏
     */
    saveFavoritesData(data: FavoritesInfo): Observable<FavoritesInfo> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/favorites/info/save';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
                this.message.error(json.msg);
            })
        );
    }

    /**
     * 删除收藏政策文件
     */
    deleteFavoritesData(favoritesId: string): Observable<boolean> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/favorites/info/delete';
        return this.http.delete<R>(`${url}/${favoritesId}`).pipe(map(json => json.code === 0));
    }
}
