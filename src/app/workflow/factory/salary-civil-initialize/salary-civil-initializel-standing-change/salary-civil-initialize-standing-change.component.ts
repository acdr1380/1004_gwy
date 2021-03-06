import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import * as moment from 'moment';
import { CommonService } from 'app/util/common.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { SalaryCivilInitializeService } from '../salary-civil-initialize.service';
import { SalaryCivilInitializePersonTableComponent } from '../salary-civil-initialize-person-table/salary-civil-initialize-person-table.component';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'salary-civil-initialize-standing-change',
    templateUrl: './salary-civil-initialize-standing-change.component.html',
    styleUrls: ['./salary-civil-initialize-standing-change.component.scss'],
})
export class SalaryCivilInitializeStandingChangeComponent implements OnInit {
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
    @Output() saveChange = new EventEmitter<any>();

    /**
     * 当前选中人员keyId
     */
    @Input() personInf: any;

    /**
     * 是否修改工龄抽屉任意数据，如果有改动抽屉关闭后保存A01数据
     */
    isModifiedData = false;

    /**
     * 工龄抽屉
     */
    standChangeDrawer = {
        A01AndGZA01: <any>{
            A01: {},
            GZA01: {},
        },
        visible: false,
        width: 600,
        data: <any>[],
        open: () => (this.standChangeDrawer.visible = true),
        close: () => {
            if (this.isModifiedData) {
                this.saveChange.emit();
            }
            this.standChangeDrawer.visible = false;
        },
        /**
         * 增加数据
         */
        addRow: () => {
            this.standChangeDrawer.data = [
                ...this.standChangeDrawer.data,
                {
                    GZ1401: '',
                    GZ1402: '',
                    GZ1403: '',
                    GZ1403_CN: '',
                },
            ];
        },
        /**
         * 删除
         */
        deleteRow: (data, index) => {
            this.modalService.confirm({
                nzTitle: '系统提示?',
                nzContent: `<b style="color: red;">确定要删除当前记录吗？</b>`,
                nzOkText: '确定',
                nzOkType: 'danger',
                nzOnOk: () => {
                    if (data['tableId']) {
                        const _loading = this.loading.show();
                        const dataArray = [
                            {
                                childId: data.tableId,
                                keyId: this.personInf,
                                jobId: this.jobStepInfo.jobId,
                                jobStepId: this.jobStepInfo.jobStepId,
                                jobDataId: this.jobStepInfo.jobDataId,
                                changeType: WfDataChangeTypeEnum.DELETE,
                                tableId: this.wfTableCode.getTableCode('GZ14'),
                            },
                        ];
                        this.workflowService.deleteTableData(dataArray).subscribe(result => {
                            this.isModifiedData = true;
                            // 刷新计算工龄数据
                            this.innerTable.conmputeA0134AndA0149();
                            _loading.close();
                        });
                    }
                    this.standChangeDrawer.data.splice(index, 1);
                    this.standChangeDrawer.data = [...this.standChangeDrawer.data];
                },
                nzCancelText: '取消',
                nzOnCancel: () => console.log('Cancel'),
            });
        },
        calculation: () => {
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                // isAllData: false,
                // handlerIds工资处理器业务
                handlerIds: ['601'],
                keyIds: [this.personInf],
            };
            this.workflowService.salaryCalculation(data).subscribe(result => {
                this.getWfData();
            });
        },

