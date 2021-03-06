import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';

import { NzTreeNode } from 'ng-zorro-antd/tree';
import { timer } from 'rxjs';
import { environment } from 'environments/environment';
import { filter, map, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import {
    FormGroup,
    ValidatorFn,
    FormControl,
    ValidationErrors,
    AsyncValidatorFn,
} from '@angular/forms';
import { AppConfig } from 'app/app.config';
@Injectable({
    providedIn: 'root',
})
export class CommonService {
    protected appSettings = AppConfig.settings;
    constructor(private http: HttpClient, private message: NzMessageService) {}

    //#region 登录账号相关

    /**
     * 缓存有权限菜单
     * @param list 菜单列表
     */
    setNavigeList(list): void {
        sessionStorage.setItem(
            environment.config.PROJECT_PATH_ROOT + '_navige',
            JSON.stringify(list)
        );
    }
    /**
     * 获得权限菜单
     */
    getNavigeList() {
        const listStr = sessionStorage.getItem(environment.config.PROJECT_PATH_ROOT + '_navige');
        return JSON.parse(listStr);
    }

    /**
     * 本地缓存保存用户登录信息
     * @param data 用户登录信息
     */
    setUserLoginInfo(data): void {
        const { token, id, sessionUser } = data;
        sessionStorage.removeItem(environment.config.PROJECT_PATH_ROOT + '_userInfo_cache');
        sessionStorage.setItem(environment.config.PROJECT_PATH_ROOT + '_token', token);
        sessionStorage.setItem(environment.config.PROJECT_PATH_ROOT + '_id', id);
        sessionStorage.setItem(
            environment.config.PROJECT_PATH_ROOT + '_sessionUser',
            JSON.stringify(sessionUser)
        );
    }

    /**
     * 获得用户登录信息
     */
    getUserLoginInfo(): any {
        const token = sessionStorage.getItem(environment.config.PROJECT_PATH_ROOT + '_token');
        const id = sessionStorage.getItem(environment.config.PROJECT_PATH_ROOT + '_id');
        const sessionUser = JSON.parse(
            sessionStorage.getItem(environment.config.PROJECT_PATH_ROOT + '_sessionUser')
        );
        return { token, id, ...sessionUser };
    }

    /**
     * 获取用户信息
     */
    getUserInfoByCache() {
        return new Promise((resolve, reject) => {
            const userInfo = sessionStorage.getItem(
                environment.config.PROJECT_PATH_ROOT + '_userInfo_cache'
            );
            if (userInfo) {
                resolve(JSON.parse(userInfo));
            } else {
                const url = 'api/gl-service-sys-user/v1/user/system/user/selectOneByCache';
                // const SYSTEM_USER_ID = sessionStorage.getItem(
                //     environment.config.PROJECT_PATH_ROOT + '_id'
                // );

                const userInfo = this.getUserLoginInfo();
                const SYSTEM_USER_ID = userInfo.userId;
                this.http
                    .post<R>(url, { SYSTEM_USER_ID })
                    .pipe(
                        tap(json => {
                            if (json.code !== 0) {
                                this.message.error('加载用户信息失败。');
                            } else {
                                sessionStorage.setItem(
                                    environment.config.PROJECT_PATH_ROOT + '_userInfo_cache',
                                    JSON.stringify(json.data)
                                );
                            }
                        }),
                        map(json => json.data)
                    )
                    .subscribe(result => resolve(result));
            }
        });
    }
    //#endregion

    //#region 表单相关
    /**
     * 表单验证
     */
    formVerify = (form: FormGroup): boolean => {
        // tslint:disable-next-line:forin
        for (const i in form.controls) {
            form.controls[i].markAsDirty();
            form.controls[i].updateValueAndValidity();
        }
        // 表单验证状态
        if (form.status !== 'VALID') {
            return false;
        }
        return true;
    };

    //#endregion

    //#region 界面方案

    /**
     * 获取界面方案
     *
     * @param {string} permission 界面方案标识
     * @returns {Observable<any>} 界面方案内容
     * @memberof CacheHelperService
     */
    getSchemeContent(permission: string) {
        const url = 'api/gl-service-sys-core/v1/core/system/scheme/selectSchemeByPermission';
        return this.http.post<R>(url, { SCHEME_PERMISSION: permission }).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error('界面方案未找到。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得字段方案信息
     * @param identifier 编码
     */
    getFieldSchemeConent(identifier: string) {
        const url = 'api/gl-service-sys-core/v1/core/system/field/scheme/selectSchemeByIdentifier';
        return this.http.post<R>(url, { FIELD_SCHEME_IDENTIFIER: identifier }).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error('字段方案未找到。');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                const data = json.data;
                data.systemSchemeEdit = data.systemSchemeEdit.map(item => {
                    return {
                        ...item,
                        SCHEME_EDIT_CHECK_SCRIPT: item.FIELD_EDIT_CHECK_SCRIPT,
                        SCHEME_EDIT_COLUMN_ID: item.FIELD_EDIT_COLUMN_ID,
                        SCHEME_EDIT_DISPLAY_NAME: item.FIELD_EDIT_DISPLAY_NAME,
                        SCHEME_EDIT_EDIT_WIDTH: item.FIELD_EDIT_EDIT_WIDTH,
                        SCHEME_EDIT_IS_MUST_INPUT: item.FIELD_EDIT_IS_MUST_INPUT,
                        SCHEME_EDIT_IS_READONLY: item.FIELD_EDIT_IS_READONLY,
                        SCHEME_EDIT_LABEL_WIDTH: item.FIELD_EDIT_LABEL_WIDTH,
                    };
                });
                return data;
            })
        );
    }
    //#endregion

    //#region 文件下载
    /**
     * get方式下载
     * @param url 下载路径
     * @param downFileName 下载文件名(可不传)
     * @param httParams 下载参数（可不传）
     */
    downFileGet(url: string, downFileName?: string, httParams?: any): void {
        const headerJSON: any = { 'Content-Type': 'application/json;charset=UTF-8' };
        const userInfo = this.getUserLoginInfo();
        if (userInfo.token && userInfo.id) {
            headerJSON.Authorization = userInfo.token;
            headerJSON['X-Auth-Id'] = userInfo.id;
        }
        this.http
            .get<Blob>(url, {
                observe: 'response',
                headers: new HttpHeaders(headerJSON),
                params: httParams,
                responseType: 'blob' as 'json',
            })
            .subscribe({
                next: (resp: HttpResponse<Blob>) => {
                    console.log(resp.headers.get('content-disposition'));
                    const type2 = 'application/x-msdownload';
                    const blob = new Blob([resp.body], { type: type2 });
                    if (resp.headers.get('content-disposition')) {
                        const list = resp.headers.get('content-disposition').split(';');
                        const fileName = list.find(x => x.indexOf('filename') > -1);
                        if (fileName) {
                            downFileName = decodeURI(fileName)
                                .split('=')[1]
                                .toString()
                                .replace(/"/g, '')
                                .trim();
                        }
                    }

                    const dataURL = window.URL.createObjectURL(blob);
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob);
                        return;
                    }
                    const ellink = document.createElement('a');
                    ellink.href = dataURL;
                    ellink.download = downFileName;
                    ellink.click();
                    timer(100).subscribe(x => window.URL.revokeObjectURL(dataURL));
                },
                error: () => {
                    this.message.warning('文件下载异常');
                },
                complete: () => {
                    this.message.success('文件下载完成');
                },
            });
    }

    /**
     * post方式下载文件
     * @param url 下载路径
     * @param pdata 下载参数(可不传)
     * @param downFileName 下载文件名(可不传)
     */
    downFilePost(url: string, pdata?: any, downFileName?: string): void {
        const headerJSON: any = { 'Content-Type': 'application/json;charset=UTF-8' };
        const userInfo = this.getUserLoginInfo();
        if (userInfo.token && userInfo.id) {
            headerJSON.Authorization = userInfo.token;
            headerJSON['X-Auth-Id'] = userInfo.id;
        }
        this.http
            .post<Blob>(url, pdata, {
                observe: 'response',
                headers: new HttpHeaders(headerJSON),
                responseType: 'blob' as 'json',
            })
            .subscribe({
                next: (resp: HttpResponse<Blob>) => {
                    console.log(resp.headers.get('content-disposition'));
                    const type2 = 'application/x-msdownload';
                    const blob = new Blob([resp.body], { type: type2 });
                    if (resp.headers.get('content-disposition')) {
                        const list = resp.headers.get('content-disposition').split(';');
                        const fileName = list.find(x => x.indexOf('filename') > -1);
                        if (fileName) {
                            downFileName = decodeURI(fileName)
                                .split('=')[1]
                                .toString()
                                .replace(/"/g, '')
                                .trim();
                        }
                    }

                    const dataURL = window.URL.createObjectURL(blob);
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob);
                        return;
                    }
                    const ellink = document.createElement('a');
                    ellink.href = dataURL;
                    ellink.download = downFileName;
                    ellink.click();
                    timer(100).subscribe(x => window.URL.revokeObjectURL(dataURL));
                },
                error: () => {
                    this.message.warning('文件下载异常');
                },
                complete: () => {
                    this.message.success('文件下载完成');
                },
            });
    }
    //#endregion

    //#region 界面方案校验

    /**
     * 表单校验，界面方案校验脚本
     *
     * @param {any} item
     * @returns {(	ValidatorFn | 	ValidatorFn[] | null)}
     * @memberof CommonVerifyService
     */
    buildValidatorsFn(item, script, fieldList?): ValidatorFn {
        const triggerEvent = new Function('field', 'value', 'control', 'fieldList', script);
        return (control: FormControl) => triggerEvent(item, control.value, control, fieldList);
    }

    /**
     * 表单校验，界面方案校验脚本
     *
     * @param {any} item
     * @returns {(AsyncValidatorFn | AsyncValidatorFn[] | null)}
     * @memberof CommonVerifyService
     */
    buildAsyncValidatorsFn(item, script): AsyncValidatorFn | AsyncValidatorFn[] | null {
        const triggerEvent = new Function('field', 'value', 'http', 'fg', script);
        return (control: FormControl) =>
            new Promise<ValidationErrors>(async resolve => {
                const result = await triggerEvent(item, control.value, this.http, control.parent);
                if (!result.status) {
                    resolve(<ValidationErrors>{ error: true, duplicated: true, msg: result.msg });
                }
                resolve(null);
            });
    }

    /**
     * 表单校验脚本 模板代码
     */
    private testScript() {
        // 可用变量
        // field: 字段相关信息
        // value: 当前字段的值
        // control: 整个界面的formGroup
        // fieldList: 渲染界面的字段列表
        // if (value) {
        //     if (new Date(value) - new Date() > 0) {
        //         return { msg: '不允许晚于当前时间' };
        //     }
        // }
        // return {};
        // // 分割线
        // if (value) {
        //     const A1407 = fg.get('A1407').value;
        //     if (new Date(value) - new Date(A1407) < 0) {
        //         return { status: false, msg: '不允许早于批准日期' };
        //     }
        //     if (new Date() - new Date(value) < 0) {
        //         return { msg: '不允许晚于当前时间' };
        //     }
        // }
        // return {};
        // // 分割线
        // if (value) {
        //     var reg = /[\s]/;
        //     if (reg.test(value)) {
        //         return { msg: '不允许有空格' };
        //     }
        // }
        // return {};
    }
    //#endregion

    //#region 机构相关

    /**
     * 获取机构分组
     */
    getOrgGroupList() {
        const url = 'api/gl-service-data/v1/data/unit/org/group/selectListByParent';
        return this.http.post<R>(url, { SYS_PARENT: '-1' }).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error('机构分组加载失败！');
                }
            }),
            filter(json => json.code === 0),
            map(json =>
                json.data.map(item => ({
                    ...item,
                    label: item.ORG_GROUP_NAME,
                    value: item.DATA_UNIT_ORG_GROUP_ID,
                }))
            )
        );
    }

    //#region 选中下层使用方法

    /**
     * 获得选中下层单位数量
     */
    getCheckedTreeNodeCount(data) {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListForOrgCount';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 获得选中下层节点
     *
     * @param {NzTreeNode[]} data 选中节点
     * @returns {NzTreeNode[]} 去重节点
     * @memberof SettingService
     */
    getTreeDateCheckedLevelList(data: NzTreeNode[]): NzTreeNode[] {
        return data.filter(node => {
            // 未选中下层节点
            if (!node.origin.includeChild) {
                return true;
            }
            // 无父节点
            if (!node.parentNode) {
                return true;
            }
            // 所有父节点未包含下层
            return !this.getParentNodesIsincludeChild(node.parentNode);
        });
    }

    /**
     * 获得所有父节点是否存在包含下层
     *
     * @private
     * @param {NzTreeNode} node 节点
     * @returns {boolean} 是否有包含下层父节点存在
     * @memberof SettingComponent
     */
    private getParentNodesIsincludeChild(node: NzTreeNode): boolean {
        if (node.origin.includeChild) {
            return true;
        } else {
            if (node.parentNode) {
                return this.getParentNodesIsincludeChild(node.parentNode);
            }
        }
    }

    //#endregion

    //#endregion

    //#region  文件上传
    /**
     * 附件上传
     *
     * @param {FormData} data FormData数据
     */
    fileUpload(data: FormData) {
        const url = 'api/gl-file-service/attachment/upload';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('附件上传成功。');
                } else {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 附件打开
     * @param fileId 文件ID
     * @param fileName 文件名称
     */
    getOpenFileURL(fileId: string, fileName?: string) {
        let url = `api/gl-file-service/static/attachment/${fileId}`;
        if (fileName) {
            url += `?fileName=${encodeURI(fileName)}`;
        }
        return url;
    }
    /**
     * 附件下载
     * @param fileId 文件ID
     * @param fileName 文件名称
     */
    getDownFileURL(fileId: string, fileName?: string) {
        let url = `api/gl-file-service/attachment/${fileId}`;
        if (fileName) {
            url += `?fileName=${encodeURI(fileName)}`;
        }
        return url;
    }
    /**
     * 照片打开
     * @param fileId 文件ID
     * @param fileName 文件名称
     */
    getOpenPhotoURL(fileId: string, fileName?: string) {
        let url = `api/gl-file-service/static/photo/${fileId}`;
        if (fileName) {
            url += `?fileName=${encodeURI(fileName)}`;
        }
        return url;
    }
    //#endregion
}
