import { NzModalService } from 'ng-zorro-antd/modal';
import { CommonService } from './../../util/common.service';
/*
 * @Author: mikey.胡文鸿
 * @Date: 2020-06-10 11:38:47
 * @Last Modified by: mikey.胡文鸿
 * @Last Modified time: 2021-07-12 16:06:56
 */
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import {
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef,
    ViewChildren,
    QueryList,
    AfterViewInit,
    HostListener,
} from '@angular/core';
import { ReportCommonService } from './report-common.service';

import { Title } from '@angular/platform-browser';
import { ReportCommonParams } from './enums/ReportCommonParams';
import { Base64 } from 'js-base64';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { excelStyle } from './excel-setting/excel-style';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProcessingStatusEnum } from 'app/client-page/report-produce/enums/ProcessingStatusEnum';
import { ReportAuditStatusEnum } from 'app/client-page/report-produce/enums/ReportAuditStatusEnum';
import { VerifyStatusEnum } from 'app/client-page/report-produce/enums/VerifyStatusEnum';

declare const jexcel: any;
declare global {
    interface Window {
        /**
         * 报表校验窗口
         */
        winReportVerifyDlg: any;
        /**
         * 报表反查窗口
         */
        reverseQueryDlg: any;

        /**
         * 刷新报表功能表格方法
         */
        reportCommon_refTbl: Function;
    }
}

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'gl-report-common',
    templateUrl: './report-common.component.html',
    styleUrls: ['./report-common.component.scss'],
})
export class ReportCommonComponent implements OnInit, AfterViewInit {
    processingStatusEnum = ProcessingStatusEnum;
    reportAuditStatusEnum = ReportAuditStatusEnum;

    /**
     * 是否编辑
     */
    isEdit = false;
    /**
     * 套表信息
     */
    URLParams: ReportCommonParams;

