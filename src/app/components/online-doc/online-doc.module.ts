import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { OnlineDocComponent } from './online-doc.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
    declarations: [OnlineDocComponent],
    imports: [CommonModule, PortalModule, OverlayModule, DragDropModule, NzToolTipModule],
    exports: [OnlineDocComponent],
})
export class OnlineDocModule {}
