import { Component, OnInit, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PersonVerifyService } from './person-verify.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'p-person-verify',
    templateUrl: './person-verify.component.html',
    styleUrls: ['./person-verify.component.scss'],
})
export class PersonVerifyComponent implements OnInit {
    /**
     * 校验参数
     */
    @Input() verifyParams: any;
    /**
     * 人员信息校验
     */
    personVerifyIfy = {
        title: '人员信息校验',
        visible: false,
        width: 700,

        close: () => {
            this.personVerifyIfy.visible = false;
        },
        open: () => {
            this.personVerifyIfy.visible = true;
        },

        _checkData: () => {
            const data = {
                keyIds: [],
                orgId: '',
                unitId: this.verifyParams.selectedNode.ORG_B01_ID,
                checkType: 1,
                pClassIds: ['01'],
                treeIncludeLowerLevel: this.verifyParams.level,
                // pageIndex: 0,
                // pageSize: 20,
            };
            this.personVerifyIfy.table.loading = true;
            this.service.checkExecute(data).subscribe(result => {
                this.personVerifyIfy.table.loading = false;
                this.personVerifyIfy.table.data = result;

                if (result && result.length > 0) {
                    this.personVerifyIfy.open();
                } else {
                    this.message.success('人员信息无误。');
                }
            });
        },

        table: {
            data: [],
            checkRules: [],
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            BufferPx: 500,
            loading: false,

            selectedRowIndex: -1,
        },
    };

    constructor(private service: PersonVerifyService, private message: NzMessageService) {}

    ngOnInit() {}

    /**
     * 打开人员校验信息抽屉
     */
    show() {
        // this.personVerifyIfy._checkData();

        // 使用假数据

        this.personVerifyIfy.table.data = [
            {
                keyName: '06年专技',
                idCard: '653022196411015354',
                result: '籍贯不能为空',
            },
            {
                keyName: '06年专技',
                idCard: '653022196411015354',
                result: '民族不能为空',
            },
            {
                keyName: '管理人员',
                idCard: '511023199605237016',
                result: '健康状况不能为空',
            },
            {
                keyName: '测试',
                idCard: '341282195110203536',
                result: '民族不能为空',
            },
            {
                keyName: '张三',
                idCard: '330401197009161369',
                result: '籍贯不能为空',
            },
            {
                keyName: '库测试',
                idCard: '110101199003072017',
                result: '健康状况不能为空',
            },
            {
                keyName: '库测试',
                idCard: '110101199003072017',
                result: '档案身份不能为空',
            },
        ];

        this.personVerifyIfy.open();
    }
}
