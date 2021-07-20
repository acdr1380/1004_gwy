import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { LoadingService } from 'app/components/loading/loading.service';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { CommonService } from 'app/util/common.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WfAnnexTypeEnum } from 'app/workflow/enums/WfAnnexTypeEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { TibetPersonEnterService } from '../tibet-person-enter.service';

@Component({
    selector: 'gl-tibet-person-enter-file',
    templateUrl: './tibet-person-enter-file.component.html',
    styleUrls: ['./tibet-person-enter-file.component.scss'],
})
export class TibetPersonEnterFileComponent implements OnInit {
    /**
     * 业务信息
     */
    private _jobStepInfo: JobStepInfo;
    @Input() set jobStepInfo(v) {
        if (v) {
            this._jobStepInfo = v;
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }

    keyId: string = null;

    /**
     * 抽屉
     */
    operFileDra = {
        visible: false,
        title: '上传附件',
        width: 400,
        open: () => {
            this.operFileDra.visible = true;
        },
        close: () => {
            this.operFileDra.visible = false;
        },
    };

    /**
     * 业务附件
     */
    operPersonFileIfy = {
        data: [],
        fileList: [],
        selectedIndex: 0,
        /**
         * 加载业务上传附件列表
         */
        _loadFileList: () => {
            if (this.operPersonFileIfy.data.length > 0) {
                this.operPersonFileIfy._loadOperFileList();
                return;
            }
            const data = {
                wfId: this.service.wfId,
                stepId: 'start',
            };
            const _loading = this.loading.show();
            this.workflowService
                .getWfFileByWfIdAndStepId(data, WfAnnexTypeEnum.PERSON)
                .subscribe(result => {
                    _loading.close();
                    this.operPersonFileIfy.data = result;
                    this.operPersonFileIfy._loadOperFileList();
                });
        },
        /**
         * 加载已上传附件
         */
        _loadOperFileList: () => {
            // if (this.operPersonFileIfy.fileList.length > 0) {
            //     this.operPersonFileIfy._setOperFileState();
            //     return;
            // }
            const data = {
                jobId: this.jobStepInfo.jobId,
                keyId: this.keyId,
            };
            const _loading = this.loading.show();
            this.workflowService.getPersonFileList(data).subscribe(result => {
                _loading.close();
                this.operPersonFileIfy.fileList = result.map(file => ({
                    ...file,
                    url: file.filePath,
                    size: file.fileSize,
                    name: file.fileName,
                    type: file.fileType,
                }));

                this.operPersonFileIfy._setOperFileState();
            });
        },
        /**
         * 设置附件状态
         */
        _setOperFileState: () => {
            this.operPersonFileIfy.data.forEach(row => {
                const list = this.operPersonFileIfy.fileList.filter(
                    item => item.annexId === row.annexId
                );
                row.fileList = list;
            });
        },
        preview: (file: NzUploadFile) => {
            const _index = this.operPersonFileIfy.fileList.findIndex(x => x.fileId === file.fileId);
            this.operPersonFileIfy.selectedIndex = _index;
            this.onlineDocOverlayElement.show();
            return false;
        },
        fileCustomRequest: (item: NzUploadXHRArgs) => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);
            this.commonService.fileUpload(formData).subscribe(result => {
                const file = {
                    fileName: item.file.name,
                    // filePath: `api/gl-file-service/static/attachment/${result.id}?fileName=${result.fileName}`,
                    filePath: `${this.commonService.getDownFileURL(
                        result.fileId,
                        result.fileName
                    )}`,
                    fileType: result.fileType,
                    fileSize: result.fileSize,
                    fileId: result.fileId,
                };
                this.operPersonFileIfy._saveOperFileList(file, item.data);
            });
            return true;
        },
        fileRemove: (file: NzUploadFile) => {
            const item = this.operPersonFileIfy.data.find(v => v.annexId === file.annexId);
            const index = item.fileList.findIndex(v => v.id === file.id);
            item.fileList.splice(index, 1);
            item.fileList = [...item.fileList];
            this.workflowService.deletePersonFile(file.id).subscribe(() => {
                this.operPersonFileIfy.fileList.splice(
                    this.operPersonFileIfy.fileList.findIndex(v => v.id === file.id),
                    1
                );
            });
        },

        /**
         * 保存附件
         */
        _saveOperFileList: (file, ft) => {
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobParamId: this.jobStepInfo.jobParamId,
                jobDataId: this.jobStepInfo.jobDataId,
                keyId: this.keyId,
                annexId: ft.annexId,
                annexType: WfAnnexTypeEnum.PERSON,
                ...file,
            };
            this.workflowService.savePersonAnnex(params).subscribe(result => {
                // this.operPersonFileIfy.selectFile.haveFile = true;
                this.operPersonFileIfy.fileList = [
                    ...this.operPersonFileIfy.fileList,
                    {
                        ...result,
                        url: result.filePath,
                        size: result.fileSize,
                        name: result.fileName,
                        type: result.fileType,
                    },
                ];
                this.operPersonFileIfy._setOperFileState();
            });
        },
    };

    @ViewChild('onlineDocOverlayElement') onlineDocOverlayElement: OnlineDocComponent;

    constructor(
        private service: TibetPersonEnterService,
        private workflowService: WorkflowService,
        private commonService: CommonService,
        private loading: LoadingService
    ) {}

    ngOnInit(): void {}

    public show(keyId: string) {
        this.keyId = keyId;
        this.operPersonFileIfy._loadFileList();
        this.operFileDra.open();
    }
}

