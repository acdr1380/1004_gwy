import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonService } from 'app/util/common.service';
import { R } from 'app/entity/vo/R';
import { environment } from 'environments/environment';
import { filter, map, tap } from 'rxjs/operators';
import { ResourceTypeEnum } from 'app/entity/enums/ResourceTypeEnum';
import { AppConfig } from 'app/app.config';

/**
 * 导航项
 *
 * @export
 */
export interface BreadcrumbItem {
    text?: string;
    link?: string;
    icon?: string;
    // 返回 back
    type?: 'home' | 'event' | 'text';
    // 自定义
    // tslint:disable-next-line:ban-types
    event?: Function;
}

@Injectable({
    providedIn: 'root',
})
export class ClientService {
    protected appSettings = AppConfig.settings;
    private subject = new Subject<Array<BreadcrumbItem>>();

    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    /**
     * 构建面包屑
     *
     * @param {Array<BreadcrumbItem>} breadcrumbList 面包屑配置
     * @memberof ClientService
     */
    buildBreadCrumb(breadcrumbList: Array<BreadcrumbItem>) {
        this.subject.next(breadcrumbList);
    }

    clearBreadCrumb() {
        this.subject.next();
    }

    getBreadCrumb(): Observable<Array<BreadcrumbItem>> {
        return this.subject.asObservable();
    }

    /**
     * 获得系统菜单
     */
    async getResourceTreeListAll() {
        const url = 'api/gl-service-sys-core/v1/core/system/resource/tree/selectListNav';
        return this.http
            .post<R>(url, { RESOURCE_GROUP_ID: this.appSettings.appServer.RESOURCE_GROUP_ID })
            .pipe(
                filter(json => json.code === 0),
                map(json => {
                    const tree = [];
                    this.commonService.setNavigeList(json.data);
                    this.buildResourceTree(json.data, '-1', tree, 0);
                    return tree;
                })
            )
            .toPromise();
    }

    /**
     * 构造分组下面的菜单为树型结构
     * @param data 数据源
     * @param parentId 父节点
     * @param tree 树
     */
    private buildResourceTree(data: any[], parent: string, tree: any[], level: number) {
        data.forEach(item => {
            if (
                item.SYS_PARENT === parent &&
                (item.SYSTEM_RESOURCE_TYPE === ResourceTypeEnum.CATALOG ||
                    item.SYSTEM_RESOURCE_TYPE === ResourceTypeEnum.MENU)
            ) {
                const newParentNode = {
                    title: item.SYSTEM_RESOURCE_NAME,
                    link: item.SYSTEM_RESOURCE_URL,
                    icon: item.SYSTEM_RESOURCE_ICON,
                    isLeaf: !Boolean(item.SYS_HAVE_CHILD),
                    id: item.SYSTEM_RESOURCE_TREE_ID,
                    children: [],
                    level,
                };
                tree.push(newParentNode);

                if (item.SYS_HAVE_CHILD) {
                    this.buildResourceTree(
                        data,
                        item.SYSTEM_RESOURCE_TREE_ID,
                        newParentNode.children,
                        level + 2
                    );
                }
            }
        });
    }

    /**
     * 注销
     */
    userLogout(AUTH_ID) {
        const url = 'api/gl-service-sys-user/v1/user/system/auth/logoutByAuthId';
        return this.http.post<R>(url, { AUTH_ID }).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('注销成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0)
        );
    }

    /**
     * 是否需要补充账号信息
     */
    isNeedAffirmInfo(userId) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/isNeedAffirmInfo';
        return this.http
            .post<R>(url, {
                SYSTEM_USER_ID: userId,
            })
            .pipe(
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }

    /**
     * 保存账号信息
     * @param data 参数
     */
    updateSysUserInfo(data) {
        const url = 'api/gl-service-sys-user/v1/user/system/user/updateSysUserInfo';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('保存成功。');
                } else {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0)
        );
    }
}
