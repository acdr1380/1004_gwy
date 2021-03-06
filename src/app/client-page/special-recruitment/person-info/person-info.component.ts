import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { ClientService } from 'app/master-page/client/client.service';
import { WfTableHelper } from 'app/util/classes/wf-table-helper';
import { CommonService } from 'app/util/common.service';
import { Base64 } from 'js-base64';
import { SpecialRecruitmentService } from '../special-recruitment.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CropperImagesComponent } from 'app/components/cropper-images/cropper-images.component';

@Component({
    selector: 'gl-person-info',
    templateUrl: './person-info.component.html',
    styleUrls: ['./person-info.component.scss'],
})
export class PersonInfoComponent implements OnInit, OnDestroy {
    @ViewChild('maintemp') private maintempEl: ElementRef;
    @ViewChild('childtemp') private childtempEl: ElementRef;

    /**代码项中文 */
    zh_CN = {};

    @ViewChild('scrollViewPersonList') private scrollViewPersonList: CdkVirtualScrollViewport;

    /** 人员列表 */
    personListIfy = {
        find: {
            // 搜索框
            searchWidth: 280,
            placeholder: '输入关键字搜索',
            nzFilterOption: () => true,
            searchList: [],
            searchKey: null,

            list: [],
            selectedIndex: -1,
            change: (value: string) => {
                const index = this.personListIfy.list.find(item => item.keyId === value);
                this.personListIfy.evtChange(index);
                this.scrollViewPersonList.scrollToIndex(this.personListIfy.index);
            },
            search: (searchKey: string) => {
                if (searchKey) {
                    this.personListIfy.find.list = this.personListIfy.list.filter(
                        item => item.A0101.indexOf(searchKey) > -1
                    );
                }
            },
        },
        list: [],
        index: 0,
        current: null,
        imgSrc: null,
        evtChange: event => {
            this.personListIfy.current = event;
            this.personListIfy.index = this.personListIfy.list.findIndex(
                item => item.keyId === event.keyId
            );
            this.personListIfy.imgSrc = event.imgSrc;
            if (this.personListIfy.current) {
                this.tabIfy.indexChange(this.tabIfy.index);
            }
        },
        uploadPic: () => {
            if (!this.personListIfy.current) {
                this.message.warning('未获取到人员信息,请先添加人员基本信息保存后在上传照片!');
                return;
            }
            this.cropperPictureIfy.open();
        },
    };

    /** 子集信息 */
    tabIfy = {
        list: [],
        index: 0,
        current: null,
        indexChange: index => {
            this.tabIfy.index = index;
            this.tabIfy.current = this.tabIfy.list[index];
            if (!this.tabIfy.list[this.tabIfy.index]?.temp) {
                this.tabIfy.list[this.tabIfy.index].form = new FormGroup({}); // 表单
                this.tabIfy.list[this.tabIfy.index].fields = []; // 表单字段
                this.tabIfy.list[this.tabIfy.index].tableData = []; // 表格数据
                this.tabIfy.list[this.tabIfy.index].tableFields = []; // 表格字段
                this.tabIfy.list[
                    this.tabIfy.index
                ].tableId = this.tabIfy.current.systemSchemeTable.TABLE_CODE;
                this.tabIfy.list[this.tabIfy.index].temp =
                    this.tabIfy.list[this.tabIfy.index].tableId ===
                    this.tableHelper.getTableCode('A01')
                        ? this.maintempEl
                        : this.childtempEl;

                // 构造表单字段
                this.render(
                    this.tabIfy.list[this.tabIfy.index],
                    this.tabIfy.list[this.tabIfy.index].fields,
                    this.tabIfy.list[this.tabIfy.index].form,
                    this.tabIfy.list[this.tabIfy.index].tableFields
                );
            }
            // this.getPersonInfo();
            if (this.tabIfy.current.tableId === this.tableHelper.getTableCode('A01')) {
                if (!this.personListIfy.current?.isLoda) {
                    this.getPersonInfo();
                } else {
                    this.zh_CN = this.personListIfy.current;
                    this.tabIfy.current.form.reset(this.personListIfy.current);
                }
            } else {
                const index = this.tabIfy.current.tableId.lastIndexOf('_');
                const subId = this.tabIfy.current.tableId.substring(
                    index + 1,
                    this.tabIfy.current.tableId.length
                );
                if (
                    !this.personListIfy.current[this.tableHelper.getTableCode(subId)] ||
                    this.personListIfy.current[this.tableHelper.getTableCode(subId)].length <= 0
                ) {
                    this.getPersonInfo();
                } else {
                    this.tabIfy.list[this.tabIfy.index].tableData = this.personListIfy.current[
                        this.tableHelper.getTableCode(subId)
                    ];
                }
            }
        },
    };