    /**
     * 头部操作区域
     */
    headHandleIfy = {
        isHide: false,
        switch: () => {
            this.headHandleIfy.isHide = !this.headHandleIfy.isHide;
            setTimeout(() => {
                this.setExcelSize();
            }, 1);
        },
        rebuildLonding: false,
        /**
         * 保存报表数据
         */
        evtSaveAllData: (isRef = true) => {
            const { classId, setId, keyId } = this.URLParams;
            const { childId } = this.subListIfy.selectedChild;
            const list = this.getSheetData();
            if (!list || list.length === 0) {
                return;
            }
            const params = {
                classId,
                setId,
                childId,
                keyId,
                list,
            };
            this.service.saveFullCellData(params).subscribe(result => {
                if (!isRef) {
                    return;
                }
                const index = this.subListIfy.list.findIndex(
                    v => v.childId === this.subListIfy.selectedChild.childId
                );
                const item = this.subListIfy.list[index];
                if (item.excel && Object.keys(result).length > 0) {
                    this.setAllTableValue(item, result);
                    item.excel.isSetData = true;
                }
            });
        },
        /**
         * 重新生成年报
         */
        evtRebuild: () => {
            if (this.URLParams.processingStatus !== ProcessingStatusEnum.STATUS_UNPROCESSED) {
                this.modalService.confirm({
                    nzTitle: `系统提示`,
                    nzContent: `<b style="color: red;">已生成数据年报 是否确定重新生成，重新生成后之前修改数据将进行重新统计 。</b>`,
                    nzOkText: '确定',
                    nzOkType: 'danger',
                    nzOnOk: () => {
                        this.headHandleIfy.rebuildLonding = true;
                        this.service
                            .buildReportSetTableData(this.URLParams.keyId)
                            .subscribe(result => {
                                this.headHandleIfy.rebuildLonding = false;
                                this.loadReportChildTableData();
                            });
                    },
                    nzCancelText: '取消',
                    nzOnCancel: () => {},
                });
            } else {
                this.headHandleIfy.rebuildLonding = true;
                this.service.buildReportSetTableData(this.URLParams.keyId).subscribe(result => {
                    this.headHandleIfy.rebuildLonding = false;
                    this.loadReportChildTableData();
                });
            }
        },
        /**
         * 报表校验
         */
        evtVerify: () => {
            this.service.verifyReportData(this.URLParams.keyId).subscribe(result => {
                this.subListIfy.list.forEach(v => {
                    const index = result.childVerifyStatus.findIndex(
                        childId => v.childId === childId
                    );
                    v.verify = index === -1;
                });
                this.headHandleIfy._resetCellColor();
                this.subListIfy.list = [...this.subListIfy.list];
                if (result.verifyStatus !== VerifyStatusEnum.STATUS_APPROVED) {
                    const GL = Base64.encode(JSON.stringify(this.URLParams));
                    const url = `irregularity/report-verify;GL=${GL}`;
                    window.winReportVerifyDlg = window.open(url, 'report-verify');
                    if (window.winReportVerifyDlg && window.winReportVerifyDlg.closed) {
                        window.winReportVerifyDlg.focus();
                    } else {
                        setTimeout(() => {
                            window.winReportVerifyDlg.reportCommon_SelectChildTable = childId => {
                                const item = this.subListIfy.list.find(v => v.childId === childId);
                                this.subListIfy.evtSelected(item);
                            };
                        });
                    }

                    result.coordinate.forEach(v => {
                        this.headHandleIfy._setCellVerifyColor(v.childId, v.left, '#FF0000');
                        this.headHandleIfy._setCellVerifyColor(v.childId, v.right, '#FFFF00');
                    });
                    // this.router.navigate(['irregularity/report-verify', { GL }]);
                }
            });
        },
        /**
         * 重置格子颜色
         */
        _resetCellColor: () => {
            // 完整表格 (处理过合并行列)
            const item = this.subListIfy.list.find(
                v => v.childId === this.subListIfy.selectedChild.childId
            );

            const { records } = item.excel;
            if (records) {
                const { childFixedRows, childFixedCols } = item.info;
                records.forEach((row, x) => {
                    row.forEach((cell, y) => {
                        if (x >= childFixedRows && y >= childFixedCols) {
                            cell.style.backgroundColor = 'transparent';
                        }
                    });
                });
            }
        },
        /**
         * 设置格子校验颜色
         */
        _setCellVerifyColor: (childId, cellList, color) => {
            if (this.subListIfy.selectedChild.childId !== childId) {
                return;
            }
            // 完整表格 (处理过合并行列)
            const item = this.subListIfy.list.find(
                v => v.childId === this.subListIfy.selectedChild.childId
            );

            const { records } = item.excel;
            if (records) {
                const { childFixedRows, childFixedCols } = item.info;
                cellList.forEach(v => {
                    const [x, y] = v.split(',');
                    const cell =
                        // tslint:disable-next-line:radix
                        records[parseInt(x) + childFixedRows - 1][parseInt(y) + childFixedCols - 1];
                    cell.style.backgroundColor = color;
                });
            }
        },

        // 反查按钮是否可用
        evtReverseQueryDisabled: () => {
            const { x1, y1, x2, y2 } = this.subListIfy.selectorRange;
            return !(x1 !== -1 && x1 === x2 && y1 !== -1 && y1 === y2);
        },
        // 反查
        evtReverseQuery: () => {
            const { conditionRow, conditionCol } = this.getRangeCoordinates();
            const GL = Base64.encode(
                JSON.stringify({
                    ...this.URLParams,
                    childId: this.subListIfy.selectedChild.childId,
                    childName: escape(this.subListIfy.selectedChild.childName),
                    data: {
                        row: conditionRow,
                        col: conditionCol,
                    },
                })
            );
            const url = `irregularity/report-reverse-query;GL=${GL}`;
            window.reverseQueryDlg = window.open(url, 'report-reverse-query');
            if (window.winReportVerifyDlg && window.winReportVerifyDlg.closed) {
                window.winReportVerifyDlg.focus();
            }
        },

        clearAllData: () => {},
        clearAreaData: () => {
            const item = this.subListIfy.list.find(
                v => v.childId === this.subListIfy.selectedChild.childId
            );

            const { records } = item.excel;
            // 锁定行列
            const selectionList = this.subListIfy.selectionList;
            if (records) {
                const { childLockRange, childReadonlyRange, childFixedRows, childFixedCols } =
                    item.info;
                const childReadonlyList = childReadonlyRange.split(',');
                selectionList.forEach(v => {
                    const [x, y] = v.split(':');
                    // tslint:disable-next-line:radix
                    const row = parseInt(x) + childFixedRows - 1;
                    // tslint:disable-next-line:radix
                    const col = parseInt(y) + childFixedCols - 1;
                    const cell =
                        // tslint:disable-next-line:radix
                        records[row][col];
                    const val = item.excel.getValue(cell);
                    if (val !== '-' && childReadonlyList.indexOf(v) === -1) {
                        item.excel.updateCell(col, row, '');
                    }
                });
            }
        },

        evtAudit: () => {
            this.reportAuditIfy.open();
        },

        evtSort: () => {
            this.reportChildSortIfy.open();
        },

        downChild: () => {
            const { classId, setId, keyId } = this.URLParams;
            const { childId } = this.subListIfy.selectedChild;
            const params = {
                keyId,
                classId,
                setId,
                childId,
            };
            this.service.downloadExcel(params);
        },
        downAll: () => {
            const { classId, setId, keyId } = this.URLParams;
            const params = {
                keyId,
                classId,
                setId,
            };
            this.service.downloadFullExcel(params);
        },
    };

