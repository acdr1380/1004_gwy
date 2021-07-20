import { CommonService } from 'app/util/common.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { TwoYearRiseService } from '../two-year-rise.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Base64 } from 'js-base64';

import { Highcharts } from 'app/util/chart/highcharts';
import { ClientService } from 'app/master-page/client/client.service';
import { SelectUnitLevelDrawerComponent } from 'app/components/select-unit-level/select-unit-level-drawer/select-unit-level-drawer.component';

@Component({
    selector: 'app-deploy',
    templateUrl: './deploy.component.html',
    styleUrls: ['./deploy.component.scss'],
})
export class DeployComponent implements OnInit, OnDestroy {
    @ViewChild('selectUnitLevel', { static: false })
    selectUnitLevel: SelectUnitLevelDrawerComponent;
    /**
     * 路由参数
     */
    URLParams: any;

    batchChart: Highcharts.Chart;

    /**
     * 业务部署信息
     */
    operDeployInfoIfy = {
        form: new FormGroup({
            title: new FormControl(null, Validators.required),
            year: new FormControl(null, Validators.required),
            startTime: new FormControl(null, Validators.required),
            endTime: new FormControl(null, Validators.required),
            content: new FormControl(null),
        }),

        start: () => {
            if (this.commonService.formVerify(this.operDeployInfoIfy.form)) {
                const data = this.operDeployInfoIfy.form.getRawValue();
                this.service.saveBatch(data).subscribe(result => {
                    this.URLParams = result;
                    const GL = Base64.encode(JSON.stringify(result));
                    this.router.navigate(['client/two-year-rise/deploy', { GL }]);
                });
            }
        },

        pageIndex: 1,
        pageSize: 5,
        unitList: [],

        _init: () => {
            this.operDeployInfoIfy.form.patchValue(this.URLParams);
            this.operDeployInfoIfy._loadUnitList();
            this.operDeployInfoIfy._loadChartData();
        },
        _loadUnitList: () => {
            this.service.selectSendUnitList(this.URLParams.batchId).subscribe(result => {
                this.operDeployInfoIfy.unitList = result;
            });
        },
        _loadChartData: () => {
            this.service.selectAnalyseData(this.URLParams.batchId).subscribe(result => {
                this.operDeployInfoIfy.loadChart(result);
            });
        },

        evtSelectUnit: () => {
            this.selectUnitLevel.open();
        },

        save: () => {
            if (this.commonService.formVerify(this.operDeployInfoIfy.form)) {
                const data = this.operDeployInfoIfy.form.getRawValue();
                const params = {
                    ...this.URLParams,
                    ...data,
                };
                this.service.updateBatch(params).subscribe(result => { });
            }
        },

        delete: row => {
            this.service.deleteSendUnit(row.id).subscribe(result => {
                const index = this.operDeployInfoIfy.unitList.findIndex(v => v.id === row.id);
                this.operDeployInfoIfy.unitList.splice(index, 1);
                this.operDeployInfoIfy.unitList = [...this.operDeployInfoIfy.unitList];
                this.operDeployInfoIfy._loadChartData();
            });
        },

        loadChart: data => {
            this.batchChart = Highcharts.chart('batchStatisticalChart', <any>{
                chart: {
                    type: 'column',
                },
                title: {
                    text: '',
                },
                // subtitle: {
                //     text: '数据来源: Wikipedia.org'
                // },
                xAxis: {
                    type: 'category',
                },
                yAxis: {
                    title: {
                        text: '个数',
                    },
                },
                tooltip: {
                    valueSuffix: '个',
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}',
                        },
                    },
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: -40,
                    y: 100,
                    floating: true,
                    borderWidth: 1,
                    // backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                    shadow: true,
                },
                credits: { enabled: false },
                series: [
                    {
                        name: '单位',
                        data,
                    },
                ],
            });

            setTimeout(() => {
                this.batchChart.reflow();
            }, 100);
        },
    };

    constructor(
        private clientService: ClientService,
        private service: TwoYearRiseService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService
    ) { }

    ngOnInit() {
        console.dir(this.router);
        this.loadRouterParams();
        this.loadBreadcrumbNav();
    }

    /**
     * 获得路由参数
     */
    private loadRouterParams() {
        // 获取路由参数
        this.activatedRoute.paramMap.subscribe(async (params: ParamMap) => {
            // 判断路由参数是否存在
            if (params.has('GL')) {
                this.URLParams = JSON.parse(Base64.decode(params.get('GL')));
                // 批次存在
                if (this.URLParams.batchId) {
                    this.operDeployInfoIfy._init();
                }
            }
        });
    }

    /**
     * 加载面包屑导航
     */
    loadBreadcrumbNav() {
        this.clientService.buildBreadCrumb([
            {
                type: 'home',
            },
            {
                type: 'event',
                text: '机关工勤两年晋档业务',
                event: () => {
                    this.router.navigate(['client/two-year-rise']);
                },
            },
            {
                type: 'text',
                text: '机关工勤两年晋档部署',
            },
        ]);
    }

    ngOnDestroy() {
        this.clientService.clearBreadCrumb();
    }

    /**
     * 选择发送对象
     */
    evtSelectUnitChange(nodeList) {
        const selectOrgParams = nodeList.map(({ origin }) => {
            return {
                includeChild: origin.includeChild,
                orgId: origin.DATA_UNIT_ORG_ID,
            };
        });
        const params = {
            batchId: this.URLParams.batchId,
            selectOrgParams,
            year: this.URLParams.year,
        };

        this.service.saveBatchOrg(params).subscribe(result => {
            // if (result.length > 0) {
            //     result.forEach(item => {
            //         this.operDeployInfoIfy.unitList.push(item);
            //     });
            //     this.operDeployInfoIfy.unitList = [...this.operDeployInfoIfy.unitList];
            //     this.operDeployInfoIfy._loadChartData();
            // }

            this.operDeployInfoIfy._loadUnitList();
            this.operDeployInfoIfy._loadChartData();
            this.selectUnitLevel.close();
        });
    }
}