        // 同时保存GZA01和GZ14
        saveGZA01AndGZ14: () => {
            const { jobId, jobStepId, jobDataId } = this.jobStepInfo;
            const pd = {
                jobId,
                jobStepId,
                jobDataId,
            };
            // GZ14
            if (this.standChangeDrawer.data.length > 0) {
                const paramsArrGZ14 = [];
                this.standChangeDrawer.data.forEach(ele => {
                    const DATA = {
                        ...pd,
                        tableId: this.wfTableCode.getTableCode('GZ14'),
                        keyId: this.personInf,
                        childId: ele.tableId ? ele.tableId : -1,
                        changeType: ele.tableId
                            ? WfDataChangeTypeEnum.MODIFY
                            : WfDataChangeTypeEnum.ADD,
                        data: ele,
                    };
                    paramsArrGZ14.push(DATA);
                });
                this.workflowService.saveMultipleTableData(paramsArrGZ14).subscribe(result => {
                    if (result) {
                        this.isModifiedData = true;
                        // GZ14子集有改动重新计算工龄
                        this.innerTable.conmputeA0134AndA0149();
                    }
                });
            }

            // GZA01
            const { W0168, W0405, W0152 } = this.standChangeDrawer.A01AndGZA01.GZA01;
            let fieldsArr = [];
            fieldsArr = [W0168, W0405, W0152];
            if (fieldsArr.every(item => item === undefined) || fieldsArr.every(item => item === null)) {
                return;
            }
            const paramsArrGZA01 = [];
            paramsArrGZA01.push({
                ...pd,
                keyId: this.personInf,
                childId: this.standChangeDrawer.A01AndGZA01.GZA01[`${this.wfTableCode.getTableCode('GZA01')}_ID`],
                changeType: WfDataChangeTypeEnum.MODIFY,
                tableId: this.wfTableCode.getTableCode('GZA01'),
                data: { W0168, W0405, W0152 },
            });
            this.workflowService.saveMultipleTableData(paramsArrGZA01).subscribe();
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
        currentPerson: null,
        selectIndex: -1,
        open: (data, i) => {
            this.upload.currentPerson = data;
            if (!data.tableId) {
                this.message.warning('请先填写基本信息!');
                return;
            }
            this.upload.selectIndex = i;
            this.upload.visible = true;
            this.upload.uploadIfy.getPersonFileList(data);
        },
        close: () => {
            this.upload.visible = false;
        },
        /**
         * 文件上传
         */
        uploadIfy: {
            selectedIndex: 0,
            fileCustomRequest: item => {
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
                    // file.url = result.filePath = `api/gl-file-service/static/attachment/${result.fileId}?fileName=${result.fileName}`;
                    file.operFiles = result;
                    file.fileId = result.fileId;
                    // this.upload.uploadIfy.list = [...this.upload.uploadIfy.list];
                    this.upload.uploadIfy.savePersonAnnex(result);
                });
            },

            /**
             * 删除文件-静态删除
             */
            fileRemove: file => {
                const _index = this.upload.uploadIfy.list.findIndex(x => x.fileId === file.fileId);
                this.upload.uploadIfy.deletePersonFile(this.upload.uploadIfy.list[_index]);
                this.upload.uploadIfy.list.splice(_index, 1);
                this.upload.uploadIfy.list = [...this.upload.uploadIfy.list];

                return true;
            },
            preview: file => {
                const _index = this.upload.uploadIfy.list.findIndex(x => x.fileId === file.fileId);
                this.upload.uploadIfy.selectedIndex = _index;
                this.onlineDocOverlayElement.show();
                return false;
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
                    keyId: this.upload.currentPerson.tableId,
                });

                this.workflowService.savePersonAnnex(file).subscribe(result => {
                    this.upload.uploadIfy.list.push({
                        operFiles: result,
                        fileName: result.fileName,
                        url: `${this.commonService.getDownFileURL(
                            result.filePath,
                            result.fileName
                        )}`,
                        // url: `api/gl-file-service/static/attachment/${result.filePath}?fileName=${result.fileName}`,
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
                    keyId: event.tableId,
                    jobId: this.jobStepInfo.jobId,
                };
                this.workflowService.getPersonFileList(data).subscribe(result => {
                    this.upload.uploadIfy.list = result.map(v => {
                        return {
                            operFiles: v,
                            fileName: v.fileName,
                            url: `${this.commonService.getDownFileURL(v.fileId, v.fileName)}`,

                            // url: `api/gl-file-service/static/attachment/${v.filePath}?fileName=${v.fileName}`,
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
    constructor(
        private message: NzMessageService,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private commonService: CommonService,
        private service: SalaryCivilInitializeService,
        private innerTable: SalaryCivilInitializePersonTableComponent,
        private loading: LoadingService,
        private wfTableCode: WfTableHelper,
    ) { }

    ngOnInit() { }
    /**
     * 点击显示
     */
    show(data?) {
        this.isModifiedData = false;
        this.getWfData();
        this.standChangeDrawer.open();
    }
    /**
     * 获取数据
     */
    getWfData() {
        const params = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            keyIds: [this.personInf],
            childFields: {
                [`${this.wfTableCode.getTableCode('A01')}`]: [],
                [`${this.wfTableCode.getTableCode('GZA01')}`]: [],
                [`${this.wfTableCode.getTableCode('GZ14')}`]: [],
            },
        };
        this.workflowService.getPsnList(this.service.wfId, params).subscribe(result => {
            const [A01] = result[this.wfTableCode.getTableCode('A01')];
            const [GZA01] = result[this.wfTableCode.getTableCode('GZA01')];
            this.standChangeDrawer.A01AndGZA01 = {
                A01: A01,
                GZA01: GZA01,
            };
            const gz14Code = `${this.wfTableCode.getTableCode('GZ14')}`;
            if (result[gz14Code]) {
                this.standChangeDrawer.data = result[gz14Code].map(v => {
                    return {
                        ...v,
                        tableId: v[`${gz14Code}_ID`],
                    };
                });
            } else {
                this.standChangeDrawer.data = [];
            }
        });
    }
}
