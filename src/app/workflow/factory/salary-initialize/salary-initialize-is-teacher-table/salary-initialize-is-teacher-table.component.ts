import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { WorkflowService } from 'app/workflow/workflow.service';
import { CommonService } from 'app/util/common.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';

import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { AllowanceEnum_CN, AllowanceEnum } from '../enums/SalaryWfAllowanceType';
import { NzUploadXHRArgs, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzModalService } from 'ng-zorro-antd/modal';
import * as moment from 'moment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { SalaryInitializeService } from '../salary-initialize.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'salary-initialize-is-teacher-table',
    templateUrl: './salary-initialize-is-teacher-table.component.html',
    styleUrls: ['./salary-initialize-is-teacher-table.component.scss'],
})
export class SalaryInitializeIsTeacherTableComponent implements OnInit {

    allowanceEnumItems = AllowanceEnum_CN;
    allowanceEnum = AllowanceEnum;

    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;

    @Input()
    set jobStepInfo(v) {
        if (v) {
            this._jobStepInfo = v;
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    _personKey: any;
    @Input()
    set personKey(v) {
        if (v) {
            this._personKey = v;
            this.teacherTable.loading = true;
        }
    }
    get personKey() {
        return this._personKey;
    }

    /**
     * 点击的字段，是否是教师护士、是否是义务教育、是否是特殊教育
     */
    _sign: any;
    @Input()
    set sign(v) {
        if (v) {
            this.teacherTable.title = this.allowanceEnumItems[this.allowanceEnum[v]].text;
            this._sign = v;
        }
    }
    get sign() {
        return this._sign;
    }

    @Output() isChange = new EventEmitter<any>();

    constructor(
        private commonService: CommonService,
        private workflowService: WorkflowService,
        private parentService: SalaryInitializeService,
        private modalService: NzModalService,
        private message: NzMessageService,
        private wfTableCode: WfTableHelper,
    ) { }

    /**
     * 表格数据
     */
    teacherTable = {
        visible: false,
        width: 750,
        title: '',
        data: [],
        loading: false,
        open: () => (this.teacherTable.visible = true),
        close: () => {
            this.isChange.emit();
            this.teacherTable.visible = false;
        },
        // 增加
        addRow: () => {
            this.teacherTable.data.push({
                GZ21A03: this.sign,
                GZ21A01: '',
                GZ21A07: '',
                GZ21A04: '',
            });
            this.teacherTable.data = [...this.teacherTable.data];
        },
        // 删除
        deleteData: (data) => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除当前这条记录吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    if (!!data[`${this.wfTableCode.getTableCode('GZ21A')}_ID`]) {
                        const dataArray = {
                            childId: data.childId,
                            keyId: this.personKey,
                            jobId: this.jobStepInfo.jobId,
                            jobStepId: this.jobStepInfo.jobStepId,
                            jobDataId: this.jobStepInfo.jobDataId,
                            changeType: WfDataChangeTypeEnum.DELETE,
                            tableId: this.wfTableCode.getTableCode('GZ21A'),
                        };
                        this.parentService.deleteGZ21A(dataArray).subscribe(() => { });
                    }

                    const index = this.teacherTable.data.indexOf(data);
                    // 删除数据行没有childId时静态删除
                    this.teacherTable.data.splice(index, 1);
                    this.teacherTable.data = [...this.teacherTable.data];
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
    };

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     *上传附件
     */
    upload = {
        visible: false,
        width: 400,
        disable: false,
        currentPerson: null,
        open: data => {
            if (!data.childId) {
                this.message.warning('请先填写基本信息后,再上传附件!');
                return;
            }
            this.upload.currentPerson = data;
            this.upload.visible = true;
            this.upload.disable = false;
            this.upload.uploadIfy.getPersonFileList(data);
        },
        close: () => (this.upload.visible = false),
        /**
         * 文件上传
         */
        uploadIfy: {
            selectedIndex: 0,
            preview: (file: NzUploadFile) => {
                const _index = this.upload.uploadIfy.list.findIndex(x => x.fileId === file.fileId);
                this.upload.uploadIfy.selectedIndex = _index;
                this.onlineDocOverlayElement.show();
                return false;
            },
            fileCustomRequest: (item: NzUploadXHRArgs) => {
                // 构建一个 FormData 对象，用于存储文件或其他参数
                const formData = new FormData();
                // tslint:disable-next-line:no-any
                formData.append('file', item.file as any, item.file.name);
                const file = Object.assign(item.file, {
                    fileName: item.file.name,
                });
                // this.upload.uploadIfy.list.push(file);
                this.commonService.fileUpload(formData).subscribe(result => {
                    file.fileId = result.fileId;
                    file.url = result.filePath = `${this.commonService.getDownFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    file.operFiles = result;
                    // this.upload.uploadIfy.list = [...this.upload.uploadIfy.list];
                    this.upload.uploadIfy.savePersonAnnex(result);
                });
            },

            /**
             * 删除文件-静态删除
             */
            fileRemove: (file: NzUploadFile): boolean => {
                const _index = this.upload.uploadIfy.list.findIndex(x => x.fileId === file.fileId);
                this.upload.uploadIfy.deletePersonFile(this.upload.uploadIfy.list[_index]);
                this.upload.uploadIfy.list.splice(_index, 1);
                this.upload.uploadIfy.list = [...this.upload.uploadIfy.list];
                return true;
            },
            /**
             * 保存人员附件
             */
            savePersonAnnex: file => {
                Object.assign(file, {
                    filePath: file.fileId,
                    jobDataId: this.jobStepInfo.jobDataId,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    keyId: this.upload.currentPerson.childId,
                });

                this.workflowService.savePersonAnnex(file).subscribe(result => {
                    this.upload.uploadIfy.list.push({
                        operFiles: result,
                        fileName: result.fileName,
                        url: `${this.commonService.getOpenFileURL(
                            result.filePath,
                            result.fileName
                        )}`,
                        size: result.fileSize,
                        name: result.fileName,
                        type: result.fileType,
                        fileId: result.filePath,
                    });
                    this.upload.uploadIfy.list = [...this.upload.uploadIfy.list];
                });
            },
            /**
             * 查询人员附件
             */
            getPersonFileList: event => {
                const data = {
                    keyId: event.childId,
                    jobId: this.jobStepInfo.jobId,
                };
                this.workflowService.getPersonFileList(data).subscribe(result => {
                    this.upload.uploadIfy.list = result.map(v => {
                        return {
                            operFiles: v,
                            fileName: v.fileName,
                            url: `${this.commonService.getOpenFileURL(v.filePath, v.fileName)}`,
                            size: v.fileSize,
                            name: v.fileName,
                            type: v.fileType,
                            fileId: v.filePath,
                        };
                    });
                });
            },
            /**
             * 删除附件--数据库删除
             */
            deletePersonFile: data => {
                this.workflowService.deletePersonFile(data.operFiles.id).subscribe();
            },
            list: [],
        },
    };

    ngOnInit() { }

    show() {
        this.getWfData();
        this.teacherTable.open();
    }

    /**
     * 获取子集数据
     */
    getWfData() {
        const data = {
            wfId: this.parentService.wfId,
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
        };
        this.workflowService
            .getwfPersonDataList(data, this.personKey, this.wfTableCode.getTableCode('GZ21A'))
            .subscribe(result => {
                this.teacherTable.loading = false;
                if (!result) {
                    this.teacherTable.data = [];
                } else {
                    result = result.map(v => {
                        return {
                            ...v,
                            childId: v[`${this.wfTableCode.getTableCode('GZ21A')}_ID`],
                        };
                    });
                    // 只显示与GZ21A03字段相匹配的子集数据
                    this.teacherTable.data = result.filter(v => v.GZ21A03 === this.sign);
                }
            });
    }

    /**
     * 保存信息
     */
    saveData(data, status?, event?) {
        if (status) {
            data[status] = event;
        }
        const params = {
            keyId: this.personKey,
            childId: data.childId ? data.childId : -1,
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            jobDataId: this.jobStepInfo.jobDataId,
            changeType: data.childId ? WfDataChangeTypeEnum.MODIFY : WfDataChangeTypeEnum.ADD,
            tableId: this.wfTableCode.getTableCode('GZ21A'),
            data: data,
        };
        this.parentService.saveGZ21A(params).subscribe(result => {
            if (params.changeType === 0) {
                // 新增子集数据保存后替换数据行的childId
                const index = this.teacherTable.data.indexOf(data)
                this.teacherTable.data[index][`${this.wfTableCode.getTableCode('GZ21A')}_ID`] = result.childId;
                this.teacherTable.data[index].childId = result.childId;
            } else {
                // 修改数据更新数据行
                const loc = this.teacherTable.data.findIndex(
                    v => v.childId === result.childId
                );
                this.teacherTable.data[loc] = Object.assign(
                    this.teacherTable.data[loc],
                    result.data
                );
            }
        });
    }
}
