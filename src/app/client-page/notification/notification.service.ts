import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, filter, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SendNoticeInfoVO } from './db/vo/SendNoticeInfoVO';
import { SendNoticeStatusEnum } from './db/enums/SendNoticeStatusEnum';
import { OpinionInfoVO } from './db/vo/OpinionInfoVO';
import { R } from 'app/entity/vo/R';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(private http: HttpClient, private message: NzMessageService) { }

    /**
     * 附件上传
     *
     * @param {FormData} data FormData数据
     */
    fileUpload(data: FormData) {
        const url = 'api/gl-file-service/attachment/upload';
        return this.http.post<R>(url, data);
    }

    //#region 机构相关
    /**
     * 查询机构内容
     *
     * @param {string} [orgid='-1'] 父节点
     */
    selectByParentId(groupId: string, orgid: string = '-1') {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListByParent';
        return this.http
            .post<R>(url, {
                ORG_GROUP_ID: groupId,
                SYS_PARENT: orgid,
            })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg || '未知错误');
                    }
                }),
                filter(json => json.code === 0),
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
    //#endregion

    //#region 通知

    /**
     * 通知表格取数
     *
     * @param {*} data 参数
     */
    getNoticeTable(data) {
        let url = 'api/gl-plug-notice-v2/v1/sendNotice/info/select';
        switch (data.index) {
            case 0:
                url = 'api/gl-plug-notice-v2/v1/receiveNotice/info/select';
                break;
            case 1:
                data.status = SendNoticeStatusEnum.NORMAL;
                break;
            case 2:
                data.status = SendNoticeStatusEnum.DRAFT;
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
     * 获得通知内容
     *
     * @param {string} noticeId 通知编码
     */
    getNoticeData(noticeId: string) {
        const url = 'api/gl-plug-notice-v2/v1/sendNotice/info/detail';
        return this.http.get<R>(`${url}/${noticeId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 获得通知内容，阅读通知用
     *
     * @param {string} noticeId 通知编码
     */
    getReadNoticeData(noticeId: string) {
        const url = 'api/gl-plug-notice-v2/v1/receiveNotice/info/detail';
        return this.http.get<R>(`${url}/${noticeId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 保存通知内容
     *
     * @param {SendNoticeInfoVO} data 通知信息
     */
    saveNoticeData(data: SendNoticeInfoVO) {
        const url = 'api/gl-plug-notice-v2/v1/sendNotice/info/save';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                } else {
                    this.message.error(json.msg);
                }
            })
        );
    }

    /**
     * 更新通知内容
     *
     * @param {SendNoticeInfoVO} data 通知内容
     */
    updateNoticeData(data: SendNoticeInfoVO) {
        const url = 'api/gl-plug-notice-v2/v1/sendNotice/info/update';
        return this.http.put<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
                this.message.error(json.msg);
            })
        );
    }

    /**
     * 删除通知内容
     *
     * @param {string} noticeId 通知编码
     */
    deleteNoticeData(noticeId: string) {
        const url = 'api/gl-plug-notice-v2/v1/sendNotice/info/delete';
        return this.http.delete<R>(`${url}/${noticeId}`).pipe(map(json => json.code === 0));
    }

    /**
     * 转发通知
     *
     * @param {*} data 转发内容
     */
    transpondNotice(data) {
        const url = 'api/gl-plug-notice-v2/v1/sendNotice/info/transpondSave';
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
     * 获得已转发的单位
     *
     * @param {string} noticeId 通知编码
     */
    getTranspondList(noticeId: string) {
        const url = 'api/gl-plug-notice-v2/v1/sendNotice/info/findByNoticeId';
        return this.http.get<R>(`${url}/${noticeId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 获取通知读取情况
     *
     * @param {*} data 参数
     */
    getReadStatusList(data) {
        const url = 'api/gl-plug-notice-v2/v1/sendNotice/info/selectByRead';
        const params = new HttpParams({
            fromObject: data,
        });
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
    //#endregion

    //#region 反馈

    /**
     * 获得通知反馈列表
     *
     * @param {*} data 分页参数
     * @returns {Observable<any>} 反馈数据
     * @memberof NotificationService
     */
    getOpinionTable(data): Observable<any> {
        const url = 'api/gl-plug-notice-v2/v1/sendNotice/info/selectByOpinion';
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
     *保存反馈信息
     *
     * @param {OpinionInfoVO} data 反馈信息
     */
    saveOpinionData(data: OpinionInfoVO) {
        const url = 'api/gl-plug-notice-v2/v1/opinion/info/save';
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
     * 获得反馈信息
     *
     * @param {string} noticeId 通知编码
     * @returns {Observable<OpinionInfoVO[]>} 反馈信息
     * @memberof NotificationService
     */
    getOpinionData(noticeId: string): any {
        const url = 'api/gl-plug-notice-v2/v1/opinion/info/findByUser';
        return this.http.get<R>(`${url}/${noticeId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 更新反馈信息
     *
     * @param {OpinionInfoVO} data 反馈信息
     */
    updateOpinionData(data: OpinionInfoVO) {
        const url = 'api/gl-plug-notice-v2/v1/opinion/info/update';
        return this.http.put<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
                this.message.error(`${json.msg}`);
            })
        );
    }
    //#endregion

    getOrgGroupList() {
        const url = 'api/gl-service-data/v1/data/unit/org/group/selectListByParent';
        return this.http
            .post<R>(url, { SYS_PARENT: '-1' })
            .pipe(
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

    /**
     * 查询机构所有的父节点
     *
     * @param {string} [orgId='-1']
     * @returns {Observable<any>}
     * @memberof PersonmgrService
     */
    selectAllParentsByChild(orgId: string = '-1') {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListAllParentById';
        return this.http
            .post<R>(url, { DATA_UNIT_ORG_ID: orgId })
            .pipe(
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }

    /**
     * 获得机构树
     * @param groupId 分组编码
     * @param parent 父节点
     */
    getOrgUnitTree(groupId: string, parent = '-1') {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListByParent';
        return this.http
            .post<R>(url, {
                ORG_GROUP_ID: groupId,
                SYS_PARENT: parent,
            })
            .pipe(
                filter(json => json.code === 0),
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
     * 查询机构内容
     *
     * @param {string} [orgid='-1'] 父节点
     * @returns {Promise<Array<any>>} 返回数据
     * @memberof PersonmgrService
     */
    selectUnitByParentId(orgid: string = '-1') {
        const url = 'api/gl-service-sys-core/v1/data/sys/org/selectByAuthAndParentId';
        return this.http.get<R>(`${url}/${orgid}`).pipe(
            map(json => {
                if (json.code === 0) {
                    const data = json.data;
                    return data.map(item => ({
                        ...item,
                        title: item.orgName,
                        key: item.orgId,
                        isLeaf: !item.haveChild,
                    }));
                }
                return [];
            })
        );
        // return this.cachehelper.getOrgList(orgid);
    }
    /**
     * 搜索单位
     *
     * @param {string} value 搜索内容
     * @returns
     * @memberof PersonmgrService
     */
    selectByAuthSearchValue(groupId: string, keyword: string) {
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
    findUnReadAndUnFeedBack() {
        const url = 'api/gl-plug-notice-v2/v1/receiveNotice/info/findCountByNoHandle';
        return this.http.get(`${url}`).pipe(
            map((json: R) => {
                if (json.code === 0) {
                    return json.data;
                }
                this.message.error(json.msg);
            })
        );
    }

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
}
