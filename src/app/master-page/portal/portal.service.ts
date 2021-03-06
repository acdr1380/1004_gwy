import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { of } from 'rxjs';
import { tap, filter, map } from 'rxjs/operators';
import * as Mock from 'mockjs';

@Injectable({
    providedIn: 'root',
})
export class PortalService {
    constructor(private http: HttpClient, private message: NzMessageService) {}

    /**
     * 注销
     */
    userLogout() {
        const url = 'api/gl-service-sys-user/v1/user/system/auth/logout';
        return this.http.post<R>(url, null).pipe(
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
     * 获得基础管理菜单
     */
    getBaseManageData() {
        return of([
            { label: '机构信息管理', icon: 'apartment' },
            { label: '公务员信息管理', icon: 'file-text' },
            { label: '公务员工资管理', icon: 'pay-circle' },
            { label: '事业工资管理', icon: 'money-collect' },
            { label: '专招管理', icon: 'user-add' },
            // { label: '职级管理', icon: 'ordered-list' },
        ]);
    }

    /**
     * 业务模块
     */
    getOperModuleData() {
        return of([
            { label: '信息初始化' },
            { label: '信息变更' },
            { label: '职级晋升' },
            { label: '考录' },
            { label: '登记' },
            { label: '公务员进入' },
            { label: '公务员退出' },
            { label: '年度考核' },
            // { label: '档案管理' },
            // { label: '人才库管理' },
            // { label: '借调人员' },
        ]);
    }

    /**
     * 政策法规
     */
    getPolicyLawsData() {
        const data = Mock.mock({
            code: 0,
            data: [
                {
                    year: 2020,
                    list: [
                        {
                            title: '公务员辞去公职规定',
                            date: '2021-01-11',
                        },
                        {
                            title: '公务员辞退规定',
                            date: '2021-01-11',
                        },
                        {
                            title: '公务员回避规定',
                            date: '2021-01-11',
                        },
                        {
                            title: '公务员奖励规定',
                            date: '2021-01-11',
                        },
                    ],
                },
                // {
                //     year: 2019,
                //     'list|8': [
                //         {
                //             title: '@cword(5, 40)',
                //             date: '@datetime',
                //         },
                //     ],
                // },
                // {
                //     year: 2018,
                //     'list|3': [
                //         {
                //             title: '@cword(5, 40)',
                //             date: '@datetime',
                //         },
                //     ],
                // },
            ],
            msg: 'ok',
            msgCode: 0,
        });
        return of(data).pipe(map(json => json.data));
    }
}
