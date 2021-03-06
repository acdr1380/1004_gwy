import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from 'app/components/loading/loading.service';
import { NzTreeNode } from 'ng-zorro-antd/tree';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UnitManageService } from '../unit-manage.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'unit-msg-view',
    templateUrl: './unit-msg-view.component.html',
    styleUrls: ['./unit-msg-view.component.scss'],
})
export class UnitMsgViewComponent implements OnInit {
    /**
     * 是否是修改信息
     */
    isUpdate = false;

    private currentItem = null;
    /** 当前选中节点 */
    private _node: NzTreeNode;
    @Input() set node(v) {
        if (v) {
            this._node = v;
        }
    }
    get node() {
        return this._node;
    }

    /**
     * 用户权限
     */
    @Input() power = <any>{};

    /**
     * 机构分组ID
     */
    @Input() groupId = '';

    /**
     * 添加机构
     */
    @Output() addChange = new EventEmitter();

    /**
     * 修改机构
     */
    @Output() updateChange = new EventEmitter();

    formData = {};

    /** 机构信息 */
    unitInfoDra = {
        visible: false,
        title: this.isUpdate ? '修改单位信息' : '新增单位',
        width: 800,
        open: () => {
            this.unitInfoDra.visible = true;
        },
        close: () => {
            this.formData = {};
            this.unitInfoDra.form.reset({ UNIT_TYPE: '2' });
            this.unitInfoDra.visible = false;
        },
        form: new FormGroup({
            B0121: new FormControl(null),
            UNIT_TYPE: new FormControl('2'),
            DATA_3001_UNIT_B01_ID: new FormControl(null),
            B0114: new FormControl(null),
            B0101: new FormControl(null),
            B0104: new FormControl(null),
            B0117: new FormControl(null),
            B0124: new FormControl(null),
            B0131: new FormControl(null),
            B0127: new FormControl(null),
            B0183: new FormControl(null),
            B0115: new FormControl(null),
            B0105: new FormControl(null),
            _B0183: new FormControl({ value: null, disabled: true }),
            B0185: new FormControl(null),
            _B0185: new FormControl({ value: null, disabled: true }),
            B0227: new FormControl(null),
            _B0227: new FormControl({ value: null, disabled: true }),
            B0232: new FormControl(null),
            _B0232: new FormControl({ value: null, disabled: true }),
            B0233: new FormControl(null),
            _B0233: new FormControl({ value: null, disabled: true }),
            B0236: new FormControl(null),
            _B0236: new FormControl({ value: null, disabled: true }),
            B0234: new FormControl(null),
            _B0234: new FormControl({ value: null, disabled: true }),
            D0173: new FormControl(null),
            B0268: new FormControl(null),
            B0238: new FormControl(null),
            H0109: new FormControl(null),
            B0269: new FormControl(null),
            B0239: new FormControl(null),
            B0180: new FormControl(null),
            P_B0101: new FormControl({ value: null, disabled: true }),
            P_B0114: new FormControl({ value: null, disabled: true }),
            ORG_NAME: new FormControl(null, Validators.required),
            ORG_TYPE: new FormControl(null, Validators.required),
            ORG_GROUP_ID: new FormControl(null, Validators.required),
            ORG_DESC: new FormControl(null),
            isTop: new FormControl(null),
        }),
        save: () => {
            if (this.isUpdate) {
                this.unitInfoDra.updateOrgUnit();
            } else {
                this.unitInfoDra.addOrgUnit();
            }
        },
        // 添加单位信息
        addOrgUnit: () => {
            const param = this.unitInfoDra.form.getRawValue();
            param.ORG_GROUP_ID = this.groupId;
            param.ORG_NAME = param.B0101;
            param.ORG_TYPE = param.UNIT_TYPE;
            param.ORG_DESC = param.B0180;
            if (!param.isTop && this.node.key) {
                param.SYS_PARENT = this.node.key;
            } else {
                param.SYS_PARENT = -1;
            }
            const _loading = this.loading.show();
            this.service.addOrgUnitDate(param).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    res.data = {
                        ...res.data,
                        ...param,
                        title: res.data.ORG_NAME,
                        key: res.data.DATA_UNIT_ORG_ID,
                        isLeaf: !res.data.SYS_HAVE_CHILD,
                        nodeType: res.data.ORG_TYPE,
                    };
                    this.addChange.emit(res.data);
                    this.unitInfoDra.close();
                }
            });
        },
        // 修改单位信息
        updateOrgUnit: () => {
            let param = this.unitInfoDra.form.getRawValue();
            param.ORG_GROUP_ID = this.groupId;
            param.ORG_NAME = param.B0101;
            // param.DATA_UNIT_ORG_ID = this.currentItem.DATA_UNIT_ORG_ID;
            // param.DATA_UNIT_ORG_ID = this.currentItem.DATA_UNIT_ORG_ID;
            param.ORG_B01_ID = this.currentItem.DATA_3001_UNIT_B01_ID;
            param.ORG_TYPE = this.currentItem.ORG_TYPE;
            param = { ...this.currentItem, ...param };
            // if (this.currentItem.B0101 !== param.B0101 || this.currentItem.B0104 !== param.B0104) {
            //     this.modalService.confirm({
            //         nzTitle: '系统提示',
            //         nzContent: `<b>您是否希望同时更新当前机构下人员得工作单位及职务全（简）称信息吗？</b>`,
            //         nzOkText: '确定',
            //         nzOkType: 'primary',
            //         nzOnOk: () => {
            //             const __loading = this.loading.show();
            //             this.service.updateByWhere(param).subscribe(res => {
            //                 __loading.close();
            //                 if (res.code === 0) {
            //                     this.updateChange.emit(res.data);
            //                     this.unitInfoDra.close();
            //                 }
            //             });
            //         },
            //         nzCancelText: '取消',
            //         nzOnCancel: () => {
            //             const __loading = this.loading.show();
            //             this.service.updateOrgUnitDate(param).subscribe(res => {
            //                 __loading.close();
            //                 if (res.code === 0) {
            //                     this.updateChange.emit(res.data);
            //                     this.unitInfoDra.close();
            //                 }
            //             });
            //         },
            //     });
            //     return;
            // }
            const _loading = this.loading.show();
            this.service.updateOrgUnitDate(param).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    this.updateChange.emit(res);
                    this.unitInfoDra.close();
                }
            });
        },
    };

    constructor(
        private service: UnitManageService,
        private cdr: ChangeDetectorRef,
        private loading: LoadingService,
        private msg: NzMessageService,
        private modalService: NzModalService,
        private tableHelper: WfTableHelper
    ) {}

    ngOnInit() {}

    public show(currentItem = null) {
        if (!this.node) {
            return this.msg.warning('请先选择节点！');
        }
        this.currentItem = currentItem;
        this.isUpdate = currentItem ? true : false;
        if (this.isUpdate) {
            this.loadOrgB01Data();
        } else {
            this.loadParent();
        }
        this.getRealityCount();
        this.unitInfoDra.open();
    }

    /**
     * 加载修改单位信息
     */
    loadOrgB01Data() {
        if (!this.currentItem) {
            return;
        }
        const param = {
            // DATA_UNIT_B01_ID: this.currentItem.DATA_UNIT_B01_ID,
        };
        param[`${this.tableHelper.getTableCode('B01')}_ID`] =
            this.currentItem[`${this.tableHelper.getTableCode('B01')}_ID`];
        // const parentNode = await this.service.selectParentByChild(this.node.origin.DATA_UNIT_B01_ID, this.node.origin.DATA_UNIT_ORG_ID);
        this.service.getUnitB01(param).subscribe(res => {
            res.P_B0101 = res.B0101;
            res.P_B0114 = res.B0114;
            res._B0183 = res.B0183;
            res._B0185 = res.B0185;
            res._B0227 = res.B0227;
            res._B0232 = res.B0232;
            res._B0233 = res.B0233;
            res._B0234 = res.B0234;
            res._B0236 = res.B0236;
            this.formData = res;
            this.unitInfoDra.form.reset(res);
        });
    }

    /** 获取父节点信息 */
    loadParent() {
        const param = {};
        param[`${this.tableHelper.getTableCode('B01')}_ID`] = this.node.origin.ORG_B01_ID;
        this.service.getUnitB01(param).subscribe(res => {
            const form = {
                P_B0101: res.B0101,
                P_B0114: res.B0114,
            };
            this.unitInfoDra.form.patchValue(form);
        });
    }

    /** 获取实有数统计 */
    getRealityCount() {
        const param = {
            ORG_B01_ID: this.isUpdate ? this.currentItem.DATA_3001_UNIT_B01_ID :this.node.origin.ORG_B01_ID
        }
        this.service.getRealityPersonCount(param).subscribe(res => {
            const data = {};
            for (const key in res) {
                if (!Object.prototype.hasOwnProperty.call(data, key)) {
                    data['_'+ key] = res[key]
                }
            }
            this.unitInfoDra.form.patchValue(data);
        });
    }
}
