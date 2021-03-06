import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CivilWorkChangeService } from './civil-work-change.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { CommonService } from 'app/util/common.service';
import { DatePipe } from '@angular/common';
import { WfDataChangeTypeEnum } from 'app/workflow/enums/WfDataChangeTypeEnum';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
@Component({
    // tslint:disable-next-line: component-selector
    selector: 's-work-change',
    templateUrl: './civil-work-change.component.html',
    styleUrls: ['./civil-work-change.component.scss'],
})
export class CivilWorkChangeComponent implements OnInit {
    canEdit = false;

    /**
     * 业务信息
     */
    _jobStepInfo: JobStepInfo;
    @Input()
    set jobStepInfo(v) {
        if (v) {
            this.canEdit = v.jobStepState === JobStepStateEnum.PROCESSING;
            this._jobStepInfo = v;
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    /**
     *人员信息
     */
    _personInf: any;
    @Input()
    set personInf(v) {
        if (v) {
            this._personInf = { ...v, keyId: v[`${this.tableHelper.getTableCode('A01')}_ID`] };
            this.getChangeBefore();
        }
    }
    get personInf() {
        return this._personInf;
    }

    @Output() calculateChange = new EventEmitter();

    /**
     * 工龄情况
     */
    conditionDrw = {
        visible: false,
        width: 700,
        title: '工龄情况',
        headArr: Array(5),
        widthConfig: [
            // 变动前
            '80px',
            '80px',
            '80px',
            '80px',
            '80px',
        ],
        open: () => {
            this.conditionDrw.visible = true;
        },
        close: () => {
            this.calculateChange.emit();
            this.conditionDrw.visible = false;
        },
        /**
         * A01基本信息
         */
        A01Data: <any>{},
        /**
         * 变动前数据
         */
        beforeTable: {
            data: [],
            pageSize: 5,
            pageIndex: 1,
        },
        /**
         * 变动后数据
         */
        afterTable: {
            data: [],
            pageSize: 5,
            pageIndex: 1,
        },
        /**
         * 计算
         */
        calculation: () => {
            const _loading = this.loading.show();
            const data = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                isAllData: true,
                // handlerIds工资处理器业务
                handlerIds: ['601'],
                keyIds: [this.personInf.keyId],
            };
            this.workflowService.salaryCivilCalculation(data).subscribe(() => {
                this.calculateChange.emit();
                _loading.close();
            });
        },
        /**
         * 增加
         */
        addRow: () => {
            this.conditionDrw.afterTable.data = [
                ...this.conditionDrw.afterTable.data,
                {
                    GZ1401: '',
                    GZ1402: '',
                    GZ1403: '',
                },
            ];
        },
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
                                keyId: this.personInf.keyId,
                                jobId: this.jobStepInfo.jobId,
                                jobStepId: this.jobStepInfo.jobStepId,
                                jobDataId: this.jobStepInfo.jobDataId,
                                changeType: WfDataChangeTypeEnum.DELETE,
                                tableId: `${this.tableHelper.getTableCode('GZ14')}`,
                            },
                        ];
                        this.workflowService.deleteTableData(dataArray).subscribe(() => {
                            // 删除计算工龄
                            this.conmputeA0134AndA0149();
                            _loading.close();
                        });
                    }
                    this.conditionDrw.afterTable.data.splice(index, 1);
                    this.conditionDrw.afterTable.data = [...this.conditionDrw.afterTable.data];
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
    upload = <any>{
        visible: false,
        width: 400,
        currentPerson: null,
        isSee: false,
        isUpload: true,
        open: (data, isSee = false) => {
            if (isSee) {
                this.upload.isSee = true;
            }
            this.upload.visible = true;
            if (!data.tableId) {
                this.upload.isUpload = false;
                this.message.warning('请先填写本条数据基本信息,再上传附件!');
                return;
            }
            this.upload.isUpload = true;
            this.upload.currentPerson = data;
            this.upload.uploadIfy.getPersonFileList(data);
        },
        close: () => {
            this.upload.visible = false;
        },
        /**
         * 文件上传
         */
        uploadIfy: {
            list: [],
            fileCustomRequest: item => {
                // 构建一个 FormData 对象，用于存储文件或其他参数
                const formData = new FormData();
                // tslint:disable-next-line:no-any
                formData.append('file', item.file as any, item.file.name);
                const file = Object.assign(item.file, {
                    fileName: item.file.name,
                });
                this.commonService.fileUpload(formData).subscribe(result => {
                    file.fileId = result.fileId;
                    file.url = result.filePath = `${this.commonService.getDownFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    file.operFiles = result;
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
                            url: `${this.commonService.getDownFileURL(v.filePath, v.fileName)}`,
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

            selectedIndex: 0,
            // 查看附件
            preview: file => {
                const _index = this.upload.uploadIfy.list.findIndex(x => x.fileId === file.fileId);
                this.upload.uploadIfy.selectedIndex = _index;
                this.onlineDocOverlayElement.show();
                return false;
            },
        },
    };

    constructor(
        private workflowService: WorkflowService,
        private message: NzMessageService,
        private datePipe: DatePipe,
        private commonService: CommonService,
        private modalService: NzModalService,
        private loading: LoadingService,
        private service: CivilWorkChangeService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    show() {
        this.conditionDrw.open();
    }

    /**
     * 获取数据
     */
    getChangeBefore() {
        const params = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            keyIds: [this.personInf.keyId],
            createChangeHistoryData: true,
            childFields: {},
        };
        params.childFields[this.tableHelper.getTableCode('A01')] = [];
        params.childFields[this.tableHelper.getTableCode('GZ14')] = [];

        this.workflowService
            .getPsnList('salary_civil_standing_change', params)
            .subscribe(result => {
                // changeState通过这个属性筛选
                const [item] = result[`${this.tableHelper.getTableCode('A01')}`].map(v => {
                    return {
                        ...v,
                        tableId: v[`${this.tableHelper.getTableCode('A01')}_ID`],
                    };
                });
                this.conditionDrw.A01Data = item;
                this.conditionDrw.A01Data.A0134 = this.datePipe.transform(
                    this.conditionDrw.A01Data.A0134,
                    'yyyy-MM-dd'
                );
                if (result[this.tableHelper.getTableCode('GZ14')]) {
                    const gz14 = result[this.tableHelper.getTableCode('GZ14')].map(v => {
                        return {
                            ...v,
                            tableId: v.result[this.tableHelper.getTableCode('GZ14') + '_ID'],
                        };
                    });
                    this.conditionDrw.beforeTable.data = gz14.filter(
                        v => !Object.keys(v).includes('changeState')
                    );

                    // this.conditionDrw.afterTable.data = gz14.filter(v =>
                    //     Object.keys(v).includes('changeState')
                    // );
                    this.conditionDrw.afterTable.data = gz14;
                } else {
                    this.conditionDrw.beforeTable.data = [];
                    this.conditionDrw.afterTable.data = [];
                }
                this.conditionDrw.beforeTable.data = [...this.conditionDrw.beforeTable.data];
                this.conditionDrw.afterTable.data = [...this.conditionDrw.afterTable.data];
            });
    }

    /**
     * 保存
     */
    saveChange(data, status, event) {
        const resultData = {
            keyId: this.personInf.keyId,
            childId: data.tableId ? data.tableId : -1,
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            jobDataId: this.jobStepInfo.jobDataId,
            changeType:
                data.tableId || status === 'A0134'
                    ? WfDataChangeTypeEnum.MODIFY
                    : WfDataChangeTypeEnum.ADD,
            tableId:
                status.slice(0, 4) === 'GZ14'
                    ? `${this.tableHelper.getTableCode('GZ14')}`
                    : `${this.tableHelper.getTableCode('A01')}`,
            data: {
                [status]:
                    status === 'GZ1401' || status === 'A0134'
                        ? this.datePipe.transform(event, 'yyyy-MM-dd')
                        : event
                        ? event
                        : data[status],
            },
        };
        if (resultData.data[status]) {
            this.workflowService.saveChangeData(resultData).subscribe(result => {
                if (resultData.tableId === `${this.tableHelper.getTableCode('GZ14')}`) {
                    const tar = this.conditionDrw.afterTable.data.findIndex(
                        v =>
                            v[`${this.tableHelper.getTableCode('GZ14') + '_ID'}`] ===
                            data[`${this.tableHelper.getTableCode('GZ14') + '_ID'}`]
                    );
                    this.conditionDrw.afterTable.data[tar][
                        `${this.tableHelper.getTableCode('GZ14') + '_ID'}`
                    ] = result.childId;
                    this.conditionDrw.afterTable.data[tar].tableId = result.childId;
                    Object.assign(this.conditionDrw.afterTable.data[tar], result.data);
                    this.conditionDrw.afterTable.data = [...this.conditionDrw.afterTable.data];
                }
                // 计算工龄
                this.conmputeA0134AndA0149();
            });
        }
    }

    /**
     * 录参公时间A0134后
     * 计算工龄A0134A和连续工龄起算时间A0149
     */
    conmputeA0134AndA0149() {
        const params = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
            keyIds: [this.personInf.keyId],
        };
        this.service.computeYear(params).subscribe(result => {
            this.conditionDrw.A01Data.A0149 = result.data.A0149;
            this.conditionDrw.A01Data.A0134A = result.data.A0134A;
            this.getChangeBefore();
        });
    }
}
