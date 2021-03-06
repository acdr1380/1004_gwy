import { ExcelControlService } from './excel-control.service';
import {
    Component,
    OnInit,
    Input,
    ViewChildren,
    QueryList,
    ElementRef,
    ContentChild,
    TemplateRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { FormAccessTypeEnum } from './enums/FormAccessTypeEnum';
import { fromEvent } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'excel-control',
    templateUrl: './excel-control.component.html',
    styleUrls: ['./excel-control.component.scss'],
})
export class ExcelControlComponent implements OnInit {
    /**
     * 表册标识符
     */
    _permission: string;
    @Input() set permission(v) {
        if (!v) {
            return;
        }
        console.dir(v);
        this._permission = v;
        this.tableRowTemplate = null;
        this.sheetIfy.list = [];
        setTimeout(() => {
            this.loadExcelInfo();
        }, 1);
    }
    get permission(): string {
        return this._permission;
    }

    /**
     * 取数自定义url
     */
    @Input() getDataURL;

    /**
     * 表册参数
     */
    _params: any;
    @Input() set params(v) {
        if (!v || Object.keys(v).length === 0) {
            return;
        }
        this._params = v;
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        if (sheet && sheet.isLoad) {
            this.loadSheetData();
        }
    }
    get params() {
        return this._params;
    }

    /**
     * 版本号
     */
    @Input() version = 1;

    /**
     * 是否预览模式（不取数）
     */
    @Input() isPreview = false;

    /**
     * 是否打印
     */
    @Input() isPrint = false;

    /**
     * 是否下载
     */
    @Input() isDown = false;

    /**
     * 自定义头部模板
     */
    @Input() diyHeaderTemplate: TemplateRef<void>;

    /**
     * 自定义格式化显示
     */
    @Input() formatConfig = {
        formatChar: null,
        formatConditionFN: null,
    };
    // @Input() formatConfig = {
    //     formatChar: '<b>%s</b>',
    //     formatConditionFN: v => v < 0,
    // };

    @Output() tdEventChange = new EventEmitter<any>();

    /**
     * 表册信息
     */
    formInfo;

    /**
     * sheet标签
     */
    sheetIfy = {
        list: [],
        selecedtIndex: 0,
        evtChange: event => {
            this.setExcelHTML();
        },
    };

    @ViewChildren('excelmultiMains') excelmultiMains: QueryList<ElementRef>;

    tableRowTemplate: HTMLTableRowElement;

    constructor(private service: ExcelControlService) {}

    ngOnInit() {}

    /**
     * 表册基本信息
     */
    private loadExcelInfo() {
        this.service.getFormData(this.permission, this.version).subscribe(result => {
            this.formInfo = result;
            this.loadExcelSheetList();
        });
    }

    /**
     * 加载Sheet标签
     */
    private loadExcelSheetList() {
        this.service.getExcelSheetList(this.formInfo.SYS_FORM_ID).subscribe(result => {
            this.sheetIfy.list = result.map((sheet, index) => {
                sheet.path = `assets/excels/${this.formInfo.FORM_NAME}_${index}.htm`;
                sheet.loading = true;
                return sheet;
            });
            this.sheetIfy.evtChange(this.sheetIfy.selecedtIndex);
        });
    }

    /**
     * 加载sheet对应HTML
     */
    async setExcelHTML() {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        if (sheet.html) {
            this.loadFormConfigData();
            return;
        }
        sheet.html = await this.service.getExcelOfHTML(sheet.path);
        const childRef: HTMLElement =
            this.excelmultiMains.toArray()[this.sheetIfy.selecedtIndex].nativeElement;
        if (childRef) {
            childRef.innerHTML = sheet.html;
            sheet.doc$ = childRef;
            sheet.copyDoc$ = childRef.cloneNode(true);
            sheet.table$ = sheet.doc$.querySelector('table');
            this.buildVirtualTable();
        }

        this.loadFormConfigData();
    }

    /**
     * 加载表册配置信息
     */
    loadFormConfigData() {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        this.service
            .getFormPageConfig({
                SYS_FORM_ID: this.formInfo.SYS_FORM_ID,
                FORM_CONFIG_PAGE_NO: this.sheetIfy.selecedtIndex,
            })
            .subscribe(result => {
                sheet.pageConfig = result;
                this.loadFormArea();
            });
    }

