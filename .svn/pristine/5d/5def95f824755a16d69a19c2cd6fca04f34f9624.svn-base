import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PolicyQueryService } from './policy-query.service';

import { PolicyQueryComponent } from './policy-query.component';
import { HistoryComponent } from './history/history.component';
import { ResultComponent } from './result/result.component';
import { DocumentComponent } from './document/document.component';
import { NotesComponent } from './notes/notes.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
const router: Routes = [
    {
        path: '',
        component: PolicyQueryComponent,
        children: [
            { path: '', redirectTo: 'history', pathMatch: 'full' },
            {
                path: 'history',
                component: HistoryComponent,
            },
            {
                path: 'result',
                component: ResultComponent,
            },
        ],
    },
    {
        path: 'document',
        component: DocumentComponent,
    },
    {
        path: 'notes',
        component: NotesComponent,
    },
    {
        path: 'favorites',
        component: FavoritesComponent,
    },
];

@NgModule({
    declarations: [
        PolicyQueryComponent,
        HistoryComponent,
        ResultComponent,
        DocumentComponent,
        NotesComponent,
        FavoritesComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(router),
        NzSelectModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzTreeModule,
        NzFormModule,
        NzDrawerModule,
        NzButtonModule,
        NzAlertModule,
        NzUploadModule,
        NzTabsModule,
        NzTableModule,
        NzDividerModule,
        NzPaginationModule,
        NzCardModule,
        NzEmptyModule,
        NzInputModule,
        NzModalModule,
        NzIconModule,
        NzDropDownModule,
    ],
    providers: [PolicyQueryService],
})
export class PolicyQueryModule {}
