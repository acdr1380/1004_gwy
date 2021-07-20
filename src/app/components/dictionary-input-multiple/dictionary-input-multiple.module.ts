import { NzIconModule } from 'ng-zorro-antd/icon';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictionaryInputMultipleComponent } from './dictionary-input-multiple.component';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DictionaryInputMultipleDrawerComponent } from './dictionary-input-multiple-drawer/dictionary-input-multiple-drawer.component';

@NgModule({
    declarations: [DictionaryInputMultipleComponent, DictionaryInputMultipleDrawerComponent],
    imports: [
        CommonModule,
        FormsModule,
        ScrollingModule,
        NzDrawerModule,
        NzSelectModule,
        NzTabsModule,
        NzTreeModule,
        NzInputModule,
        NzButtonModule,
        NzIconModule,
    ],
    providers: [DictionaryInputMultipleComponent],
    exports: [DictionaryInputMultipleComponent, DictionaryInputMultipleDrawerComponent],
})
export class DictionaryInputMultipleModule {}