    /**
     * 子表列表
     */
    subListIfy = {
        find: {
            list: [],
            parentList: [],
            keyword: null,
            evtOnSearch: (keyword: string) => {
                if (keyword) {
                    this.subListIfy.find.list = this.subListIfy.list.filter(v => {
                        return v.childName.indexOf(keyword) > -1;
                    });
                }
            },
            evtChange: childId => {
                if (childId) {
                    const item = this.subListIfy.list.find(v => v.childId === childId);
                    this.subListIfy.evtSelected(item);
                }
            },
        },
        list: [],
        selectedChild: null,
        evtUpDownExcel: d => {
            const index = this.subListIfy.list.findIndex(
                item => this.subListIfy.selectedChild.childId === item.childId
            );
            if (index + d <= -1) {
                return;
            }
            if (index + d >= this.subListIfy.list.length) {
                return;
            }
            this.subListIfy.evtSelected(this.subListIfy.list[index + d]);
        },
        evtSelected: item => {
            this.headHandleIfy.evtSaveAllData(false);
            this.subListIfy.selectedChild = item;
            this.subListIfy.resetRange();
            this.ladSubListInfo();
            this.setExcelSize();
        },

        // 选中区域的范围
        selectorRange: {
            x1: -1,
            y1: -1,
            x2: -1,
            y2: -1,
        },
        selectionList: [],
        /**
         * 重置选中区域
         */
        resetRange: () => {
            this.subListIfy.selectorRange = {
                x1: -1,
                y1: -1,
                x2: -1,
                y2: -1,
            };
            const index = this.subListIfy.list.findIndex(
                v => v.childId === this.subListIfy.selectedChild.childId
            );
            const item = this.subListIfy.list[index];
            if (item.excel) {
                item.excel.resetSelection();
                return;
            }
        },
    };

    @ViewChild('sublistAreaElement')
    private sublistAreaElement: ElementRef;
    @ViewChildren('excelmultiMains') private excelmultiMains: QueryList<ElementRef>;

    reportAuditIfy = {
        // 抽屉内容
        title: '报表审批',
        width: 400,
        visible: false,
        close: () => (this.reportAuditIfy.visible = false),
        open: (reset = true) => {
            this.reportAuditIfy.loading = false;
            this.reportAuditIfy.visible = true;
        },
        loading: false,
        form: new FormGroup({
            auditStatus: new FormControl(null, Validators.required),
            auditContent: new FormControl(null, Validators.required),
        }),

        keyId: null,
        evtSave: () => {
            if (this.commonService.formVerify(this.reportAuditIfy.form)) {
                const data = this.reportAuditIfy.form.getRawValue();
                const params = {
                    keyId: this.URLParams.keyId,
                    data,
                };
                this.reportAuditIfy.loading = true;
                this.service.saveReportAuditData(params).subscribe(result => {
                    if (window.opener.reportCommon_refTbl) {
                        window.opener.reportCommon_refTbl();
                    }
                    this.reportAuditIfy.close();
                });
            }
        },
    };

