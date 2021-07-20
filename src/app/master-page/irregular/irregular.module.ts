import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IrregularComponent } from './irregular.component';
import { IrregularPageRoutingModule } from 'app/irregular-page/irregular-page-routing.module';

@NgModule({
    declarations: [IrregularComponent],
    imports: [CommonModule, IrregularPageRoutingModule],
})
export class IrregularModule {}
