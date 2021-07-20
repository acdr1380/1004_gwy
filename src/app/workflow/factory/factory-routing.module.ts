import { SalaryInitializeModule } from './salary-initialize/salaryl-initialize.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            // 公务员工资
            {
                path: 'salary_civil_post_change',
                loadChildren: () =>
                    import('./salary-civil-post-change/salary-civil-post-change.module').then(
                        m => m.SalaryCivilPostChangeModule
                    ),
                data: { wfName: '岗位变动工资业务（公务员）' },
            },
            {
                path: 'salary_civil_inner_transfer',
                loadChildren: () =>
                    import('./salary-civli-inner-transfer/salary-civli-inner-transfer.module').then(
                        m => m.SalaryCivliInnerTransferModule
                    ),
                data: { wfName: '新进人员工资业务（公务员）' },
            },
            {
                path: 'salary_civil_define_level',
                loadChildren: () =>
                    import('./salary-civil-define-level/salary-civil-define-level.module').then(
                        m => m.SalaryCivilDefineLevelModule
                    ),
                data: { wfName: '转正定级工资业务（公务员）' },
            },
            {
                path: 'salary_civil_death',
                loadChildren: () =>
                    import('./salary-civil-death/salary-civil-death.module').then(
                        m => m.SalaryCivilDeathModule
                    ),
                data: { wfName: '死亡工资业务（公务员）' },
            },
            {
                path: 'salary_civil_other_reduce',
                loadChildren: () =>
                    import('./salary-civil-other-reduce/salary-civil-other-reduce.module').then(
                        m => m.SalaryCivilOtherReduceModule
                    ),
                data: { wfName: '其他减员业务（公务员）' },
            },
            {
                path: 'salary_civil_allowance_change',
                loadChildren: () =>
                    import(
                        './salary-civil-allowance-change/salary-civil-allowance-change.module'
                    ).then(m => m.SalaryCivilAllowanceChangeModule),
                data: { wfName: '津补贴业务（公务员）' },
            },
            {
                path: 'salary_civil_retire',
                loadChildren: () =>
                    import('./salary-civil-retire/salary-civil-retire.module').then(
                        m => m.SalaryCivilRetireModule
                    ),
                data: { wfName: '退休工资业务（公务员）' },
            },
            {
                path: 'salary_civil_punishment_reduce',
                loadChildren: () =>
                    import(
                        './salary-civil-punishment-reduce/salary-civil-punishment-reduce.module'
                    ).then(m => m.SalaryCivilPunishmentReduceModule),
                data: { wfName: '处分减资业务（公务员）' },
            },
            //事业业务
            {
                path: 'salary_post_change',
                loadChildren: () =>
                    import('./salary-post-change/salary-post-change.module').then(
                        m => m.SalaryPostChangeModule
                    ),
                data: { wfName: '岗位变动工资业务' },
            },
            {
                path: 'salary_define_level',
                loadChildren: () =>
                    import('./salary-define-level/salary-define-level.module').then(
                        m => m.SalaryDefineLevelModule
                    ),
                data: { wfName: '转正定级工资业务' },
            },
            {
                path: 'salary_education_change',
                loadChildren: () =>
                    import('./salary-education-change/salary-education-change.module').then(
                        m => m.SalaryEducationChangeModule
                    ),
                data: { wfName: '学历变动工资业务' },
            },
            {
                path: 'salary_rank_rise',
                loadChildren: () =>
                    import('./salary-rank-rise/salary-rank-rise.module').then(
                        m => m.SalaryRankRiseModule
                    ),
                data: { wfName: '考工晋级工资业务' },
            },
            {
                path: 'salary_high_low',
                loadChildren: () =>
                    import('./salary-high-low/salary-high-low.module').then(
                        m => m.SalaryHighLowModule
                    ),
                data: { wfName: '高低定工资业务' },
            },
            {
                path: 'salary_standing_change',
                loadChildren: () =>
                    import('./salary-standing-change/salary-standing-change.module').then(
                        m => m.SalaryStandingChangeModule
                    ),
                data: { wfName: '工龄调整工资业务' },
            },
            {
                path: 'salary_punishment_reduce',
                loadChildren: () =>
                    import('./salary-punishment-reduce/salary-punishment-reduce.module').then(
                        m => m.SalaryPunishmentReduceModule
                    ),
                data: { wfName: '处分减资工资业务' },
            },
            {
                path: 'salary_floating_change',
                loadChildren: () =>
                    import('./salary-floating-change/salary-floating-change.module').then(
                        m => m.SalaryFloatingChangeModule
                    ),
                data: { wfName: '浮动转固定工资业务' },
            },
            {
                path: 'salary_retire',
                loadChildren: () =>
                    import('./salary-retire/salary-retire.module').then(m => m.SalaryRetireModule),
                data: { wfName: '退休工资业务' },
            },
            {
                path: 'salary_inner_transfer',
                loadChildren: () =>
                    import('./salary-inner-transfer/salary-inner-transfer.module').then(
                        m => m.SalaryInnerTransferModule
                    ),
                data: { wfName: '新进工资业务' },
            },
            {
                path: 'salary_death',
                loadChildren: () =>
                    import('./salary-death/salary-death.module').then(m => m.SalaryDeathModule),
                data: { wfName: '死亡工资业务' },
            },
            {
                path: 'salary_other_reduce',
                loadChildren: () =>
                    import('./salary-other-reduce/salary-other-reduce.module').then(
                        m => m.SalaryOtherReduceModule
                    ),
                data: { wfName: '其他减员业务' },
            },
            {
                path: 'salary_allowance_change',
                loadChildren: () =>
                    import('./salary-allowance-change/salary-allowance-change.module').then(
                        m => m.SalaryAllowanceChangeModule
                    ),
                data: { wfName: '津补贴变动工资业务(事业)' },
            },
            {
                path: 'salary_level_rise',
                loadChildren: () =>
                    import('./salary-level-rise/salary-level-rise.module').then(
                        m => m.SalaryLevelRiseModule
                    ),
                data: { wfName: '薪级晋档' },
            },
            {
                path: 'salary_civil_standing_change',
                loadChildren: () =>
                    import(
                        './salary-civil-standing-change/salary-civil-standing-change.module'
                    ).then(m => m.SalaryCivilStandingChangeModule),
                data: { wfName: '公务员工龄调整工资业务' },
            },
            {
                path: 'salary_civil_education_change',
                loadChildren: () =>
                    import(
                        './salary-civil-education-change/salary-civil-education-change.module'
                    ).then(m => m.SalaryCivilEducationChangeModule),
                data: { wfName: '学历变动工资业务（公务员）' },
            },
            {
                path: 'salary_civil_high_low',
                loadChildren: () =>
                    import('./salary-civil-high-low/salary-civil-high-low.module').then(
                        m => m.SalaryCivilHighLowModule
                    ),
                data: { wfName: '高低定工资业务（公务员）' },
            },
            {
                path: 'tibet_person_initialize',
                loadChildren: () =>
                    import('./tibet-person-initialize/tibet-person-initialize.module').then(
                        m => m.TibetPersonInitializeModule
                    ),
                data: { wfName: '人员初始化' },
            },
            {
                path: 'tibet_person_register',
                loadChildren: () =>
                    import('./tibet-person-register/tibet-person-register.module').then(
                        m => m.TibetPersonRegisterModule
                    ),
                data: { wfName: '公务员登记业务' },
            },
            {
                path: 'tibet_person_quit',
                loadChildren: () =>
                    import('./tibet-person-quit/tibet-person-quit.module').then(
                        m => m.TibetPersonQuitModule
                    ),
                data: { wfName: '公务员退出业务' },
            },
            {
                path: 'salary_civil_level_rise',
                loadChildren: () =>
                    import('./salary-civil-level-rise/salary-civil-level-rise.module').then(
                        m => m.SalaryCivilLevelRiseModule
                    ),
                data: { wfName: '晋级晋档业务（公务员）' },
            },
            {
                path: 'salary_two_year_rise',
                loadChildren: () =>
                    import('./salary-two-year-rise/salary-two-year-rise.module').then(
                        m => m.SalaryTwoYearRiseModule
                    ),
                data: { wfName: '机关工勤两年晋档' },
            },
            {
                path: 'tibet_plan_apply',
                loadChildren: () =>
                    import('./tibet-plan-apply/tibet-plan-apply.module').then(
                        m => m.TibetPlanApplyModule
                    ),
                data: { wfName: '公招计划申请流程' },
            },
            {
                path: 'tibet_exam_record',
                loadChildren: () =>
                    import('./tibet-exam-record/tibet-exam-record.module').then(
                        m => m.TibetExamRecordModule
                    ),
                data: { wfName: '考录备案业务' },
            },
            {
                path: 'salary_civil_sick_leave',
                loadChildren: () =>
                    import('./salary-civil-sick-leave/salary-civil-sick-leave.module').then(
                        m => m.SalaryCivilSickLeaveModule
                    ),
                data: { wfName: '长期病假业务（公务员）' },
            },
            {
                path: 'salary_sick_leave',
                loadChildren: () =>
                    import('./salary-sick-leave/salary-sick-leave.module').then(
                        m => m.SalarySickLeaveModule
                    ),
                data: { wfName: '长期病假业务' },
            },
            {
                path: 'tibet_person_enter',
                loadChildren: () =>
                    import('./tibet-person-enter/tibet-person-enter.module').then(
                        m => m.TibetPersonEnterModule
                    ),
                data: { wfName: '人员新进' },
            },
            {
                path: 'tibet_person_edit',
                loadChildren: () =>
                    import('./tibet-person-edit/tibet-person-edit.module').then(
                        m => m.TibetPersonEditModule
                    ),
                data: { wfName: '公务员信息变更流程' },
            },
            {
                path: 'tibet_annual_assess',
                loadChildren: () =>
                    import('./tibet-annual-assess/tibet-annual-assess.module').then(
                        m => m.TibetAnnualAssessModule
                    ),
                data: { wfName: '年度考核业务' },
            },
            {
                path: 'tibet_level_rise',
                loadChildren: () =>
                    import('./tibet-level-rise/tibet-level-rise.module').then(
                        m => m.TibetLevelRiseModule
                    ),
            },
            {
                path: 'salary_initialize',
                loadChildren: () =>
                    import('./salary-initialize/salaryl-initialize.module').then(
                        m => m.SalaryInitializeModule
                    ),
            },
            {
                path: 'salary_civil_initialize',
                loadChildren: () =>
                    import('./salary-civil-initialize/salary-civil-initialize.module').then(
                        m => m.SalaryCivilInitializeModule
                    ),
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class FactoryRoutingModule {}