    reportUnitIfy = {
        // 抽屉内容
        title: '切换单位',
        width: 400,
        visible: false,
        close: () => (this.reportUnitIfy.visible = false),
        open: (reset = true) => {
            this.reportUnitIfy.load();
            this.reportUnitIfy.visible = true;
        },
        list: <any[]>[],
        selectedIndex: -1,
        evtSelectUnit: index => {
            this.reportUnitIfy.selectedIndex = index;
        },
        load: () => {
            const params: any = {
                classId: this.URLParams.classId,
                setId: this.URLParams.setId,
                data: {
                    pageIndex: 1,
                    pageSize: 30,
                },
            };
            this.service.reportMainPassApproved(params).subscribe(result => {
                this.reportUnitIfy.list = result.data;
            });
        },
        switch: () => {
            const item = this.reportUnitIfy.list[this.reportUnitIfy.selectedIndex];
            const { classId, setId } = this.URLParams;
            const GL = Base64.encode(
                JSON.stringify({
                    keyId: item.keyId,
                    title: escape(item.reportName),
                    classId,
                    setId,
                    processingStatus: ProcessingStatusEnum.STATUS_REPORTING,
                    status: ReportAuditStatusEnum.FINISH,
                })
            );
            this.router.navigate(['irregularity/report-common', { GL }]);
            this.reportUnitIfy.close();
        },
    };

    /**
     * 子表调整顺序
     */
    reportChildSortIfy = {
        // 抽屉内容
        title: '调整顺序',
        width: 400,
        visible: false,
        close: () => (this.reportChildSortIfy.visible = false),
        open: (reset = true) => {
            this.reportChildSortIfy.visible = true;
        },

        selectedItem: null,
        evtSelected: item => {
            this.reportChildSortIfy.selectedItem = item;
        },
        // 移动
        evtDrop: (event: CdkDragDrop<any[]>) => {
            if (event.previousIndex === event.currentIndex) {
                return;
            }
            moveItemInArray(this.subListIfy.list, event.previousIndex, event.currentIndex);
            const item = this.subListIfy.list[event.currentIndex];

            // const data = {
            //     SYS_FIELD_SCHEME_EDIT_ID: item.SYS_FIELD_SCHEME_EDIT_ID,
            //     $MOVE_POSITION$: event.currentIndex + 1,
            //     FIELD_EDIT_SCHEME_ID: item.FIELD_EDIT_SCHEME_ID,
            // };
            // this.service.moveFieldSort(data).subscribe(isSucceed => {
            //     if (!isSucceed) {
            //         this.reportChildSortIfy.list.splice(event.currentIndex, 1);
            //         this.reportChildSortIfy.list.splice(event.previousIndex, 0, item);
            //     }
            // });
        },
    };

    // 监听事件 浏览器关闭
    @HostListener('window:beforeunload', ['$event']) onKeyDown(e) {
        console.dir('刷新');
    }

    constructor(
        private title: Title,
        private service: ReportCommonService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private commonService: CommonService,
        private modalService: NzModalService
    ) {}

    ngOnInit() {
        this.reportAuditIfy.form
            .get('auditStatus')
            .valueChanges.pipe(
                filter(value => value > -1),
                debounceTime(100) // 必须加延迟，因为订阅里面设置了 TABLE_ICON 会触发 valueChanges, 如果同步就死循环了
            )
            .subscribe(value => {
                const control = this.reportAuditIfy.form.get('auditContent');
                if (value) {
                    control.clearValidators();
                } else {
                    control.setValidators(Validators.required);
                }
            });

        this.initRouterParams();
    }

    ngAfterViewInit() {
        fromEvent(window, 'resize')
            .pipe(debounceTime(300))
            .subscribe(event => {
                this.setExcelSize();
            });
        // // 观察文本域元素
        // objResizeObserver.observe(this.sublistAreaElement.nativeElement);
        // setTimeout(() => {
        //     if (window.reportCommon_refTbl) {
        //         window.reportCommon_refTbl();
        //     }
        // }, 1000);
    }

