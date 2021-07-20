import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { CommonService } from 'app/util/common.service';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { WorkflowService } from 'app/workflow/workflow.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SalaryCivilInitializeService } from '../salary-civil-initialize.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'civil-salary-civil-initialize-person-file',
    templateUrl: './salary-civil-initialize-person-file.component.html',
    styleUrls: ['./salary-civil-initialize-person-file.component.scss']
})
export class SalaryCivilInitializePersonFileComponent implements OnInit {

    /**
     * 业务是否可编辑
     */
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
     * 当前选中人员
     */
    @Input() currentSelectedPsnData = null;

    // 刷新附件列表
    _refreashFileLists;
    @Input()
    set refreashFileLists(v) {
        if (v) {
            this._refreashFileLists = v;
            this.operPersonFileIfy._loadFileList();
        }
    }
    get refreashFileLists() {
        return this._refreashFileLists;
    }


    constructor(
        private service: SalaryCivilInitializeService,
        private workService: WorkflowService,
        private message: NzMessageService,
        private commonService: CommonService,
    ) { }

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     * 上传附件材料
     */
    operPersonFileIfy = {
        data: [],
        loading: false,
        /**
         * 加载业务人员 上传附件列表
         */
        _loadFileList: () => {
            if (this.operPersonFileIfy.data.length > 0) {
                this.operPersonFileIfy._loadPersonFileList();
                return;
            }
            const data = {
                wfId: this.service.wfId,
                stepId: this.jobStepInfo.stepId,
            };
            this.workService.getWfFileByWfIdAndStepId(data).subscribe(result => {
                this.operPersonFileIfy.data = result;
                if (this.currentSelectedPsnData) {
                    this.operPersonFileIfy._loadPersonFileList();
                }
            });
        },
        /**
         * 加载个人已上传附件
         */
        _loadPersonFileList: () => {
            if (!this.currentSelectedPsnData) {
                return;
            }
            if (this.currentSelectedPsnData.fileList && this.currentSelectedPsnData.fileList.length > 0) {
                this.operPersonFileIfy._setPersonFileStatus();
                return;
            }
            const data = {
                jobId: this.jobStepInfo.jobId,
                keyId: this.currentSelectedPsnData.keyId,
            };
            this.workService.getPersonFileList(data).subscribe(result => {
                this.currentSelectedPsnData.fileList = result.map(file => ({
                    ...file,
                    url: file.filePath,
                    size: file.fileSize,
                    name: file.fileName,
                    type: file.fileType,
                }));
                this.operPersonFileIfy._setPersonFileStatus();
            });
        },
        /**
         * 设置人员附件状态
         */
        _setPersonFileStatus: () => {
            if (this.currentSelectedPsnData.fileList.length === 0) {
                this.operPersonFileIfy.data.map(d => d.fileList = []);
                return;
            }
            this.operPersonFileIfy.data.forEach(row => {
                const list = this.currentSelectedPsnData.fileList.filter(item => item.annexId === row.annexId);
                row.fileList = this.onlineDocOverlayElement.buildThumbUrl(list);
            });
        },

        evtViewFile: row => {
            this.operPersonFileIfy.fileListIfy.row = row;
            this.operPersonFileIfy.fileListIfy.open();
        },

        selectFile: null,
        evtUpload: row => {
            this.operPersonFileIfy.selectFile = row;
        },
        fileCustomRequest: item => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);
            this.commonService.fileUpload(formData).subscribe(result => {
                const file = {
                    fileName: item.file.name,
                    filePath: `${this.commonService.getDownFileURL(
                        result.fileId,
                        result.fileName
                    )}`,
                    fileType: result.fileType,
                    fileSize: result.fileSize,
                    fileId: result.fileId,
                };
                this.operPersonFileIfy._savePersonFileData(file, item.data);
            });
        },

        /**
         * 保存人员附件
         */
        _savePersonFileData: (file, data) => {
            const params = {
                jobId: this.jobStepInfo.jobId,
                jobStepId: this.jobStepInfo.jobStepId,
                jobDataId: this.jobStepInfo.jobDataId,
                keyId: this.currentSelectedPsnData.keyId,
                annexId: data.annexId,
                ...file,
            };
            this.workService.savePersonAnnex(params).subscribe(result => {
                this.currentSelectedPsnData.fileList = this.currentSelectedPsnData.fileList ? this.currentSelectedPsnData.fileList : [];
                this.currentSelectedPsnData.fileList.push({
                    ...result,
                    url: result.filePath,
                    size: result.fileSize,
                    name: result.fileName,
                    type: result.fileType,
                });
                this.operPersonFileIfy._setPersonFileStatus();
            });
        },

        selectedIndex: 0,
        list: [],
        preview: file => {
            const item = this.operPersonFileIfy.data.find(v => v.annexId === file.annexId);
            this.operPersonFileIfy.list = this.currentSelectedPsnData.fileList
                .filter(v => v.annexId === file.annexId)
                .map(x => ({ ...x, fileName: x.fileName }));

            const index = item.fileList.findIndex(v => v.id === file.id);
            this.onlineDocOverlayElement.selectedIndex = index;
            this.onlineDocOverlayElement.show();
            return false;
        },

        fileRemove: file => {
            const item = this.operPersonFileIfy.data.find(v => v.annexId === file.annexId);
            const index = item.fileList.findIndex(v => v.id === file.id);
            item.fileList.splice(index, 1);
            item.fileList = [...item.fileList];
            this.workService.deletePersonFile(file.id).subscribe(() => {
                this.currentSelectedPsnData.fileList.splice(
                    this.currentSelectedPsnData.fileList.findIndex(v => v.id === file.id),
                    1
                );
            });
        },

        fileListIfy: {
            visible: false,
            title: '人员附件列表',
            width: 400,
            selectedIndex: 0,
            close: () => (this.operPersonFileIfy.fileListIfy.visible = false),
            open: () => {
                this.operPersonFileIfy.fileListIfy._buildFiletList();
                this.operPersonFileIfy.fileListIfy.visible = true;
            },
            row: null,
            list: [],
            _buildFiletList: () => {
                this.operPersonFileIfy.fileListIfy.list = this.currentSelectedPsnData.fileList.filter(
                    item => item.annexId === this.operPersonFileIfy.fileListIfy.row.annexId
                );
                this.operPersonFileIfy.fileListIfy.list.map(v => (v.fileName = v.fileName));
            },
            fileRemove: file => {
                const _index = this.currentSelectedPsnData.fileList.findIndex(x => x.keyId === file.keyId);
                this.currentSelectedPsnData.fileList.splice(_index, 1);
                this.operPersonFileIfy.fileListIfy._buildFiletList();
                this.workService.deletePersonFile(file.id).subscribe(() => {
                    this.operPersonFileIfy.fileListIfy.row.haveFile = this.currentSelectedPsnData.fileList.length;
                });
                return true;
            },
            preview: file => {
                const _index = this.operPersonFileIfy.fileListIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.operPersonFileIfy.fileListIfy.selectedIndex = _index;
                this.onlineDocOverlayElement.show();
                return false;
            },
        },
    };

    ngOnInit(): void {
    }

}
