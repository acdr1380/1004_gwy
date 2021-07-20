import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { filter, map, tap } from 'rxjs/operators';
import { R } from 'app/entity/vo/R';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';

@Injectable({
    providedIn: 'root',
})
export class TibetLevelRiseService {
    constructor(
        private http: HttpClient,
        private message: NzMessageService,
        private tableHelper: WfTableHelper
    ) {}
    /**
     * 业务编码
     */
    public wfId = 'tibet_level_rise';

    /**
     * 业务名称
     */
    public wfName = '职务晋升业务';

    /**
     * 获得子集信息
     * @param TABLE_CODE 子集编码
     */
    getSetChildData(TABLE_CODE, id) {
        const setId = TABLE_CODE.split('_').pop();
        const url = `api/gl-service-data-civil/v1/data/person/${setId.toLocaleLowerCase()}/${
            setId.toLocaleLowerCase() === 'a01' ? 'selectOneBySalary' : 'selectListKeyId'
        }`;
        const data = {};
        data[`${this.tableHelper.getTableCode(TABLE_CODE)}${setId !== 'A01' ? '_A01' : ''}_ID`] =
            id;
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
     * 职数方案
     */
    getOptionList(param) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06/selectListByQuery';
        return this.http.post<R>(url, param).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error(json.msg || '获取失败');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取方案列表
     */
    getSchemeByPermission(SCHEME_PERMISSION: string) {
        const url = 'api/gl-service-sys-core/v1/core/system/scheme/selectSchemeByPermission';
        return this.http.post<R>(url, { SCHEME_PERMISSION }).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error('方案列表请求失败');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取业务记录
     */
    selectByWfId() {
        const url = `api/gl-1002-workflow-core/v1/workflow/workbench/info/selectByWfId/${this.wfId}`;
        return this.http.get<R>(url).pipe(
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
     * 获取业务数据
     */
    selectStepInfo(data) {
        const params = new HttpParams({ fromObject: data });
        const url = `api/gl-1002-workflow-core/v1/workflow/job/handle/selectStepStandardInfo`;
        return this.http.get<R>(url, { params }).pipe(
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
     * 删除业务人员
     */
    deletePerson(data) {
        return this.http
            .request<R>(
                'delete',
                'api/gl-1004-workflow-tibet/v1/workflow/tibet/level/rise/job/deleteWfData',
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
     * 保存方案
     */
    saveScheme(data) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/data/tibet/level/rise/scheme/saveAll`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('方案保存成功');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取业务职数方案
     */
    getWfScheme(jobId) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/data/tibet/level/rise/scheme/selectByJobId/${jobId}`;
        return this.http.get<R>(url).pipe(
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
     * 获取职数方案下的人员
     */
    getPersonByScheme(data) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/tibet/level/rise/job/getWfPersonList/${data.jobId}/${data.jobStepId}/${data.schemeId}`;
        return this.http.get<R>(url).pipe(
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
     * 保存方案人员
     */
    savePerson(data) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/data/tibet/level/rise/person/saveAll`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error('人员保存失败');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获取代码项
     */
    getCodeList() {
        const url =
            'api/gl-service-sys-core/v1/core/system/dictionary/item/selectListByDictionaryCode';
        return this.http.post<R>(url, { DICTIONARY_CODE: 'BB003' }).pipe(
            filter(json => json.code === 0),
            map(json =>
                json.data
                    .map(item => ({
                        ...item,
                        label: item.DICTIONARY_ITEM_NAME,
                        text: item.DICTIONARY_ITEM_NAME,
                        value: item.DICTIONARY_ITEM_CODE,
                    }))
                    .sort((a, b) => {
                        return a - b;
                    })
            )
        );
    }

    /**
     * 批量获取人员
     */
    getPersonList(data) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/tibet/level/rise/job/getWfPersonList`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code !== 0) {
                    this.message.error('人员获取失败');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }

    /**
     * 获得方案详情
     * @param ID 方案ID
     */
    getSchemeDataByID(data) {
        const url = 'api/gl-service-data-civil/v1/data/unit/b06/selectOne';
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
     * 删除所有方案
     */
    deleteAll(jobId) {
        return this.http
            .request<R>(
                'delete',
                `api/gl-1004-workflow-tibet/v1/workflow/data/tibet/level/rise/scheme/deleteByJobId/${jobId}`
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
     * 更新方案
     */
    updateScheme(data) {
        const url = `api/gl-1004-workflow-tibet/v1/workflow/data/tibet/level/rise/scheme/update`;
        return this.http.post<R>(url, data).pipe(
            tap(json => {
                if (json.code === 0) {
                    this.message.success('保存成功');
                }
            }),
            filter(json => json.code === 0),
            map(json => json.data)
        );
    }
}
