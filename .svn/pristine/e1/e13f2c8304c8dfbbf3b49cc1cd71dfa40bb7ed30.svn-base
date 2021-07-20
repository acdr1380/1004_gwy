import { Component, OnInit, Input } from '@angular/core';
import { TibetPersonEditService } from '../../tibet-person-edit.service';

@Component({
    selector: 'tibet-edit-person-check',
    templateUrl: './person-check.component.html',
    styleUrls: ['./person-check.component.scss'],
})
export class PersonCheckComponent implements OnInit {
    /**
     * 是否是全部校验
     */
    _isAllCheck;
    @Input() set isAllCheck(v) {
        this._isAllCheck = v;
        this.personCheck.check();
    }
    get isAllCheck() {
        return this._isAllCheck;
    }
    /**
     * 校验人员,当前人员就传一个人的，所有就传全部人员
     */
    @Input() personList = [];
    /**
     * 校验人员
     */
    personCheck = {
        visible: false,
        checkData: [],
        open: () => {
            this.personCheck.visible = true;
        },
        close: () => {
            this.personCheck.visible = false;
        },
        /**
         * 开始校验
         */
        check: () => {
            const result = this.service.checkPerson();
            if (this.isAllCheck) {
                let rowSpan = 1;
                let rowIndex = 0;
                let lastKeyId = result[0].keyId;
                result.forEach((row, index) => {
                    if (rowIndex !== index && lastKeyId === row.keyId) {
                        result[index].isHide = true;
                        rowSpan++;
                        if (
                            rowIndex !== index &&
                            lastKeyId === row.keyId &&
                            index === result.length - 1
                        ) {
                            result[rowIndex].rowSpan = rowSpan;
                            rowSpan = 1;
                            rowIndex = index;
                            lastKeyId = row.keyId;
                        }
                    } else {
                        result[rowIndex].rowSpan = rowSpan;
                        rowSpan = 1;
                        rowIndex = index;
                        lastKeyId = row.keyId;
                    }
                });
            }
            this.personCheck.checkData = result;
        },
    };
    constructor(private service: TibetPersonEditService) { }

    ngOnInit(): void { }
    /**
     * 显示
     */
    show() {
        this.personCheck.open();
    }
}
