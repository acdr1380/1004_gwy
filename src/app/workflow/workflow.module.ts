import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes = [
    {
        path: '',
        children: [
            {
                path: 'factory',
                loadChildren: () => import('./factory/factory.module').then(m => m.FactoryModule),
            },
        ],
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
})
export class WorkflowModule {}
