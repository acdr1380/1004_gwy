import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatetimeInputComponent } from './datetime-input.component';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { NzButtonModule } from 'ng-zorro-antd/button';

@NgModule({
    declarations: [DatetimeInputComponent],
    imports: [
        CommonModule,
        FormsModule,
        NzInputModule,
        NzIconModule,
        NzCalendarModule,
        PortalModule,
        OverlayModule,
        NzButtonModule,
    ],
    exports: [DatetimeInputComponent],
})
export class DatetimeInputModule {}
