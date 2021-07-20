import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { environment } from 'environments/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
    selector: 'gl-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
    @ViewChild('noticeTemp', { static: false }) noticeTemp?: TemplateRef<{}>;
    v1;
    constructor(private notification: NzNotificationService, private http: HttpClient) {}

    createBasicNotification(): void {
        this.notification.remove();
        this.notification.template(this.noticeTemp, { nzDuration: 0 });
    }

    ngOnInit() {
        this.v1 = environment.version;
    }

    ngAfterViewInit() {
        setInterval(() => {
            this.getSettingVersion();
        }, 1000 * 60 * 5);
        this.getSettingVersion();
    }

    getSettingVersion() {
        this.http.get<any>('assets/web.version.json').subscribe(json => {
            const v2 = json.version;
            if (this.v1 !== v2) {
                this.createBasicNotification();
            }
        });
    }

    updateWebapp() {
        window.location.reload(true);
    }
}
