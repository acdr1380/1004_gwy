import { NzMessageService } from 'ng-zorro-antd/message';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { map, filter, tap } from 'rxjs/operators';
import { ValidatorFn, FormControl, FormGroup } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WfAnnexTypeEnum } from './enums/WfAnnexTypeEnum';
import { environment } from 'environments/environment';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
@Injectable({
    providedIn: 'root',
})
export class WorkflowService {
    //#region 常用校验
    reg = {
        /**
         * 简单校验 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
         */
        IDCardReg:
            /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,

        /**
         * 校验所有数字
         */
        NumberReg: /(^[\-0-9][0-9]*(.[0-9]+)?)$/,
        /**
         * 检验手机号
         */
        contactNumberReg: /^1[34578]\d{9}$/,
    };

    //#endregion

    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}

    //#region 表单相关
    /**
     * 表单验证
     *
     * @memberof CommonService
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

    /**
     * 表单校验
     * @param item 参数
     */
    buildValidatorFn(item): ValidatorFn | ValidatorFn[] | null {
        const func = new Function('item', 'reg', 'value', item.verificationScript);
        return (control: FormControl) => {
            return func(item, this.reg, control.value);
        };
    }
    //#endregion

    //#region 机构相关

    /**
     * 查询机构分组
     */
    getOrgGroupList() {
        const url = 'api/gl-service-data/v1/data/unit/org/group/selectListByParent';
        return this.http.post<R>(url, { SYS_PARENT: '-1' }).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
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

    /**
     * 通过B01Id和groupId查找机构
     */
    getOrgByB01Id(data) {
        const url = 'api/gl-service-data/v1/data/unit/org/selectOneByB01Id';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
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
     * 搜索单位
     * @param groupId 分组
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
                                text: item.ORG_NAME,
                                value: item.DATA_UNIT_ORG_ID,
                            };
                        })
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
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取上报单位
     * @param param0 参数
     */
    selectListForReporting({ ORG_GROUP_ID, ORG_B01_ID }) {
        const url = 'api/gl-service-data/v1/data/common/selectListForReporting';
        return this.http.post<R>(url, { ORG_GROUP_ID, ORG_B01_ID }).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    //#endregion

    //#region 人员查询
    /**
     * 查询人员
     * @param data 参数
     */
    queryPersonList(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectListByQuery';
        return this.http.post<R>(url, data).pipe(
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
                            text: `${item.A0101}`,
                            value: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        };
                    })
            )
        );
    }

    /**
     * 查询人员定位
     * @param data 参数
     */
    queryPersonRowNumber(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectByQueryForRowNumber';
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 1) {
                    this.message.error(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data.ROWNUMBER - 1)
        );
    }
    /**
     * 获取选择人员表格
     * @param {*} data
     */
    selectPsnTblData(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectPageByOrgId';
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
     * 获取选择人员表格
     * @param {*} data
     */
    selectPageByUnitId(data) {
        const url = 'api/gl-service-data-civil/v1/data/person/a01/selectPageByUnitId';
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
    //#endregion

    //#region 业务公用

    /**
     * 获得业务主表信息
     * @param wfId 业务编码
     */
    getWfMainData(wfId: string) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/main/detail';
        return this.http.get<R>(`${url}/${wfId}`).pipe(
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
     * 工作台查询业务
     */
    getQueryByWfList(data) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/workbench/info/getQueryByWfList';
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
     * 查询业务历史步骤信息
     *
     * @param {string} jobId 业务编码
     * @returns {Observable<StepParamMain[]>} 返回可观察者对象
     * @memberof OperCommonService
     */
    selectStepParamMainInfo(jobId: string): Observable<any[]> {
        return this.http
            .get<R>(
                `api/gl-1002-workflow-core/v1/workflow/job/handle/selectStepParamMainInfo/${jobId}`
            )
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        return json.data;
                    } else {
                        this.message.error(json.msg || '业务历史步骤信息获得失败。');
                        return null;
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }

    /**
     * 查询业务数据
     * @param data 业务参数
     */
    getStepStandardInfo(data) {
        const params = new HttpParams({ fromObject: data });
        return this.http
            .get<R>('api/gl-1002-workflow-core/v1/workflow/job/handle/selectStepStandardInfo', {
                params,
            })
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        return json.data;
                    } else {
                        this.message.error(json.msg || '业务信息获取失败。');
                        return null;
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }

    /**
     * 更新业务参数数据
     */
    updateStepStandardInfo(param) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/job/handle/updateStepStandardInfo';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('数据更新成功。');
                } else {
                    this.message.error(json.msg || '更新数据出现未知错误。');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    // /**
    //  * 保存表册数据
    //  */
    // saveWfTableData(data: any[]) {
    //     const url = 'api/gl-1002-workflow-core/v1/workflow/data/change/record/saveAll';
    //     return this.http.post<R>(url, data).pipe(
    //         tap(json => {
    //             if (json.code === 0) {
    //                 this.message.success('表册数据保存成功!');
    //             } else {
    //                 this.message.warning(json.msg || '表册数据保存失败!');
    //             }
    //         }),
    //         filter(json => json.code === 0),
    //         map(json => json.data)
    //     );
    // }
    /**
     * 保存表册数据（保存人员子集单条）
     *     keyId: row[`${this.tableHelper.getTableCode('A01')}_ID`],
    childId: '-1',
    jobId: this.jobStepInfo.jobId,
    jobStepId: this.jobStepInfo.jobStepId,
    jobDataId: this.jobStepInfo.jobDataId,
    changeType: WfDataChangeTypeEnum.MODIFY,
    tableId,
    data: {},
     *
     */
    saveChangeData(data: any) {
        return this.http
            .post<R>('api/gl-1002-workflow-core/v1/workflow/data/change/record/saveOne', data)
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('数据保存成功!');
                    } else {
                        this.message.warning(json.msg || '数据保存失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
    /**
     * 特殊子集处理保存
     */
    saveOneAndSaveSalary(data: any) {
        return this.http
            .post<R>('api/gl-1002-workflow-core/v1/workflow/data/change/record/saveOne', data)
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('表册数据保存成功!');
                    } else {
                        this.message.warning(json.msg || '表册数据保存失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data)
            );
    }
    /**
     *保存多条数据
     */
    saveMultipleTableData(data: any): Observable<boolean> {
        return this.http
            .post<R>('api/gl-1002-workflow-core/v1/workflow/data/change/record/saveMultiple', data)
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('数据保存成功!');
                    } else {
                        this.message.warning(json.msg || '数据保存失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(() => true)
            );
    }
    /**
     * 保存照片
     */
    updateA01PhotoData(data) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/data/change/record/savePic';
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
     * 删除表册数据
     */
    deleteTableData(data: any) {
        return this.http
            .request<R>(
                'delete',
                'api/gl-1002-workflow-core/v1/workflow/data/change/record/delete',
                {
                    body: data,
                }
            )
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('删除成功!');
                    } else {
                        this.message.warning(json.msg || '删除失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(() => true)
            );
    }
    /**
     *特殊处理删除- 删除表册数据
     */
    deleteAndDeleteSalary(data: any) {
        const [par] = data;
        return this.http
            .request<R>(
                'delete',
                'api/gl-1002-workflow-core/v1/workflow/data/change/record/delete',
                {
                    body: data,
                }
            )
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('删除成功!');
                    } else {
                        this.message.warning(json.msg || '删除失败!');
                    }
                }),
                filter(json => json.code === 0),
                map(() => true)
            );
    }

    /**
     * 获得业务步骤信息
     */
    getOperStepList(wfId: string) {
        return this.http
            .get(`api/gl-1002-workflow-core/v1/workflow/step/selectByWfId/${wfId}`)
            .pipe(
                tap((json: R) => {
                    if (json.code === 0) {
                    } else {
                        this.message.error(json.msg || '步骤不存在。');
                    }
                }),
                filter(json => json.code === 0),
                map(json => {
                    const icons = ['solution', 'bank', 'appstore', 'printer', 'snippets'];
                    return json.data.map((item, index) => ({
                        ...item,
                        icon: icons[index],
                    }));
                })
            );
    }

    /**
     * 流程监控
     *
     * @param {string} jobId 业务编码
     */
    selectListByWfTracking(jobId: string) {
        const url = `api/gl-1002-workflow-core/v1/workflow/job/handle/selectListByWfTracking/${jobId}`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '获取历史步骤出错！');
                }
            }),
            filter(json => json.code === 0),
            map(json => {
                return json.data;
            })
        );
    }

    /**
     * 获取审批信息列表
     *
     * @param {string} jobParamId
     * @returns
     * @memberof OperCommonService
     */
    getAuditStateList(jobParamId: string) {
        const url = `api/gl-1002-workflow-core/v1/workflow/param/data/audit/selectListByJobParamId/${jobParamId}/0`;
        return this.http.get<R>(url).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     *审批业务
     */
    saveAudit(data) {
        return this.http
            .post<R>('api/gl-1002-workflow-core/v1/workflow/param/data/audit/save', data)
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('保存成功!');
                    } else {
                        this.message.warning(json.msg || '保存失败!');
                    }
                }),
                map(json => json.data)
            );
    }

    /**
     * 批量保存审批信息
     *
     * @param {} data
     */
    batchSaveAudit(data) {
        return this.http
            .post<R>('api/gl-1002-workflow-core/v1/workflow/param/data/audit/saveAll', data)
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('保存成功!');
                    } else {
                        this.message.warning(json.msg || '保存失败!');
                    }
                }),
                map(json => json.data)
            );
    }

    //#endregion
    // 标准服务
    getStandard(wfId) {
        const arr = [
            'bet_person_register',
            'tibet_person_initialize',
            'tibet_person_register',
            'tibet_person_quit',
            'tibet_plan_apply',
            'tibet_exam_record',
            'tibet_person_edit',
            'tibet_person_enter',
            'tibet_annual_assess',
            'tibet_level_rise',
        ];
        const salary = [
            'salary_civil_post_change',
            'salary_civil_define_level',
            'salary_civil_education_change',
            'salary_civil_allowance_change',
            'salary_civil_high_low',
            'salary_civil_standing_change',
            'salary_civil_punishment_reduce',
            'salary_civil_retire',
            'salary_civil_death',
            'salary_civil_other_reduce',
            'salary_civil_inner_transfer',
            'salary_civil_two_year_rise',
            'salary_civil_level_rise',
            'salary_civil_reset_salary',
            'salary_civil_sick_leave',
            'salary_civil_initialize',
        ];
        if (arr.includes(wfId)) {
            return 'api/gl-1004-workflow-tibet';
        } else if (salary.includes(wfId)) {
            return 'api/gl-1002-workflow-salary-civil';
        } else {
            return 'api/gl-1002-workflow-salary';
        }
    }

    //#region 具体业务相关
    /**
     * 获得业务api路径
     * @param wfId 业务编码
     */
    private getWfURL(wfId): string {
        // const array = wfId.split('_');
        const url = this.getStandard(wfId);
        return url;
    }

    /**
     * 发起业务
     * @param data 发起参数
     */
    start(data) {
        const url = `${this.getWfURL(data.wfId)}/v1/workflow/${data.wfId
            .split('_')
            .join('/')}/job/start`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('业务发起成功，请继续办理.');
                } else {
                    this.message.warning(json.msg);
                }
            }),
            // filter(json => json.code === 0),
            map(json => json)
        );
    }

    /**
     * 提交业务
     *
     * @param {string} wfId
     * @param {} data
     */
    submit(wfId: string, data) {
        const url = `${this.getWfURL(wfId)}/v1/workflow/${wfId.split('_').join('/')}/job/submit`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('业务提交成功。');
                } else {
                    this.message.warning(json.msg);
                }
            }),
            map(json => json.code === 0)
        );
    }

    /**
     * 撤销上报业务
     *
     * @param {} data
     * @returns {Observable<boolean>}
     */
    undo(wfId: string, data) {
        const url = `${this.getWfURL(wfId)}/v1/workflow/${wfId.split('_').join('/')}/job/undo`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('业务撤销成功。');
                } else {
                    this.message.warning(json.msg);
                }
            }),
            map(json => json.code)
        );
    }

    /**
     * 作废业务

     *
     * @param {} data
     * @returns {Observable<boolean>}
     */
    stop(wfId: string, data) {
        const url = `${this.getWfURL(wfId)}/v1/workflow/${wfId.split('_').join('/')}/job/stop`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('业务撤销成功。');
                } else {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0)
        );
    }

    /**
     * 获取人员列表
     * @param {string} wfId
     * @param {JobWfDataParam} data
     */
    getPsnList(wfId: string, data) {
        const url = `${this.getWfURL(wfId)}/v1/workflow/job/wf/data/getWfData`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得人员数据
     */
    getwfPersonDataList(wfParams, personId, TableCode) {
        const url = `${this.getWfURL(wfParams.wfId)}/v1/workflow/job/wf/data/getWfData`;
        const childFields = {};
        childFields[TableCode] = [];
        return this.http
            .post<R>(url, {
                ...wfParams,
                keyIds: [personId],
                childFields,
            })
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.warning(json.msg);
                    }
                }),
                filter(json => json.code === 0),
                map(json => json.data[TableCode])
            );
    }

    /**
     * 获取人员列表 (只有人员列表和审批状态)
     * @param wfId 页面编码
     * @param data 参数
     */
    getWfPersonList(wfId: string, data) {
        const url = `${this.getWfURL(wfId)}/v1/workflow/job/wf/data/getWfPersonList`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg);
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 导人
     * @param {string} wfId
     * @param {} data
     * @returns {Observable<boolean>}
     */
    importPerson(wfId: string, data) {
        const url = `${this.getWfURL(wfId)}/v1/workflow/${wfId
            .split('_')
            .join('/')}/job/importData`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('人员导入成功!');
                } else {
                    this.message.warning(json.msg || '人员导入失败!');
                }
            }),
            map(json => json)
        );
    }

    /**
     * 删除人员
     */
    deletePerson(wfId: string, data) {
        return this.http
            .post<R>(`${this.getWfURL(wfId)}/v1/workflow/job/wf/data/deleteWfData`, data)
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('人员撤选成功!');
                    } else {
                        this.message.warning(json.msg || '人员撤选失败!');
                    }
                }),
                filter(json => json.code === 0)
            );
    }
    /**
     * 业务等待办理到草稿
     *
     * @param {string} wfId
     * @param {*} data
     */
    process(wfId: string, data) {
        const url = `${this.getWfURL(wfId)}/v1/workflow/${wfId.split('_').join('/')}/job/process`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.warning(json.msg || '业务等待办理到草稿失败!');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     *
     * @param wfId 业务名称
     * @param jobId 业务编码
     * @param jobStepId 业务步骤编码
     */
    getOperAuditState(wfId: string, jobId: string, jobStepId: string) {
        const url = `${this.getWfURL(wfId)}/v1/workflow/${wfId
            .split('_')
            .join('/')}/job/selectStepAuditState`;
        const params = new HttpParams({ fromObject: { jobId: jobId, jobStepId: jobStepId } });
        return this.http.get<R>(url, { params }).pipe(
            // tap(json => {
            //     if (json.code !== 0) {
            //         this.message.warning(json.msg || '业务全局状态获得失败');
            //     }
            // }),
            // filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取业务审批历史
     *
     */
    getAuditHistory(jobId: string) {
        return this.http
            .get<R>(
                `api/gl-1002-workflow-core/v1/workflow/param/data/audit/selectListByJobId/${jobId}/0`
            )
            .pipe(
                tap(json => {
                    if (json.code !== 0) {
                        this.message.error(json.msg || '业务获取审批历史获取失败。');
                    }
                }),
                filter(json => json.code === 0),
                map(json => {
                    return json.data;
                })
            );
    }
    //#endregion

    //#region 业务附件

    /**
     * 获取业务所需要上传的附件
     */
    getWfFileByWfIdAndStepId(data, type = WfAnnexTypeEnum.PERSON) {
        return this.http
            .get<R>(
                `api/gl-1002-workflow-core/v1/workflow/step/annex/selectListByWfIdAndStepId/${data.wfId}/${data.stepId}/${type}`
            )
            .pipe(
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
     * 保存人员附件
     *
     * @param {} data
     */
    savePersonAnnex(data) {
        return this.http
            .post<R>('api/gl-1002-workflow-core/v1/workflow/data/attachment/save', data)
            .pipe(
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
     * 获取单人所有附件
     *
     * @param {*} data
     */
    getPersonFileList(data) {
        const params = new HttpParams({ fromObject: data });
        return this.http
            .get<R>('api/gl-1002-workflow-core/v1/workflow/data/attachment/selectByJobIdAndKeyId', {
                params,
            })
            .pipe(
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
     * 删除人员附件根据芒果Id
     *
     * @param {String} id
     * @returns
     */
    deletePersonFile(id: String) {
        return this.http
            .delete<R>(`api/gl-1002-workflow-core/v1/workflow/data/attachment/delete/${id}`)
            .pipe(
                tap(json => {
                    if (json.code === 0) {
                        this.message.success('附件删除成功!');
                    } else {
                        this.message.warning(json.msg || '附件删除失败!');
                    }
                }),
                filter(json => json.code === 0)
            );
    }
    /**
     * 工资业务取表格数据
     */
    getWfListData(data) {
        const url = 'api/gl-1002-workflow-core/v1/workflow/job/wf/data/getWfListData';
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
     * 工资业务计算
     */
    salaryCalculation(data) {
        const url = `api/gl-1002-workflow-salary/v1/workflow/job/salary/salaryExecute`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('数据计算成功!');
                } else {
                    this.message.error(json.msg);
                }
            }),
            map(json => {
                if (json.code === 0) {
                    return true;
                }
                return false;
            })
        );
    }

    /**
     * 工资业务计算
     */
    salaryCivilCalculation(data) {
        const url = `api/gl-1002-workflow-salary-civil//v1/workflow/job/salary/salaryExecute`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg);
                } else {
                    this.message.success('数据计算成功!');
                }
            }),
            map(json => json.code === 0)
        );
    }

    /**
     * 数据校验
     */
    dataVerification(data) {
        const url = 'api/gl-1002-workflow-salary-civil/v1/workflow/job/salary/dataVerification';
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
    //#endregion
}
