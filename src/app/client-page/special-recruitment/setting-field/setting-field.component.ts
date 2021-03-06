import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UserParameterTypeEnum } from 'app/entity/enums/UserParameterTypeEnum';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SpecialRecruitmentService } from '../special-recruitment.service';
import * as _ from 'lodash';
import { CommonService } from 'app/util/common.service';

@Component({
    selector: 'gl-setting-field',
    templateUrl: './setting-field.component.html',
    styleUrls: ['./setting-field.component.scss'],
})
export class SettingFieldComponent implements OnInit {
    @Input() session: any;

    @Output() fieldItemChange = new EventEmitter<any>();

    private _fields: Array<any>;

    @Input() set fields(v) {
        if (v) {
            this._fields = v.map(x => x);
            this.fieldsAdjust.selectedIfy.list = v.map(x => x);
        }
    }

    get fields(): Array<any> {
        return this._fields;
    }

    // 调整字段显示
    fieldsAdjust = {
        title: '显示字段调整',
        visible: false,
        width: 800,

        close: () => {
            this.fieldsAdjust.visible = false;
        },
        open: () => {
            this.fieldsAdjust.visible = true;
        },

        // 备选字段
        alternativeTree: {
            nodes: [] as NzTreeNodeOptions[],
            icons: ['tags', 'shield'],
            activedNode: <NzTreeNode>{},
            evtActiveNode: (data: NzFormatEmitEvent) => {
                if (data.node.origin.nodeType === 1) {
                    this.fieldsAdjust.alternativeTree.activedNode = data.node;
                }
            },
            evtDblActiveNode: (data: NzFormatEmitEvent) => {
                if (data.node.origin.nodeType === 1) {
                    this.fieldsAdjust.alternativeTree.activedNode = data.node;
                    this.fieldsAdjust.evtChoose();
                }
            },
        },

        evtChoose: () => {
            if (!this.fieldsAdjust.alternativeTree.activedNode.key) {
                return;
            }

            const { origin } = this.fieldsAdjust.alternativeTree.activedNode;
            const index = this.fieldsAdjust.selectedIfy.list.findIndex(
                v => v.TABLE_COLUMN_CODE === origin.TABLE_COLUMN_CODE
            );
            if (index === -1) {
                this.fieldsAdjust.selectedIfy.list.push(origin);
            }
        },

        selectedIfy: {
            // 默认选择字段 在调整顺序以及选择字段还有保存字段的时候处理
            defaultFilelds: ['A0101'],
            list: <any>[],
            drop: (event: CdkDragDrop<any[]>) => {
                if (event.currentIndex <= 0) {
                    this.message.warning('不能移动到固定字段前面');
                    return;
                }
                if (event.previousIndex === event.currentIndex) {
                    return;
                }
                moveItemInArray(
                    this.fieldsAdjust.selectedIfy.list,
                    event.previousIndex,
                    event.currentIndex
                );
            },

            delete: (item, index: number) => {
                this.fieldsAdjust.selectedIfy.list.splice(index, 1);
            },
        },

        save: () => {
            if (this.fieldsAdjust.selectedIfy.list.length === 0) {
                this.message.warning('未选择显示字段。');
                return;
            }
            let _paramValue = this.fieldsAdjust.selectedIfy.list.map(v => v.TABLE_COLUMN_CODE);
            _paramValue = _.uniq([..._paramValue, ...this.fieldsAdjust.selectedIfy.defaultFilelds]);
            const data = {
                USER_PARAMETER_USER_ID: this.session.authId,
                USER_PARAMETER_NAME: '专招管理-显示字段调整',
                USER_PARAMETER_TYPE: UserParameterTypeEnum.PERSON_VIEW_FIELD_CIVIL_DESIGNED,
                USER_PARAMETER_VALUE: _paramValue.join(','),
            };
            this.service.saveParameterData(data).subscribe(result => {
                if (result) {
                    this.message.success('调整成功。');
                    const fields = this.fieldsAdjust.selectedIfy.list.map(v => {
                        return {
                            ...v,
                            tableId: v.TABLE_COLUMN_CODE.slice(0, 3),
                        };
                    });
                    this.fieldItemChange.emit(fields);
                    this.fieldsAdjust.close();
                }
            });
        },
    };

    constructor(
        private message: NzMessageService,
        private service: SpecialRecruitmentService,
        private commonService: CommonService
    ) {}

    ngOnInit(): void {}

    getChemeSetItemInfo(data, fields: any[]): any[] {
        const fieldsInfo = Array(fields.length).fill(null);
        data.systemSchemeList.forEach(item => {
            item.systemSchemeEdit.forEach(field => {
                if (fields.indexOf(field.TABLE_COLUMN_CODE) > -1) {
                    fieldsInfo.splice(fields.indexOf(field.TABLE_COLUMN_CODE), 1, field);
                }
            });
        });
        return fieldsInfo;
    }

    /**
     * 根据界面方案字段构造树形结构
     *
     */
    buildFieldsTreeData(data, nodes: any[], obj = 'systemSchemeHeader') {
        data.systemSchemeList.forEach(item => {
            const node = {
                title: item.systemSchemeTable.SCHEME_TABLE_DISPLAY_NAME,
                key: item.systemSchemeTable.TABLE_CODE,
                isLeaf: item[obj].length === 0,
                children: [],
                disabled: true,
                nodeType: 0,
            };

            item[obj].forEach(field => {
                node.children.push({
                    ...field,
                    title: field.TABLE_COLUMN_NAME,
                    key: field.TABLE_COLUMN_CODE,
                    isLeaf: true,
                    nodeType: 1,
                });
            });
            nodes.push(node);
        });
    }

    /**
     * 定制显示
     */
    customDisplay() {
        if (this.fieldsAdjust.alternativeTree.nodes.length === 0) {
            this.commonService.getSchemeContent('special-recruitment-fields').subscribe(result => {
                if (result) {
                    const nodes = [];
                    this.buildFieldsTreeData(result, nodes, 'systemSchemeEdit');
                    this.fieldsAdjust.alternativeTree.nodes = nodes;
                }
            });
        }

        this.fieldsAdjust.open();
    }

    show() {
        this.customDisplay();
    }
}