    /** 子集抽屉 */
    childDra = {
        visible: false,
        title: '人员信息',
        width: 400,
        current: null,
        open: () => {
            this.childDra.visible = true;
        },
        close: () => {
            this.childDra.visible = false;
            this.tabIfy.current.form.reset();
            this.zh_CN = {};
            this.childDra.current = null;
        },
        edit: item => {
            this.childDra.current = item;
            this.zh_CN = item;
            this.tabIfy.current.form.reset(item);
            this.childDra.open();
        },
        delete: item => {
            const tableId = this.tabIfy.current.tableId;
            const i = tableId.lastIndexOf('_');
            const subId = tableId.substring(i + 1, tableId.length);
            const param = {};
            param[this.tableHelper.getTableCode(subId) + '_ID'] =
                item[this.tableHelper.getTableCode(subId) + '_ID'];
            const _loading = this.loading.show();
            this.service.deletePersonInfo(param, this.tabIfy.current.tableId).subscribe(res => {
                _loading.close();
                if (res.code === 0) {
                    const index = this.personListIfy.current[tableId].findIndex(
                        x => x[tableId + '_ID'] === item[tableId + '_ID']
                    );
                    this.personListIfy.current[tableId].splice(index, 1);
                    this.tabIfy.list[this.tabIfy.index].tableData = [
                        ...this.personListIfy.current[tableId],
                    ];
                }
            });
        },
    };

    @ViewChild('cropperImageElement')
    cropperImageElement: CropperImagesComponent;

    /**
     * 裁剪照片 抽屉
     */
    cropperPictureIfy = {
        // 抽屉内容
        width: 600,
        visible: false,
        title: '照片上传',
        close: () => {
            this.cropperPictureIfy.visible = false;
        },
        open: () => {
            this.cropperImageElement.resetURL();
            this.cropperPictureIfy.visible = true;
        },

        evtUpload: () => {
            this.cropperPictureIfy.open();
        },
        evtPhotoChange: async file => {
            const tableId = this.tableHelper.getTableCode('A01B');
            const param = {
                A01BTYPE: file.fileType,
                A01BPATH: file.fileId,
                A01BNAME: file.fileName,
                A01BSIZE: file.fileSize,
            };
            param[tableId + '_A01_ID'] = this.personListIfy.current[
                this.tableHelper.getTableCode('A01') + '_ID'
            ];

            const data = await this.service.insertPersonInfo(param, tableId).toPromise();
            this.personListIfy.list[this.personListIfy.index].imgSrc = this.getImgUrl(file.fileId);
            this.personListIfy.imgSrc = this.getImgUrl(file.fileId);
            this.cropperPictureIfy.close();
        },
    };

    constructor(
        private loading: LoadingService,
        private commonService: CommonService,
        private clientService: ClientService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private ActiveRoter: ActivatedRoute,
        private tableHelper: WfTableHelper,
        private service: SpecialRecruitmentService,
        private message: NzMessageService
    ) {}

    async ngOnInit() {
        this.clientService.buildBreadCrumb([
            {
                type: 'event',
                icon: 'left',
                text: '返回',
                event: () => {
                    this.router.navigate(['/client/special-recruitment']);
                },
            },
        ]);
        await this.getFields();
        await this.loadRouterParam();
    }

