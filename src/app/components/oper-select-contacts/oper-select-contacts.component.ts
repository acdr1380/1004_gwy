import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'app/util/common.service';
import { OperSelectContactsService } from './oper-select-contacts.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'oper-select-contacts',
    templateUrl: './oper-select-contacts.component.html',
    styleUrls: ['./oper-select-contacts.component.scss'],
})
export class OperSelectContactsComponent implements OnInit {
    @Input() unitId: string;
    @Output() selectChange = new EventEmitter<any>();
    userInfo;

    /**
     * 联系人选择框
     */
    contactsIfy = {
        title: '联系人选择',
        visible: false,
        width: 500,
        open: () => {
            this.contactsIfy._loadList();
            this.contactsIfy.visible = true;
        },
        close: () => (this.contactsIfy.visible = false),

        pageIndex: 1,
        pageSize: 10,
        data: [],
        selectRowIndex: -1,
        evtSelectRow: index => {
            this.contactsIfy.selectRowIndex = index;
        },
        evtSelectRowConfirm: index => {
            this.contactsIfy.evtSelectRow(index);
            this.contactsIfy.evtConfirm();
        },

        _loadList: () => {
            this.contactsIfy.selectRowIndex = -1;
            if (this.contactsIfy.data.length > 0) {
                return;
            }
            this.service
                .getContactsList(this.userInfo.unitId)
                .subscribe(result => (this.contactsIfy.data = result));
        },

        evtConfirm: () => {
            const row =
                this.contactsIfy.data[
                    this.contactsIfy.pageSize * (this.contactsIfy.pageIndex - 1) +
                        this.contactsIfy.selectRowIndex
                ];
            this.selectChange.emit(row);
            this.contactsIfy.close();
        },
    };
    constructor(private service: OperSelectContactsService, private commonService: CommonService) {}

    ngOnInit() {
        this.userInfo = this.commonService.getUserLoginInfo();
    }

    show() {
        this.contactsIfy.open();
    }

    close() {
        this.contactsIfy.close();
    }
}
