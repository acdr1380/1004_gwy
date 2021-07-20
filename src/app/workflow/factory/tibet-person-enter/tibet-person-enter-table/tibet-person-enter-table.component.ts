import { Router } from '@angular/router';
import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    ChangeDetectorRef,
} from '@angular/core';
import { JobStepInfo } from 'app/workflow/db/JobStepInfo';
import { WorkflowService } from 'app/workflow/workflow.service';
import { OnlineDocComponent } from 'app/components/online-doc/online-doc.component';
import { CommonService } from 'app/util/common.service';
import { ColumnTypeEnum } from 'app/entity/enums/ColumnTypeEnum';
import { NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { TibetPersonEnterTableModule } from '../tibet-person-enter-table/tibet-person-enter-table.module';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { JobStepStateEnum } from 'app/workflow/enums/JobStepStateEnum';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { NzTableComponent } from 'ng-zorro-antd/table';
import { TibetPersonEnterService } from '../tibet-person-enter.service';
@Component({
  selector: 'gl-tibet-person-enter-table',
  templateUrl: './tibet-person-enter-table.component.html',
  styleUrls: ['./tibet-person-enter-table.component.scss']
})
export class TibetPersonEnterTableComponent implements OnInit, AfterViewInit {
    isFullScreen = false;
    columnType = ColumnTypeEnum;
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
            this.loadPersonTable();
        }
    }
    get jobStepInfo() {
        return this._jobStepInfo;
    }
    @Input() set current(v) {
        if (v === 3) {
            this.loadPersonTable();
        }
    }
    @ViewChild('personTableElement', { static: false }) personTableElement: ElementRef;

    personTab = {
        tabIndex: 0,
        tabList: [],
        IndexChange: event => {
            this.personTableIfy.data = this.personTab.tabList[event].tableData;
        },
    };

    @ViewChild('scrolleditAllElement', { static: false })
    scrolleditAllElement: CdkVirtualScrollViewport;

    /**
     * 步骤流程图
     */
    flowChart = {
        visible: false,
        title: '业务路线图',
        height: 220,
        close: () => (this.flowChart.visible = false),
        open: () => {
            this.flowChart.visible = true;
            // 加载步骤信息
            this.flowChart.loadOperStepData();
        },
        /**
         * 路线图总数据
         */
        operStepList: [],
        loadOperStepData: () => {
            if (this.flowChart.operStepList.length > 0) {
                return;
            }
            this.workflowService
                .getOperStepList(this.jobStepInfo.wfId)
                .subscribe(stepInfo => (this.flowChart.operStepList = stepInfo));
        },
        /**
         * 获得当前步骤
         */
        evtGetStepIndex: (): number => {
            if (this.jobStepInfo && this.flowChart.operStepList.length > 0) {
                const index = this.flowChart.operStepList.findIndex(
                    item => item.stepId === this.jobStepInfo.stepId
                );
                return index;
            }
            return 0;
        },
    };

    /**
     * 业务跟踪-办理历史
     */
    tailAfterOper = {
        title: '业务跟踪',
        width: 480,
        visible: false,
        close: () => (this.tailAfterOper.visible = false),
        open: () => {
            this.tailAfterOper.visible = true;
            // 加载办理历史，流程跟踪
            this.tailAfterOper.loadTailAfterList();
        },
        /*
         * 审批历史
         */
        tailAfterList: [],
        loadTailAfterList: () => {
            if (this.tailAfterOper.tailAfterList.length > 0) {
                return;
            }
            this.workflowService
                .selectListByWfTracking(this.jobStepInfo.jobId)
                .subscribe(result => (this.tailAfterOper.tailAfterList = result));
        },
    };

    @ViewChild('personTblElement', { static: false })
    personTblElement?: NzTableComponent;
    /**
     * 人员表格
     */
    personTableIfy = {
        find: {
            // 搜索框
            searchWidth: 260,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                if (!value) {
                    this.personTableIfy.selectedRowIndex = -1;
                    return;
                }
                const { pageSize } = this.personTableIfy;
                // 查找位置
                const location = this.personTableIfy.data.findIndex(
                    item => item[`${this.tableHelper.getTableCode('A01')}_ID`] === value
                );
                // 计算位置所在页
                // tslint:disable-next-line:no-bitwise
                this.personTableIfy.pageIndex = ~~(location / pageSize) + 1;

                // 定位选中
                this.personTableIfy.selectedRowIndex = location % pageSize;
                this.personTblElement.cdkVirtualScrollViewport?.scrollToIndex(
                    this.personTableIfy.selectedRowIndex
                );
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personTableIfy.find.list = this.personTableIfy.data
                        .filter(item => item.A0101.indexOf(searchKey) > -1)
                        .map(item => ({
                            text: item.A0101,
                            keyId: item[`${this.tableHelper.getTableCode('A01')}_ID`],
                        }));
                }
            },
        },

        widthConfig: [
            // 变动前
            '40px',
            '100px',
            '80px',

            '100px',
            '100px',
            '100px',
            '120px', // 岗位级别
            '120px', // 岗位工资
            '120px', // 薪级
            '120px', // 薪级工资
            '120px', // 提高10%工资
        ],
        scrollConfig: { x: '2600px', y: '440px' },
        headArr: Array(11),
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        loading: false,
        data: [],
        selectedRowIndex: -1,
    };

    @ViewChild('onlineDocOverlayElement', { static: false })
    onlineDocOverlayElement: OnlineDocComponent;
    /**
     *上传附件
     */
    uploaddrawerify = {
        visible: false,
        width: 400,
        currentPerson: null,
        selectIndex: -1,
        open: (data, i) => {
            this.uploaddrawerify.currentPerson = data;
            this.uploaddrawerify.selectIndex = i;
            this.uploaddrawerify.visible = true;
            this.uploaddrawerify.uploadIfy.getPersonFileList(data);
        },
        close: () => {
            this.uploaddrawerify.visible = false;
        },
        /**
         * 文件上传
         */
        uploadIfy: {
            selectedIndex: 0,
            fileCustomRequest: item => {
                const formData = new FormData();
                formData.append('file', item.file);
                this.commonService.fileUpload(formData).subscribe(result => {
                    result.url = result.filePath = `${this.commonService.getOpenFileURL(
                        result.fileId,
                        result.fileName
                    )}`;
                    const fileObj = Object.assign(item.file, result);
                    fileObj.operFiles = result;
                    this.uploaddrawerify.uploadIfy.savePersonAnnex(fileObj);
                });
            },

            /**
             * 删除文件-静态删除
             */
            fileRemove: file => {
                const _index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.deletePersonFile(
                    this.uploaddrawerify.uploadIfy.list[_index]
                );
                this.uploaddrawerify.uploadIfy.list.splice(_index, 1);
                this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                this.personTableIfy.data[this.uploaddrawerify.selectIndex].EXIST_ATTACH =
                    this.uploaddrawerify.uploadIfy.list.length > 0;
                this.personTableIfy.data = [...this.personTableIfy.data];
                return true;
            },
            preview: file => {
                const _index = this.uploaddrawerify.uploadIfy.list.findIndex(
                    x => x.fileId === file.fileId
                );
                this.uploaddrawerify.uploadIfy.selectedIndex = _index;
                this.onlineDocOverlayElement.show();
                return false;
            },
            /**
             * 保存人员附件
             */
            savePersonAnnex: file => {
                const params = Object.assign(file.operFiles, {
                    jobDataId: this.jobStepInfo.jobDataId,
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    keyId: this.uploaddrawerify.currentPerson[
                        `${this.tableHelper.getTableCode('A01')}_ID`
                    ],
                });

                this.workflowService.savePersonAnnex(params).subscribe(() => {
                    const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                        file.fileType
                    );
                    this.uploaddrawerify.uploadIfy.list.push({
                        thumbUrl,
                        ...file,
                        name: file.fileName,
                    });
                    // EXIST_ATTACH
                    this.uploaddrawerify.uploadIfy.list = [...this.uploaddrawerify.uploadIfy.list];
                    this.personTableIfy.data[this.uploaddrawerify.selectIndex].EXIST_ATTACH = true;
                    this.personTableIfy.data = [...this.personTableIfy.data];
                });
            },
            /**
             * 查询人员附件
             */
            getPersonFileList: event => {
                const data = {
                    keyId: event[`${this.tableHelper.getTableCode('A01')}_ID`],
                    jobId: this.jobStepInfo.jobId,
                };
                this.workflowService.getPersonFileList(data).subscribe(result => {
                    this.uploaddrawerify.uploadIfy.list = result.map(file => {
                        const thumbUrl = this.onlineDocOverlayElement.buildThumbUrlToType(
                            file.fileType
                        );
                        return {
                            ...file,
                            operFiles: file,
                            name: file.fileName,
                            url: `${this.commonService.getDownFileURL(file.fileId, file.fileName)}`,
                            filePath:
                                file.filePath ||
                                `${this.commonService.getOpenFileURL(file.fileId)}`,
                            thumbUrl,
                        };
                    });

                    console.log(this.uploaddrawerify.uploadIfy.list);
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
    /**
     * 批量上传附件
     */
    batchUploadFile = {
        visible: false,
        width: 400,
        currentPerson: null,
        selectIndex: -1,
        open: () => {
            this.batchUploadFile.visible = true;
        },
        close: () => {
            this.batchUploadFile.visible = false;
        },
        ruleData: [
            '批量上传的附件名称命名规则为：姓名+身份证号,如：演示+110101198001010053。',
            '附件最好控制在0-4M以内。',
            '附件文件夹需要压缩，压缩格式为.zip。',
            '批量附件上传只需要上传压缩后的zip文件。',
        ],
        resultData: [],
        loading: false,
        personfileCustomRequest: async (item: NzUploadXHRArgs) => {
            // 构建一个 FormData 对象，用于存储文件或其他参数
            const formData = new FormData();
            // tslint:disable-next-line:no-any
            formData.append('file', item.file as any, item.file.name);

            const data = await this.service.uploadPersonFile(formData);
            if (data) {
                const batchSaveFiles: any = await this.service.batchSaveFile({
                    jobId: this.jobStepInfo.jobId,
                    jobStepId: this.jobStepInfo.jobStepId,
                    list: data,
                });
                this.batchUploadFile.resultData = batchSaveFiles;
            }
        },
    };

    constructor(
        private cdr: ChangeDetectorRef,
        private workflowService: WorkflowService,
        private modalService: NzModalService,
        private commonService: CommonService,
        private router: Router,
        private message: NzMessageService,
        private loading: LoadingService,
        private tableHelper: WfTableHelper,
        private service: TibetPersonEnterService,
    ) {}

    ngOnInit() {}

    ngAfterViewInit() {
        // 计算表格虚拟滚动宽高
        // fromEvent(window, 'resize')
        //     .pipe(debounceTime(300))
        //     .subscribe(() => {
        //         this.computePersonTableXY();
        //     });
        const objResizeObserver = new window['ResizeObserver'](entries => {
            // const [entry] = entries;
            // const cr = entry.contentRect;
            // const target = entry.target;
            this.computePersonTableXY();
        });
        // 观察文本域元素
        objResizeObserver.observe(this.personTableElement.nativeElement);

        setTimeout(() => {
            this.computePersonTableXY();
        }, 500);
    }

    /**
     * 计算表格虚拟滚动宽高
     */
    computePersonTableXY() {
        const width = this.personTableIfy.widthConfig
            // tslint:disable-next-line:radix
            .map(v => parseInt(v))
            .reduce((accumulator, currentValue) => accumulator + currentValue);
        const el = this.personTableElement.nativeElement;

        const height = el.offsetHeight - 160; // - 上边距 - 下边距 - 表头高度 - 分页 - 底部总人数
        this.personTableIfy.scrollConfig = { x: `${width}px`, y: `${height}px` };
        this.cdr.detectChanges();
    }

    private loadPersonTable() {
        if (!this.jobStepInfo) {
            return;
        }
        const data = {
            jobId: this.jobStepInfo.jobId,
            jobStepId: this.jobStepInfo.jobStepId,
        };
        this.service.getPersonTable(data).subscribe(result => {
            this.personTab.tabList = result;
        });
    }

    fullScreenSwith() {
        this.isFullScreen = !this.isFullScreen;
    }
}