    ngOnDestroy(): void {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 获取路由信息
     */
    loadRouterParam() {
        this.ActiveRoter.params.subscribe(async (param: Params) => {
            if (param.GL) {
                this.personListIfy.list = JSON.parse(Base64.decode(param.GL)).map(x => ({
                    ...x,
                    keyId: x[this.tableHelper.getTableCode('A01') + '_ID'],
                }));
                this.personListIfy.evtChange(this.personListIfy.list[0]);
            }
        });
    }

    /**
     *  获取人员信息
     */
    async getPersonInfo() {
        if (!this.personListIfy.current) {
            return;
        }
        const tableId = this.tabIfy.current.tableId;
        const index = tableId.lastIndexOf('_');
        const subId = tableId.substring(index + 1, tableId.length);
        const param = {};

        if (tableId === this.tableHelper.getTableCode('A01')) {
            param[`${this.tableHelper.getTableCode(subId)}_ID`] = this.personListIfy.current.keyId;
            const _loading = this.loading.show();
            const res = await this.service.getPersonA01Info(param, tableId).toPromise();
            param[
                `${this.tableHelper.getTableCode('A01B')}_A01_ID`
            ] = this.personListIfy.current.keyId;
            const img = await this.service
                .getPersonA01Info(param, this.tableHelper.getTableCode('A01B'))
                .toPromise();
            _loading.close();
            if (res.code === 0) {
                this.zh_CN = res.data;
                this.personListIfy.list[this.personListIfy.index] = {
                    ...res.data,
                    keyId: this.personListIfy.current.keyId,
                    isLoda: true,
                };
                if (img.data) {
                    this.personListIfy.list[this.personListIfy.index].imgSrc = this.getImgUrl(img.data.A01BPATH);
                    this.personListIfy.imgSrc = this.getImgUrl(img.data.A01BPATH);
                }
                this.tabIfy.list[this.tabIfy.index].form.reset(res.data);
            }
        } else {
            param[
                `${this.tableHelper.getTableCode(subId)}_A01_ID`
            ] = this.personListIfy.current.keyId;
            const _loading = this.loading.show();
            const res = await this.service.getPersonChildInfo(param, tableId).toPromise();
            _loading.close();
            if (res.code === 0) {
                this.zh_CN = res.data;
                this.tabIfy.list[this.tabIfy.index].tableData = res.data;
                // 把数据保存在在人上，避免二次请求
                this.personListIfy.current[`${this.tableHelper.getTableCode(subId)}`] = res.data;
            }
        }
    }

    /**
     * 保存A01信息
     */
    async savePersonA01Info() {
        if (!this.commonService.formVerify(this.tabIfy.current.form)) {
            return;
        }
        const param = this.tabIfy.current.form.getRawValue();
        const tableId = this.tabIfy.current.tableId;
        const _loading = this.loading.show();
        // 判断是否是编辑
        if (this.personListIfy.current) {
            param[this.tabIfy.current.tableId + '_ID'] = this.personListIfy.current.keyId;

            await this.service.updatePersonInfo(param, tableId).toPromise();
            _loading.close();
            return;
        }

        const res = await this.service.insertPersonInfo(param, tableId).toPromise();
        _loading.close();
        if (res.code === 0) {
            this.personListIfy.list = [
                ...this.personListIfy.list,
                { ...res.data, keyId: res.data[tableId + '_ID'] },
            ];
            // 之前没有选中人员，添加之后选中
            if (!this.personListIfy.current) {
                this.personListIfy.evtChange(
                    this.personListIfy.list[this.personListIfy.list.length - 1]
                );
            }
        }
    }

    /**
     * 保存子集信息
     */
    async savePersonchnildInfo() {
        if (!this.commonService.formVerify(this.tabIfy.current.form)) {
            return;
        }
        const param = this.tabIfy.current.form.getRawValue();
        const tableId = this.tabIfy.current.tableId;
        const i = tableId.lastIndexOf('_');
        const subId = tableId.substring(i + 1, tableId.length);
        const _loading = this.loading.show();
        // 判断是否是编辑
        if (this.childDra.current) {
            param[this.tabIfy.current.tableId + '_ID'] = this.childDra.current[
                this.tabIfy.current.tableId + '_ID'
            ];
            const res = await this.service.updatePersonInfo(param, tableId).toPromise();
            _loading.close();
            if (res.code === 0) {
                // 保存子集之后的操作
                // 直接修改tabledata数据
                const index = this.tabIfy.current.tableData.findIndex(
                    x =>
                        x[this.tabIfy.current.tableId + '_ID'] ===
                        this.childDra.current[this.tabIfy.current.tableId + '_ID']
                );
                this.tabIfy.list[this.tabIfy.index].tableData[index] = res.data;
                this.tabIfy.list[this.tabIfy.index].tableData = [
                    ...this.tabIfy.list[this.tabIfy.index].tableData,
                ];
                this.personListIfy.current[
                    `${this.tableHelper.getTableCode(subId)}`
                ] = this.tabIfy.list[this.tabIfy.index].tableData;
                this.childDra.close();
            }
            return;
        }
        param[this.tabIfy.current.tableId + '_A01_ID'] = this.personListIfy.current.keyId;
        const res = await this.service.insertPersonInfo(param, tableId).toPromise();
        _loading.close();
        if (res.code === 0) {
            this.tabIfy.list[this.tabIfy.index].tableData = [
                ...this.tabIfy.list[this.tabIfy.index].tableData,
                res.data,
            ];
            this.personListIfy.current[
                `${this.tableHelper.getTableCode(subId)}`
            ] = this.tabIfy.list[this.tabIfy.index].tableData;
            this.childDra.close();
        }
    }

    /**
     * 获取界面方案,并构造表单
     */
    async getFields() {
        const _loading = this.loading.show();
        let scheme = await this.getSchemeContent('special-recruitment-fields');
        _loading.close();
        if (scheme) {
            this.tabIfy.list = scheme.systemSchemeList;
        }
    }
    /**
     * 取界面方案字段
     * @param scheme 界面方案标识
     */
    private async getSchemeContent(scheme) {
        return await this.commonService.getSchemeContent(scheme).toPromise();
    }

    /**
     * 根据界面方案构建表单
     * @param scheme 界面方案
     * @param fields 字段数组
     *
     */
    private render(scheme: any, fields: Array<any>, form: FormGroup, tableFields: Array<any>) {
        scheme.systemSchemeEdit.forEach(field => {
            form.addControl(
                field.TABLE_COLUMN_CODE,
                new FormControl(
                    { value: null, disabled: field.SCHEME_EDIT_IS_READONLY },
                    [
                        field.SCHEME_EDIT_IS_MUST_INPUT ? Validators.required : null,
                        field.SCHEME_EDIT_CHECK_SCRIPT
                            ? this.commonService.buildValidatorsFn(
                                  field,
                                  field.SCHEME_EDIT_CHECK_SCRIPT
                              )
                            : null,
                    ].filter(s => s)
                )
            );
            fields.push(field);
        });
        scheme.systemSchemeHeader.forEach(x => tableFields.push(x));
    }

    /**
     * 添加系统外人员
     */
    addOutsideSystem() {
        this.personListIfy.current = null;
        this.personListIfy.index = -1;
        const index = this.tabIfy.list.findIndex(
            x => x.tableId === this.tableHelper.getTableCode('A01')
        );
        this.tabIfy.list[index].form.reset(); // 清空表单
        this.zh_CN = {};
        this.tabIfy.indexChange(index); // 跳转到A01信息集
    }

    /** 构造图片路径 */
    getImgUrl(fileName: string): string {
        return 'api/gl-file-service/photo/' + fileName;
    }
}