    /**
     * 加载表册区域
     */
    private loadFormArea() {
        const data = {
            FORM_AREA_FORM_ID: this.formInfo.SYS_FORM_ID,
            FORM_AREA_PAGE_NO: this.sheetIfy.selecedtIndex,
        };
        this.service.getAreaSettingList(data).subscribe(result => {
            const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
            sheet.area = result;
            sheet.isLoad = true;

            this.loadSheetData();
        });
    }

    /**
     * 加载表册数据
     */
    private loadSheetData() {
        if (!this.params || Object.keys(this.params).length === 0) {
            return;
        }
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        this.service
            .getFormExecute(
                {
                    ...this.params,
                    SYS_FORM_ID: this.formInfo.SYS_FORM_ID,
                    FORM_CONFIG_PAGE_NO: this.sheetIfy.selecedtIndex,
                },
                this.getDataURL
            )
            .subscribe(result => {
                sheet.formExecute = result;
                this.initSheetResult();
            });
    }

    /**
     * 初始化sheet数据
     * 分离cell，table（区域）数据
     */
    private initSheetResult() {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        if (sheet.area.length > 0) {
            const areaData = [];
            sheet.area.forEach(item => {
                const { FORM_AREA_START_X, FORM_AREA_START_Y } = item;
                const key = `${item.FORM_AREA_PAGE_NO},${FORM_AREA_START_X},${FORM_AREA_START_Y}`;
                areaData.push(sheet.formExecute[key]);
                delete sheet.formExecute[key];
            });
            sheet.areaData = areaData;
            this.setSheetAreaData();
        } else {
            // this.drawDiagonal();
            this.setSheetData();
        }

        this.regEvent(sheet.table$);

        // 加载完成
        setTimeout(() => {
            sheet.loading = false;
        }, 300);
    }

    /**
     * 设置sheet数据
     */
    private setSheetData(isRef = true) {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];

        if (isRef) {
            // 实现无缝刷新
            const parent = sheet.table$.parentNode;
            sheet.table$.remove();
            const copyTable = sheet.copyDoc$.cloneNode(true).querySelector('table');
            parent.appendChild(copyTable);
            sheet.table$ = sheet.doc$.querySelector('table');
        }

        // 无缝刷新之前绑定其它数据
        this.buildVirtualTable();
        this.drawDiagonal();

