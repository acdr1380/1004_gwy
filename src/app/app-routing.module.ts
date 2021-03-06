import { IrregularModule } from './master-page/irregular/irregular.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/login' },
    {
        path: 'login',
        loadChildren: () => import('./master-page/login/login.module').then(m => m.LoginModule),
    },
    {
        path: 'client',
        loadChildren: () => import('./master-page/client/client.module').then(m => m.ClientModule),
    },
    {
        path: 'irregular',
        loadChildren: () =>
            import('./master-page/irregular/irregular.module').then(m => m.IrregularModule),
    },
    {
        path: 'portal',
        loadChildren: () => import('./master-page/portal/portal.module').then(m => m.PortalModule),
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
