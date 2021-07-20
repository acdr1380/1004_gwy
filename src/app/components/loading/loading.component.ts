import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { takeUntil } from 'rxjs/operators';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'gl-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit, AfterViewInit, OnDestroy {
    /**
     * 显示文字
     */
    @Input() message = '正在拼命加载…';

    @Output() readonly nzOnViewInit = new EventEmitter<void>();

    loadingType = {
        facebook: {
            index: 1,
            status: true,
        },
        spinner: {
            index: 2,
            status: false,
        },
        roller: {
            index: 3,
            status: false,
        },
        grid: {
            index: 4,
            status: false,
        },
        dualRing: {
            index: 5,
            status: false,
        },
        ring: {
            index: 6,
            status: false,
        },
        ellipsis: {
            index: 7,
            status: false,
        },
        ripple: {
            index: 8,
            status: false,
        },
        circle: {
            index: 9,
            status: false,
        },
        heart: {
            index: 10,
            status: false,
        },
        default: {
            index: 11,
            status: false,
        },
        hourglass: {
            index: 12,
            status: false,
        },
    };

    @ViewChild('loadingTemplate', { static: true }) loadingTemplate!: TemplateRef<void>;
    overlayRef?: OverlayRef | null;
    portal?: TemplatePortal;
    private destroy$ = new Subject<void>();

    constructor(private overlay: Overlay, private viewContainerRef: ViewContainerRef) {}

    ngOnInit() {
        const index = Math.floor(Math.random() * 12 + 1);
        for (const key in this.loadingType) {
            if (Object.prototype.hasOwnProperty.call(this.loadingType, key)) {
                const value = this.loadingType[key];
                value.status = value.index === index;
            }
        }
        this.attachOverlay();
    }

    ngAfterViewInit(): void {
        this.nzOnViewInit.emit();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private attachOverlay(): void {
        if (!this.overlayRef) {
            this.portal = new TemplatePortal(this.loadingTemplate, this.viewContainerRef);
            this.overlayRef = this.overlay.create(
                new OverlayConfig({
                    disposeOnNavigation: true,
                    positionStrategy: this.overlay.position().global(),
                    scrollStrategy: this.overlay.scrollStrategies.block(),
                })
            );
        }

        if (this.overlayRef && !this.overlayRef.hasAttached()) {
            this.overlayRef.attach(this.portal);
            this.overlayRef
                .detachments()
                .pipe(takeUntil(this.destroy$))
                .subscribe(() => {
                    this.close();
                });
        }
    }

    show() {
        this.attachOverlay();
    }

    close() {
        this.overlayRef.dispose();
        this.overlayRef = null;
    }
}
