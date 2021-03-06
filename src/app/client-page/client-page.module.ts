import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from '../master-page/client/client.component';

const routes: Routes = [
    {
        path: '',
        component: ClientComponent,
        children: [
            {
                path: 'index',
                loadChildren: () => import('./index/index.module').then(m => m.IndexModule),
            },
            // 业务跳转
            {
                path: 'workflow',
                loadChildren: () =>
                    import('app/workflow/workflow.module').then(m => m.WorkflowModule),
            },
            {
                path: 'person-correl',
                loadChildren: () =>
                    import('./person-correl/person-correl.module').then(m => m.PersonCorrelModule),
                data: { tag: 'person-correl' },
            },
            // 事业工资人员管理
            {
                path: 'career-person-salary',
                loadChildren: () =>
                    import('./career-person-salary/career-person-salary.module').then(
                        m => m.CareerPersonSalaryModule
                    ),
                data: { tag: 'career-person-salary' },
            },
            {
                path: 'unit-manage',
                loadChildren: () =>
                    import('./unit-manage/unit-manage.module').then(m => m.UnitManageModule),
            },
            {
                path: 'civil-person-salary',
                loadChildren: () =>
                    import('./civil-person-salary/civil-person-salary.module').then(
                        m => m.CivilPersonSalaryModule
                    ),
                data: { tag: 'civil-person-salary' },
            },
            {
                path: 'notification',
                loadChildren: () =>
                    import('./notification/notification.module').then(m => m.NotificationModule),
            },
            // 新高级查询
            {
                path: 'advanced-query',
                loadChildren: () =>
                    import('./advanced-query/advanced-query.module').then(
                        m => m.AdvancedQueryModule
                    ),
            },
            // 政策查询
            {
                path: 'policy',
                loadChildren: () => import('./policy/policy.module').then(m => m.PolicyModule),
            },
            // 表册查询
            {
                path: 'lists-query',
                loadChildren: () =>
                    import('./lists-query/lists-query.module').then(m => m.ListsQueryModule),
            },
            // 系统设置
            {
                path: 'system-setting',
                loadChildren: () =>
                    import('./system-setting/system-setting.module').then(
                        m => m.SystemSettingModule
                    ),
            },
            // 台账查询
            {
                path: 'journal-query',
                loadChildren: () =>
                    import('./journal-query/journal-query.module').then(m => m.JournalQueryModule),
            },
            // 系统设置
            {
                path: 'system-setting',
                loadChildren: () =>
                    import('./system-setting/system-setting.module').then(
                        m => m.SystemSettingModule
                    ),
            },
            // 台账查询
            {
                path: 'journal-query',
                loadChildren: () =>
                    import('./journal-query/journal-query.module').then(m => m.JournalQueryModule),
            },
            // 高级查询
            {
                path: 'advanced-search',
                loadChildren: () =>
                    import('./advanced-search/advanced-search.module').then(
                        m => m.AdvancedSearchModule
                    ),
            },
            {
                path: 'special-recruitment',
                loadChildren: () =>
                    import('./special-recruitment/special-recruitment.module').then(
                        m => m.SpecialRecruitmentModule
                    ),
            },
            {
                path: 'starting-manage',
                loadChildren: () =>
                    import('./starting-manage/starting-manage.module').then(
                        m => m.StartingManageModule
                    ),
            },
            // 晋级晋档业务（公务员）
            {
                path: 'civil-level-rise',
                loadChildren: () =>
                    import('./civil-level-rise/civil-level-rise.module').then(
                        m => m.CivilLevelRiseModule
                    ),
            },
            // 薪级晋升
            {
                path: 'level-rise',
                loadChildren: () =>
                    import('./level-rise/level-rise.module').then(m => m.LevelRiseModule),
            },
            // 机关工勤两年晋档
            {
                path: 'two-year-rise',
                loadChildren: () =>
                    import('./two-year-rise/two-year-rise.module').then(m => m.TwoYearRiseModule),
            },
            {
                path: 'rank-management',
                loadChildren: () =>
                    import('./rank-management/rank-management.module').then(
                        m => m.RankManagementModule
                    ),
            },
            {
                path: 'salary-distribute',
                loadChildren: () =>
                    import('./salary-distribute/salary-distribute.module').then(
                        m => m.SalaryDistributeModule
                    ),
            },
            // 年度考核部署业务工作台
            {
                path: 'tibet-annual-assess',
                loadChildren: () =>
                    import('./tibet-annual-assess/tibet-annual-assess.module').then(
                        m => m.TibetAnnualAssessModule
                    ),
            },
            // 账本管理
            {
                path: 'ledger-manage',
                loadChildren: () =>
                    import('./ledger-manage/ledger-manage.module').then(m => m.LedgerManageModule),
            },
            // 工资测算
            {
                path: 'salary-calculate',
                loadChildren: () =>
                    import('./salary-calculate/salary-calculate.module').then(
                        m => m.SalaryCalculateModule
                    ),
            },
            // 年报管理
            {
                path: 'report-produce',
                loadChildren: () =>
                    import('./report-produce/report-produce.module').then(
                        m => m.ReportProduceModule
                    ),
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: [],
})
export class ClientPageModule {}