    /**
     * 解析路由参数
     */
    initRouterParams() {
        // 获取路由参数
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                this.title.setTitle(this.getTitle());

                this.isEdit =
                    (this.URLParams.status === ReportAuditStatusEnum.MY ||
                        this.URLParams.status === ReportAuditStatusEnum.COLLECT) &&
                    [0, 1, 4].indexOf(this.URLParams.processingStatus) > -1;

                this.loadSublistList();
            }
        });
    }

    /**
     * 获得报表名称
     */
    getTitle() {
        return `报表详情：${unescape(this.URLParams.title) || ''}`;
    }

    /**
     * 获得报表名称
     */
    getChildName() {
        if (!this.subListIfy.selectedChild) {
            return '';
        }
        return `${this.subListIfy.selectedChild.childId}表-${this.subListIfy.selectedChild.childName}`;
    }

    /**
     * 切换单位
     */
    switchUnit() {
        this.reportUnitIfy.open();
    }

    /**
     * 重新设置excel的宽高
     */
    private setExcelSize() {
        const index = this.subListIfy.list.findIndex(
            v => v.childId === this.subListIfy.selectedChild.childId
        );
        const item = this.subListIfy.list[index];
        if (item && item.excel) {
            const h = this.sublistAreaElement.nativeElement.clientHeight;
            const w = this.sublistAreaElement.nativeElement.clientWidth;
            const { height = 0, width = 0 } = item.selectallStyle;
            item.excel.content.style.width = `${w + width}px`;
            item.excel.content.style.maxHeight = `${h + height}px`;
        }
    }

    /**
     * 加载子表列表
     */
    loadSublistList() {
        this.service.getSublist(this.URLParams).subscribe(result => {
            const userInfo = this.commonService.getUserLoginInfo();
            this.subListIfy.list = result.filter(item => {
                const index = userInfo.authReport.findIndex(
                    v =>
                        v.setId === item.setId &&
                        v.classId === item.classId &&
                        v.childId === item.childId
                );
                return index > -1;
            });
            if (result.length > 0) {
                const [first] = result;
                this.subListIfy.selectedChild = first;
                this.ladSubListInfo();
                this.loadReportCheckChildId();
            }
        });
    }

    /**
     * 加载子表信息
     */
    ladSubListInfo() {
        const item = this.subListIfy.list.find(
            v => v.childId === this.subListIfy.selectedChild.childId
        );
        if (item.info) {
            this.loadSubListExcel();
            return;
        }
        this.service
            .getSublistData({
                ...this.URLParams,
                childId: this.subListIfy.selectedChild.childId,
            })
            .subscribe(result => {
                item.info = result;
                this.loadSubListExcel();
            });
    }

    /**
     * 加载 子表 表样
     */
    loadSubListExcel() {
        const height = this.sublistAreaElement.nativeElement.clientHeight;
        const width = this.sublistAreaElement.nativeElement.clientWidth;
        const index = this.subListIfy.list.findIndex(
            v => v.childId === this.subListIfy.selectedChild.childId
        );
        const item = this.subListIfy.list[index];
        if (item.excel) {
            if (this.isEdit) {
                this.loadReportChildTableData();
            }
            return;
        }
        jexcel.fromSpreadsheet(`api/gl-file-service/template/${item.fileId}`, result => {
            if (!result.length) {
                console.error('JEXCEL: Something went wrong.');
            } else {
                const [sheet] = result;
                sheet.allowComments = true;
                sheet.columnSorting = false;
                // 屏蔽右键
                sheet.contextMenu = () => {
                    window.event.returnValue = false;
                    return false;
                };
                // 选中区域事件
                sheet.onselection = (instance, x1, y1, x2, y2) => {
                    this.selectionActive(instance, x1, y1, x2, y2, item);
                };
                // 择行，列时不选中合并行列
                // sheet.isSelectedMerge = false;

                // 锁定行列
                const { childFixedRows, childFixedCols, childDataCols } = item.info;
                // 冻结行列
                sheet.freezeColumns = childFixedCols;
                sheet.freezeRows = childFixedRows;
                // 过滤空列
                sheet.columns = sheet.columns.filter(
                    (col, i) => i < childDataCols + childFixedCols
                );
                sheet.defaultColAlign = 'left';

                sheet.tableOverflow = true;
                sheet.columnResize = false;
                sheet.tableWidth = `${width}px`;
                sheet.tableHeight = `${height}px`;
                // sheet.tableWidth = 'auto';
                // sheet.tableHeight = 'auto';
                sheet.allowInsertRow = false;
                sheet.allowInsertColumn = false;
                sheet.onload = () => {};
                sheet.updateTable = (el, cell, y, x, source, value, id) => {
                    // 锁定列行只读
                    if (!this.isEdit) {
                        cell.classList.add('readonly');
                    }
                    if (x < childFixedRows || y < childFixedCols) {
                        cell.classList.add('readonly');
                    }
                };
                // 单元格数据改变事件
                sheet.onchange = (el, cell, y, x, value, oldValue) => {
                    // tslint:disable-next-line:triple-equals
                    if (item.excel && item.excel.isSetData && value != oldValue) {
                        this.cellDataChange(
                            cell,
                            // tslint:disable-next-line:radix
                            parseInt(x) - childFixedRows + 1,
                            // tslint:disable-next-line:radix
                            parseInt(y) - childFixedCols + 1,
                            value
                        );
                    }
                };
                // if (item.excel) {
                //     // 存在则销毁
                //     item.excel.destroy();
                // }
                item.excel = jexcel(this.excelmultiMains.toArray()[index].nativeElement, sheet);
                this.loadcellExcelStyle();

                const selectallEl = item.excel.el.querySelector('.jexcel_selectall');
                if (selectallEl) {
                    const { offsetHeight, offsetWidth } = selectallEl;
                    item.selectallStyle = { height: offsetHeight, width: offsetWidth };

                    this.setExcelSize();
                }
                // 取消默认选中区域
                item.excel.resetSelection();
                this.loadReportChildTableData();

                this.buildReadonlyRange();
                if (this.isEdit) {
                    this.buildEditorRange();
                }
            }
        });
    }

    /**
     * 加载样式
     */
    loadcellExcelStyle() {
        const index = this.subListIfy.list.findIndex(
            v => v.childId === this.subListIfy.selectedChild.childId
        );
        const item = this.subListIfy.list[index];
        this.service.getExcelCellStyle(item.fileId).subscribe(result => {
            this.setFormCellStyle(result);
        });
    }

    /**
     * 设置表册样式
     */
    setFormCellStyle(result) {
        const index = this.subListIfy.list.findIndex(
            v => v.childId === this.subListIfy.selectedChild.childId
        );
        const item = this.subListIfy.list[index];
        const { records } = item.excel;
        records.forEach((row, x) => {
            row.forEach((column, y) => {
                const key = `0,${x},${y}`;
                if (result[key]) {
                    const { font, style, width, height } = result[key];
                    // column.style.height = `${height}px`;
                    // column.style.width = `${width}px`;
                    // 设置对齐方式
                    for (const way in excelStyle.alignment) {
                        if (excelStyle.alignment.hasOwnProperty(way)) {
                            column.style[excelStyle.alignment[way]] = style[way];
                        }
                    }

                    // 边框样式
                    for (const way in excelStyle.borderStyle) {
                        if (excelStyle.borderStyle.hasOwnProperty(way)) {
                            const data = excelStyle.borderStyleCorres[style[way]];
                            if (data) {
                                column.style[excelStyle.borderStyle[way]] = data;
                            }
                        }
                    }
                    // // 字体
                    // for (const way in excelFont) {
                    //     if (excelFont.hasOwnProperty(way)) {
                    //         const [w, u] = excelFont[way].split('.');
                    //         column.style[w] = font[way] + (u || '');
                    //     }
                    // }
                }
            });
        });
    }

    /**
     * 中区域事件， 并获得选中的所有格子用逗号分隔
     * @param instance excel对象
     * @param x1 起始行
     * @param y1 起始列
     * @param x2 结束行
     * @param y2 结束列
     * @param item 子表对象
     */
    selectionActive(instance, x1, y1, x2, y2, item) {
        // 选中单个格子后选中行列变色
        if (x1 === x2 && y1 === y2) {
            this.setSelectCellStyle(x1, y1);
        }
        // 锁定行列
        const { childFixedRows, childFixedCols } = item.info;
        // console.dir(`x1: ${x1}, y1: ${y1}-- x2: ${x2}, y2: ${y2}`);
        // 获得选中所有格子坐标
        if (x1 < childFixedCols || y1 < childFixedRows) {
            this.subListIfy.selectorRange = {
                x1: -1,
                y1: -1,
                x2: -1,
                y2: -1,
            };
            return;
        }

        this.subListIfy.selectorRange = { x1, y1, x2, y2 };
        this.subListIfy.selectionList = [];
        for (let i = x1; i <= x2; i++) {
            for (let j = y1; j <= y2; j++) {
                if (i >= childFixedCols && j >= childFixedRows) {
                    this.subListIfy.selectionList.push(
                        `${j - childFixedRows + 1}:${i - childFixedCols + 1}`
                    );
                }
            }
        }
    }

    /**
     * 设置选中行列样式
     */
    setSelectCellStyle(y1, x1) {
        const index = this.subListIfy.list.findIndex(
            v => v.childId === this.subListIfy.selectedChild.childId
        );
        const item = this.subListIfy.list[index];
        const { records } = item.excel;
        const { childFixedRows, childFixedCols } = item.info;
        // const row = records[x];
        // const cell = row[y];
        records.forEach((row, x) => {
            row.forEach((cell, y) => {
                if (x >= childFixedRows && y >= childFixedCols) {
                    if (x === x1) {
                        if (!cell.classList.contains('cross_row')) {
                            cell.classList.add('cross_row');
                        }
                    } else {
                        cell.classList.remove('cross_row');
                    }
                    if (y === y1) {
                        if (!cell.classList.contains('cross_cell')) {
                            cell.classList.add('cross_cell');
                        }
                    } else {
                        cell.classList.remove('cross_cell');
                    }
                }
            });
        });
    }

    /**
     * 单元格值发生变化事件
     * @param cell 单元格
     * @param x 坐标
     * @param y 坐标
     * @param value 值
     */
    cellDataChange(cell, x, y, value) {
        cell.setAttribute('change', '1');
        // const { childId } = this.subListIfy.selectedChild;
        // const data = {
        //     ...this.URLParams,
        //     childId,
        //     data: {
        //         row: x,
        //         col: y,
        //         val: value,
        //     },
        // };
        // this.service.saveCellData(data).subscribe(result => {
        //     if (result) {
        //         const index = this.subListIfy.list.findIndex(
        //             v => v.childId === this.subListIfy.selectedChild.childId
        //         );
        //         const item = this.subListIfy.list[index];
        //         // tslint:disable-next-line:forin
        //         for (const key in result) {
        //             // tslint:disable-next-line:no-shadowed-variable
        //             const [row, col] = key.split(':');
        //             // tslint:disable-next-line:radix
        //             const x1 = parseInt(row) + item.info.childFixedRows - 1;
        //             // tslint:disable-next-line:radix
        //             const y1 = parseInt(col) + item.info.childFixedCols - 1;
        //             item.excel.updateCell(y1, x1, result[key], true, true);
        //         }
        //     }
        // });
    }

    /**
     * 加载报表数据
     */
    loadReportChildTableData() {
        this.service
            .loadChildTableData(this.URLParams.keyId, this.subListIfy.selectedChild.childId)
            .subscribe(result => {
                const index = this.subListIfy.list.findIndex(
                    v => v.childId === this.subListIfy.selectedChild.childId
                );
                const item = this.subListIfy.list[index];
                if (item.excel && Object.keys(result).length > 0) {
                    // item.excel.updateCell(5, 11, 77, true);
                    this.setAllTableValue(item, result);
                }
                // 设置过数据后赋值
                item.excel.isSetData = true;
            });
    }

    /**
     * 全表设置数据
     * @param item 子表信息
     * @param result 子表数据
     */
    setAllTableValue(item, result) {
        const { records } = item.excel;
        const { childLockRange, childReadonlyRange, childFixedRows, childFixedCols } = item.info;
        const childReadonlyList = childReadonlyRange ? childReadonlyRange.split(',') : [];
        records.forEach((row, x) => {
            row.forEach((cell, y) => {
                if (x >= childFixedRows && y >= childFixedCols) {
                    // `${x - childFixedRows + 1}:${y - childFixedCols + 1}`
                    const r = x - childFixedRows;
                    const c = `C${y - childFixedCols}`;
                    // 过滤物理只读
                    const val = item.excel.getValue(cell);
                    if (val !== '-') {
                        if (result[r] && result[r][c] !== undefined) {
                            const data = result[r][c] || '';
                            item.excel.updateCell(y, x, data, true, true);
                        }
                    }
                }
            });
        });
    }

    /**
     * 获得sheet所有data
     */
    getSheetData() {
        const index = this.subListIfy.list.findIndex(
            v => v.childId === this.subListIfy.selectedChild.childId
        );
        const item = this.subListIfy.list[index];
        const { records } = item.excel;
        const { childReadonlyRange, childFixedRows, childFixedCols } = item.info;

        const childReadonlyList = childReadonlyRange ? childReadonlyRange.split(',') : [];
        const result = [];
        records.forEach((row, x) => {
            row.forEach((cell, y) => {
                if (x >= childFixedRows && y >= childFixedCols) {
                    const r = x - childFixedRows + 1;
                    const c = y - childFixedCols + 1;
                    const val = item.excel.getValue(cell);
                    const change = cell.getAttribute('change');
                    if (
                        change === '1' &&
                        val !== '-' &&
                        childReadonlyList.indexOf(`${r}:${c}`) === -1
                    ) {
                        result.push({
                            row: r,
                            col: c,
                            val,
                        });
                    }
                    cell.removeAttribute('change');
                }
            });
        });
        return result;
    }

    /**
     * 设置子表数据
     * @param item 子表信息
     * @param result 子表数据
     */
    setTableChildValue(item, result) {
        // tslint:disable-next-line:forin
        for (const row in result) {
            // tslint:disable-next-line:forin
            for (const col in result[row]) {
                // tslint:disable-next-line:radix
                const c = parseInt(col.substring(1));
                if (Number.isFinite(c) && Number.isFinite(result[row][col])) {
                    // tslint:disable-next-line:radix
                    const x = parseInt(row) + item.info.childFixedRows;
                    const y = c + item.info.childFixedCols;
                    item.excel.updateCell(y, x, result[row][col], true, true);
                }
            }
        }
    }

    /**
     * 获得选中格子实际坐标，处理锁定行列
     */
    getRangeCoordinates() {
        let conditionRow = -1,
            conditionCol = -1;
        const { x1, y1, x2, y2 } = this.subListIfy.selectorRange;
        if (x1 > -1 && y1 > -1 && x2 > -1 && y2 > -1) {
            const index = this.subListIfy.list.findIndex(
                v => v.childId === this.subListIfy.selectedChild.childId
            );
            const item = this.subListIfy.list[index];
            // 锁定行列
            const { childFixedRows, childDataRows, childFixedCols, childDataCols } = item.info;
            // 选中行
            if (y1 === y2 && x1 !== x2 && x1 === 0 && x2 === childFixedCols + childDataCols - 1) {
                conditionRow = y1 - childFixedRows + 1;
            }
            // 选中列
            if (x1 === x2 && y1 !== y2 && y1 === 0 && y2 === childFixedRows + childDataRows - 1) {
                conditionCol = x1 - childFixedCols + 1;
            }

            // 选中单个格子
            if (x1 === x2 && y1 === y2) {
                conditionRow = y1 - childFixedRows + 1;
                conditionCol = x1 - childFixedCols + 1;
            }
        }
        return { conditionRow, conditionCol };
    }

    /**
     * 加载子表校验错误列表
     */
    loadReportCheckChildId() {
        this.service.loadReportCheckChildId(this.URLParams.keyId).subscribe(result => {
            this.subListIfy.list.forEach(item => {
                item.verify = result.indexOf(item.childId) === -1;
            });
        });
    }

    /**
     *  把只读区域
     */
    buildReadonlyRange() {
        const index = this.subListIfy.list.findIndex(
            v => v.childId === this.subListIfy.selectedChild.childId
        );
        const item = this.subListIfy.list[index];
        if (item.excel) {
            const { records } = item.excel;
            const { childReadonlyRange, childFixedRows, childFixedCols } = item.info;
            if (childReadonlyRange) {
                childReadonlyRange.split(',').forEach(coordinate => {
                    const [x, y] = coordinate.split(':');
                    const columns =
                        // tslint:disable-next-line:radix
                        records[parseInt(x) + childFixedRows - 1][parseInt(y) + childFixedCols - 1];
                    // columns.innerHTML = '-';
                    if (!columns.classList.contains('readonly')) {
                        columns.classList.add('readonly');
                    }
                });
            }
        }
    }

    /**
     * 构建编辑区域，把只读区域和锁定区域排除
     */
    buildEditorRange() {
        const index = this.subListIfy.list.findIndex(
            v => v.childId === this.subListIfy.selectedChild.childId
        );
        const item = this.subListIfy.list[index];
        if (item.excel) {
            const { records } = item.excel;
            const { childLockRange, childReadonlyRange, childFixedRows, childFixedCols } =
                item.info;

            let notEditorList = [];
            if (childLockRange) {
                notEditorList = notEditorList.concat(childLockRange.split(','));
            }
            if (childReadonlyRange) {
                notEditorList = notEditorList.concat(childReadonlyRange.split(','));
            }
            records.forEach((row, x) => {
                row.forEach((col, y) => {
                    if (x >= childFixedRows && y >= childFixedCols) {
                        const coordinate = notEditorList.find(
                            v => v === `${x - childFixedRows + 1}:${y - childFixedCols + 1}`
                        );
                        if (!coordinate) {
                            if (col.classList.contains('readonly')) {
                                col.classList.remove('readonly');
                            }
                        }
                    }
                });
            });
        }
    }
}
