import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictionaryInputComponent } from './dictionary-input.component';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DictionaryDrawerComponent } from './dictionary-drawer/dictionary-drawer.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

@NgModule({
    declarations: [DictionaryInputComponent, DictionaryDrawerComponent],
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
    ],
    providers: [DictionaryInputComponent],
    exports: [DictionaryInputComponent, DictionaryDrawerComponent],
})
export class DictionaryInputModule { }
