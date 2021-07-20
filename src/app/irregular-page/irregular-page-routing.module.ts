import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IrregularComponent } from 'app/master-page/irregular/irregular.component';

const routes: Routes = [
    {
        path: '',
        component: IrregularComponent,
        // canActivateChild: [InitGuardService],
        children: [
            {
                path: 'oper-salary-info-page',
                loadChildren: () =>
                    import('./oper-salary-info-page/oper-salary-info-page.module').then(
                        m => m.OperSalaryInfoPageModule
                    ),
            },
            {
                path: 'form-page',
                loadChildren: () =>
                    import('./form-page/form-page.module').then(m => m.FormPageModule),
            },

            // 年报相关
            {
                path: 'report-common',
                loadChildren: () =>
                    import('./report-common/report-common.module').then(m => m.ReportCommonModule),
            },
            {
                path: 'report-verify',
                loadChildren: () =>
                    import('./report-verify/report-verify.module').then(m => m.ReportVerifyModule),
            },
            {
                path: 'report-reverse-query',
                loadChildren: () =>
                    import('./report-reverse-query/report-reverse-query.module').then(
                        m => m.ReportReverseQueryModule
                    ),
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class IrregularPageRoutingModule {}