        // tslint:disable-next-line:forin
        for (const key in sheet.formExecute) {
            const [sheetIndex, x, y] = key.split(',');
            const config = sheet.pageConfig.find(v => v.startStr === key);
            if (!config) {
                continue;
            }
            let value = sheet.formExecute[key].value;
            // if (!value) {
            //     continue;
            // }
            if (typeof this.formatConfig.formatConditionFN === 'function') {
                if (this.formatConfig.formatConditionFN(value)) {
                    value = this.formatConfig.formatChar.replace('%s', value);
                }
            }
            switch (config.accessType) {
                case FormAccessTypeEnum.CHAR:
                    this.setCellValue(x, y, value);
                    break;
                case FormAccessTypeEnum.LIST:
                    break;
                case FormAccessTypeEnum.PHOTO:
                    this.setCellValue(
                        x,
                        y,
                        `<img width="98" height="121" src="api/gl-file-service/photo/${sheet.formExecute[key].value}" onerror="this.src = 'assets/images/wf/noPictureNoFun.png'"/>`
                    );
                    break;
            }

            if ([2, 3].indexOf(config.editType) > -1) {
                const td$ = this.getCell(x, y);
                if (!td$.classList.contains('special')) {
                    td$.classList.add('special');
                }
            }
        }
    }

    /**
     * 设置sheet 区域数据
     */
    private setSheetAreaData() {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];

        // 实现无缝刷新
        const parent = sheet.table$.parentNode;
        sheet.table$.remove();
        const copyTable = sheet.copyDoc$.cloneNode(true).querySelector('table');
        parent.appendChild(copyTable);
        sheet.table$ = sheet.doc$.querySelector('table');

        // 无缝刷新之前绑定其它数据
        this.buildVirtualTable();
        this.drawDiagonal();
        this.setSheetData(false);

        // 遍历每个区域进行数据搬到
        sheet.area.forEach((item, index) => {
            const { FORM_AREA_START_X, FORM_AREA_START_Y, FORM_AREA_END_X, FORM_AREA_END_Y } = item;
            const list = sheet.pageConfig.filter(
                c =>
                    c.sheet === item.FORM_AREA_PAGE_NO &&
                    c.startX >= FORM_AREA_START_X &&
                    c.startY >= FORM_AREA_START_Y &&
                    c.endX <= FORM_AREA_END_X &&
                    c.endY <= FORM_AREA_END_Y
            );
            // 每个区域列表绑定数据
            if (sheet.areaData[index]) {
                this.setTableListData(item, list, sheet.areaData[index]);
            }
        });
    }

    /**
     * 设置sheet每个区域的数据
     */
    private setTableListData(config, fileList, result) {
        let rowLine = config.FORM_AREA_DATA_ROW;
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];

        // 处理自动增加行
        if (config.FORM_AREA_ADD_ROW && result.length > 0) {
            // 自动增加行采用数据的实际行
            if (rowLine === -1) {
                rowLine = result.length;
            }

            const table: HTMLTableElement = sheet.table$;
            const table_body = table.lastChild;
            this.tableRowTemplate = this.cloneRow(table, config.FORM_AREA_START_X);

            // 合并格子处理
            const tempRow: HTMLTableRowElement = table.rows[config.FORM_AREA_START_X];
            if (config.FORM_AREA_MERGE_COL1 !== config.FORM_AREA_ORDER_COL) {
                const tempRowToCell = tempRow.cells[config.FORM_AREA_MERGE_COL1];
                if (tempRowToCell) {
                    tempRowToCell.rowSpan =
                        config.FORM_AREA_MERGE_ROW2 === -1
                            ? result.length
                            : config.FORM_AREA_MERGE_ROW2;
                }
            }
            if (result.length > 1 && config.FORM_AREA_MERGE_COL1 > -1) {
                // 删除合并行的多余列（以免出现错位格子）
                for (let i = config.FORM_AREA_MERGE_COL1; i <= config.FORM_AREA_MERGE_COL2; i++) {
                    if (i !== config.FORM_AREA_ORDER_COL) {
                        this.tableRowTemplate.deleteCell(i);
                    }
                }
            }

            // 固定内容处理
            const lockRow = table.rows[config.FORM_AREA_START_X + 1];
            const lock = lockRow.getAttribute('lock');
            if (lock != '1') {
                lockRow.setAttribute('lock', '1');
            } else {
                // let rowIndex = lockRow.rowIndex;;
                // while (
                //     table_body.hasChildNodes() &&
                //     rowIndex !== config.FORM_AREA_START_X &&
                //     table.rows.length > config.FORM_AREA_START_X
                // ) {
                //     if (table_body.lastChild) {
                //         rowIndex = table_body.lastChild['rowIndex'];
                //         table_body.removeChild(table_body.lastChild);
                //     }
                // }
            }

            if (rowLine < 1) {
                return;
            }

            for (let i = 1; i < rowLine; i++) {
                const r = this.tableRowTemplate.cloneNode(true);
                [].forEach.call(this.tableRowTemplate.cells, (cell, y) => {
                    const rIndex = cell.getAttribute('r');
                    cell.setAttribute('r', parseInt(rIndex) + i);
                });
                table_body.insertBefore(r, lockRow);
            }
            this.buildVirtualTable();
        }

        // this.setSheetData(false);

        // 不增加行，只绑定约定行
        // 自动增加行，只绑定数据实际行
        for (let index = 0; index < rowLine; index++) {
            const row = result[index];
            if (!row) {
                continue;
            }
            if (config.FORM_AREA_ORDER_COL > -1) {
                this.setCellValue(
                    config.FORM_AREA_START_X + index,
                    config.FORM_AREA_ORDER_COL,
                    index + 1
                );
            }
            for (const key in row) {
                if (row.hasOwnProperty(key)) {
                    const [sheetIndex, x, y] = key.split(',');
                    if (x && y) {
                        const _x = parseInt(x) + index;
                        const item = fileList.find(v => v.startStr === key);
                        if (item) {
                            this.setCellValue(_x, y, row[key].value);
                        }
                    }
                }
            }
        }
    }

    /**
     * 格子的斜线
     */
    drawDiagonal() {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        const list = sheet.pageConfig.filter(v => v.bias);
        const [config] = list;
        if (!config || config.length === 0) {
            return;
        }
        const [text1, text2] = config.bias.split('|');
        const table: HTMLTableElement = sheet.table$;
        const row: HTMLTableRowElement = table.rows[config.startX];
        const cell = row.cells[config.startY];
        cell.style.position = 'relative';
        cell.innerHTML = `
            <span class="text1">${text1}</span>
            <div class="diagonal"></div>
            <span class="text2">${text2}</span>`;

        const w = Number(cell.width);
        const h = Number(cell.height);

        // 计算对角线的长度
        const len = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2));
        // 计算角度
        const deg = (Math.atan(w / h) * 180) / Math.PI;

        const [text1El, diagonalEl, text2El] = Array.prototype.slice.call(cell.children, 0);
        diagonalEl.style.cssText = `
            position: absolute;
            width: 1px;
            height: ${len}px;
            top: 0;
            left: 0;
            background-color: black;
            display: block;
            transform: rotate(-${deg}deg);
            transform-origin: top;
        `;

        text1El.style.cssText = `
            position: absolute;
            right: 0;
            top: 0;
            margin-right: 5px;
            margin-top: 5px;
        `;
        text2El.style.cssText = `
            position: absolute;
            left: 0;
            bottom: 0;
            margin-left: 5px;
            margin-bottom: 5px;
        `;
    }

    /**
     * 克隆行
     * @param table 表格
     * @param rowIndex 克隆源行
     */
    private cloneRow(table, rowIndex): HTMLTableRowElement {
        return table.rows[rowIndex].cloneNode(true) as HTMLTableRowElement;
    }

    /**
     * 构建虚拟非合并二维表
     */
    private buildVirtualTable() {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        const rowCount = this.getRowCount();
        const cellCount = this.getCellCount();
        sheet.virtualTable = Array(rowCount)
            .fill(null)
            .map(() => Array(cellCount).fill(null));

        const table: HTMLTableElement = sheet.table$;
        [].forEach.call(table.rows, (row, x) => {
            [].forEach.call(row.cells, (cell, y) => {
                const rowSpan = parseInt(cell.rowSpan);
                const colSpan = parseInt(cell.colSpan);

                const v_row = sheet.virtualTable[x];
                const absColIndex = v_row.indexOf(null);
                if (absColIndex >= 0) {
                    v_row[absColIndex] = {
                        isSource: true,
                        cell: cell,
                        rowIndex: x,
                        cellIndex: y,
                        // lockCell: x < this.fixRowNumber || absColIndex < this.fixColNumber,
                    };
                }

                cell.setAttribute('r', x);
                cell.setAttribute('c', absColIndex);

                for (let i = 0; i < rowSpan; i++) {
                    for (let j = 0; j < colSpan; j++) {
                        if (i === 0 && j === 0) {
                            continue;
                        }
                        sheet.virtualTable[x + i][absColIndex + j] = { isSource: false }; // 合并非源
                    }
                }
            });
        });
    }

    /**
     * 获得sheet最大行数
     */
    getRowCount() {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        const table: HTMLTableElement = sheet.table$;
        return table.rows.length;
    }

    /**
     * 获得sheet最大列数
     */
    getCellCount() {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        const table: HTMLTableElement = sheet.table$;
        return [].map
            .call(table.rows[0].cells, cell => Number(cell.colSpan))
            .reduce((p, c) => p + c);
    }

    /**
     * 获得单元格
     * @param rowIndex 行索引
     * @param cellIndex 列索引
     */
    getCell(rowIndex, cellIndex): HTMLTableDataCellElement {
        const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
        // const table: HTMLTableElement = sheet.table$;
        // return table.rows[rowIndex].cells[cellIndex];
        return sheet.virtualTable[rowIndex][cellIndex].cell;
    }

    /**
     * 设置单元格值
     * @param rowIndex 行索引
     * @param cellIndex 列索引
     * @param value 值
     */
    setCellValue(rowIndex, cellIndex, value) {
        const td$ = this.getCell(rowIndex, cellIndex);
        if (td$) {
            td$.innerHTML = value;
        }
    }

    /**
     * 下载表册
     */
    down() {
        this.service.downExcel({ ...this.params, SYS_FORM_ID: this.formInfo.SYS_FORM_ID });
    }

    /**
     * 注册事件
     */
    regEvent($tblEl) {
        fromEvent($tblEl, 'click').subscribe((event: Event) => {
            // console.dir(event.target);
            const el: any = event.target;
            if (el.nodeName === 'TD') {
                const r = el.getAttribute('r');
                const c = el.getAttribute('c');
                const sheet = this.sheetIfy.list[this.sheetIfy.selecedtIndex];
                const config = sheet.pageConfig.find(
                    item => item.startStr === `${this.sheetIfy.selecedtIndex},${r},${c}`
                );
                this.tdEventChange.emit({ el, config });
            }
        });
    }
}
