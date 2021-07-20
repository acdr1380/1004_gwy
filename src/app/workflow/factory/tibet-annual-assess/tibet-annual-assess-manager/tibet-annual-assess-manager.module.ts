import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DictionaryInputModule } from 'app/components/dictionary-input/dictionary-input.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LoadingModule } from 'app/components/loading/loading.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TibetAnnualAssessManagerComponent } from './tibet-annual-assess-manager.component';
import { TibetAnnualAssessListModule } from '../tibet-annual-assess-list/tibet-annual-assess-list.module';

const routes: Routes = [
    {
        path: '',
        component: TibetAnnualAssessManagerComponent,
    },
];

@NgModule({
    declarations: [TibetAnnualAssessManagerComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        DictionaryInputModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzButtonModule,
        NzSelectModule,
        NzDrawerModule,
        NzStepsModule,
        NzTimelineModule,

        TibetAnnualAssessListModule,
        LoadingModule,
    ],
    providers: [NzModalService]
})
export class TibetAnnualAssessManagerModule { }
