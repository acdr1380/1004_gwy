import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { CommonService } from 'app/util/common.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class SalaryDistributeService {
    // 初始化年可选数据
    time = new Date();
    year = Number(this.time.getFullYear());
    yearRange = [];
    month = this.time.getMonth() + 1;
    monthStr = this.month < 10 ? '0' + this.month : '' + this.month;

    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    /**
     * 获取机构树数据
     * @param groupId 分组编码
     * @param parent 父节点
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
     * 查询机构分组
     */
    getOrgGroupList() {
        const url = 'api/gl-service-data/v1/data/unit/org/group/selectListByParent';
        return this.http.post<R>(url, { SYS_PARENT: '-1' }).pipe(
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
     * 获得机构所有父节点
     * @param id 编码
     */
    getOrgParentAllList(id) {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListAllParentById';
        return this.http.post<R>(url, { DATA_UNIT_ORG_ID: id }).pipe(
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 搜索单位
     * @param groupId 分组编码
     * @param keyword 搜索关键字
     */
    selectListByQuery(groupId: string, keyword: string) {
        const url = 'api/gl-service-data/v1/data/unit/org/selectListByQuery';
        return this.http
            .post<R>(url, {
                ORG_GROUP_ID: groupId,
                ORG_NAME: keyword,
            })
            .pipe(
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

    // 查询工资发放人员
    getPayroller(param) {
        const url =
            'api/gl-service-data-civil/v1/data/person/gz61/selectGz61ByB01IdAndYearAndMonth';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    // 输出单位发放信息
    outputDistribute(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b62/outPutExcel';
        this.commonService.downFilePost(url, param);
    }

    // 查询单位发放信息
    getDistributionInfo(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b62/selectAllByOrg';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    // 查询生成信息
    getGenerateInfo(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b62/selectAllByB01IdAndYear';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    // 删除发放草稿
    deleteDistribute(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b62/delete';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                this.message.success('删除成功！');
            })
        );
    }

    // 生成直发
    distributeSalary(param) {
        const url = 'api/gl-service-data-civil/v1/data/person/gz61/createData';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                this.message.success('生成成功！');
            })
        );
    }

    // 改变发放状态
    changeState(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b62/update';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '出错啦！');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                this.message.success('归档成功！');
            })
        );
    }
}
