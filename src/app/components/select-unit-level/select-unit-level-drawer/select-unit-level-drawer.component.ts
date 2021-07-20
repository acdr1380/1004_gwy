import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SelectUnitLevelComponent } from '../select-unit-level.component';

@Component({
    selector: 'select-unit-level-drawer',
    templateUrl: './select-unit-level-drawer.component.html',
    styleUrls: ['./select-unit-level-drawer.component.scss'],
})
export class SelectUnitLevelDrawerComponent implements OnInit {
    @Input() width = 400;
    @Output() selectedUnitChange = new EventEmitter<any>();

    @ViewChild('selectUnitLevelElement') selectUnitLevelElement: SelectUnitLevelComponent;

    /**
     * 机构权限抽屉
     */
    unitSelectedLevelIfy = {
        // 抽屉内容
        width: this.width,
        visible: false,
        title: '选择单位',
        close: () => (this.unitSelectedLevelIfy.visible = false),
        open: () => (this.unitSelectedLevelIfy.visible = true),
    };

    constructor() {}

    ngOnInit(): void {}

    /**
     * 确认选择
     */
    evtAffirm() {
        const list = this.selectUnitLevelElement.getSelectedUnitList();
        this.selectedUnitChange.emit(list);
        this.unitSelectedLevelIfy.close();
    }

    setCheckincludeChild(list, status) {
        this.selectUnitLevelElement.setCheckincludeChild(list, status);
    }

    open() {
        this.unitSelectedLevelIfy.open();
    }

    close() {
        this.unitSelectedLevelIfy.close();
    }
}
