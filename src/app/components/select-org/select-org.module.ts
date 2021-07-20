import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectOrgComponent } from './select-org.component';
import { SelectOrgDrawerComponent } from './select-org-drawer/select-org-drawer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@NgModule({
    declarations: [SelectOrgComponent, SelectOrgDrawerComponent],
    imports: [
        CommonModule,
        NzButtonModule,
        NzTreeModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule,
        NzDrawerModule,
        NzSelectModule,
        NzFormModule,
        NzCheckboxModule,
    ],
    exports: [SelectOrgComponent, SelectOrgDrawerComponent],
})
export class SelectOrgModule {}
