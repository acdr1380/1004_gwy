import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'agent-manage',
                loadChildren: () =>
                    import('./agent-manage/agent-manage.module').then(m => m.AgentManageModule),
                data: { wfName: '经办人管理' },
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SystemSettingModule {}
