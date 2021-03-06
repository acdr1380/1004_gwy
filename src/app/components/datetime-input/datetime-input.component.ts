import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Input,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortalDirective } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'datetime-input',
    templateUrl: './datetime-input.component.html',
    styleUrls: ['./datetime-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatetimeInputComponent),
            multi: true,
        },
    ],
})
export class DatetimeInputComponent implements ControlValueAccessor, OnInit, AfterViewInit {
    @Input() disabled = false;
    @Input() placeholder = '请输入日期';

    @Input() width = 280;

    @ViewChild('datetimeInputElement') datetimeInputElement: ElementRef;
    @ViewChild('overlayConnectTemplate')
    overlayOriginTemplateDirective: TemplatePortalDirective;
    calendarOverlayRef: OverlayRef;

    rangesList = [
        { label: '一周前', date: moment().subtract(1, 'week').toDate() },
        { label: '一月前', date: moment().subtract(1, 'months').toDate() },
        { label: '一年前', date: moment().subtract(1, 'year').toDate() },
    ];

    // 定义ControlValueAccessor提供的事件回调
    value: string;
    onChange: (value: string | string[]) => void = () => null;
    onTouched: () => void = () => null;

    /**
     * 时间格式化
     */
    // tslint:disable-next-line:member-ordering
    private time$ = new Subject<string>();

    // tslint:disable-next-line:member-ordering
    date: Date;

    constructor(private cdr: ChangeDetectorRef, private overlay: Overlay) {}

    ngOnInit() {
        this.time$.pipe(debounceTime(800), distinctUntilChanged()).subscribe(value => {
            if (moment(value, 'YYYYMMDD').isValid()) {
                this.value = moment(value, 'YYYYMMDD').format('YYYY-MM-DD');
                this.onChange(this.value);
                this.cdr.detectChanges();
            }
        });
    }

    ngAfterViewInit(): void {}

    writeValue(value: any): void {
        if (moment(value, 'YYYYMMDD').isValid()) {
            this.value = moment(value, 'YYYYMMDD').format('YYYY-MM-DD');
        } else {
            this.value = null;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.placeholder = '';
        this.cdr.markForCheck();
    }

    keyUp(event) {
        event.target.value = event.target.value.replace(/[\u4E00-\u9FA5]/g, '');
    }

    blur(event) {
        this.calendarSelectChange(event.target.value);
    }

    /**
     * 格式化代码
     */
    formatDataTime(value) {
        if (value !== this.value) {
            this.time$.next(value);
        }
    }

    showCalendar() {
        const strategy = this.overlay
            .position()
            .flexibleConnectedTo(this.datetimeInputElement.nativeElement)
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetX: 0,
                    offsetY: 5,
                },
            ]);
        const config = new OverlayConfig({ positionStrategy: strategy });
        config.hasBackdrop = true;
        config.backdropClass = 'backdrop-with-out';
        this.calendarOverlayRef = this.overlay.create(config);
        this.calendarOverlayRef.backdropClick().subscribe(() => {
            this.calendarOverlayRef.dispose();
        });
        this.calendarOverlayRef.attach(this.overlayOriginTemplateDirective);
    }

    today() {
        this.calendarSelectChange(new Date(), true);
    }

    /**
     * 选中时间
     * @param event 时间
     */
    calendarSelectChange(value, isClose = false) {
        if (moment(value, 'YYYYMMDD').isValid()) {
            const v = moment(value, 'YYYYMMDD').format('YYYY-MM-DD');
            if (!this.value || new Date(v).getDate() !== new Date(this.value).getDate()) {
                isClose = true;
            }
            this.value = v;
        } else {
            this.value = '';
        }
        this.onChange(this.value);
        this.cdr.detectChanges();
        if (isClose) {
            this.calendarOverlayRef.dispose();
        }
    }
}
