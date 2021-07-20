import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'select-org-drawer',
    templateUrl: './select-org-drawer.component.html',
    styleUrls: ['./select-org-drawer.component.scss'],
})
export class SelectOrgDrawerComponent implements OnInit {
    /**
     * 是否显示包含下层（单个节点包含下层）
     */
    @Input() isLevel = false;

    /**
     * 选中单位触发
     */
    @Output() selectOrgChange = new EventEmitter<any>();

    /**
     * 确认选择后触发
     */
    @Output() affirmSelectedChange = new EventEmitter<any>();

    selectNode;
    /**
     * 选择单位抽屉
     */
    selectOrgDrawerIfy = {
        title: '选择单位',
        width: 400,
        visible: false,
        close: () => {
            this.selectOrgDrawerIfy.visible = false;
        },
        open: () => {
            this.selectOrgDrawerIfy.visible = true;
        },
        affirm: () => {
            this.affirmSelectedChange.emit(this.selectNode);
            this.selectOrgDrawerIfy.close();
        },
    };
    constructor() {}

    ngOnInit() {}

    /**
     * 打开选择单位抽屉
     */
    show() {
        this.selectOrgDrawerIfy.open();
    }

    /**
     * 选中单位回调
     */
    evtSelectOrgChange(event) {
        this.selectNode = event;
        this.selectOrgChange.emit(event);
    }
}
