import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoginService } from './login.service';
import { AppConfig } from 'app/app.config';
import { environment } from 'environments/environment';

@Component({
    selector: 'gl-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit {
    protected appSettings = AppConfig.settings;
    btnLoading = false;
    projectName = '';
    validateForm: FormGroup;
    version;
    isPasswordEye = false;
    private clicks = new Subject<any>();
    private subscription: Subscription;

    constructor(
        private router: Router,
        private title: Title,
        private fb: FormBuilder,
        private service: LoginService
    ) {}

    ngAfterViewInit(): void {}

    ngOnInit() {
        this.subscription = this.clicks.pipe(debounceTime(300)).subscribe(() => {
            // tslint:disable-next-line:forin
            for (const i in this.validateForm.controls) {
                this.validateForm.controls[i].markAsDirty();
                this.validateForm.controls[i].updateValueAndValidity();
            }
            if (this.validateForm.status !== 'VALID') {
                return;
            }

            this.btnLoading = true;
            this.service.attemptAuth(this.validateForm.getRawValue()).subscribe(isSucceed => {
                this.btnLoading = false;
                if (isSucceed) {
                    this.router.navigate(['/client']);
                    // this.router.navigate(['/portal']);
                }
            });
        });
        this.version = `版本号：${environment.version}，发布日期：${environment.description}`;
        this.projectName = this.appSettings.appInsights.PROJECT_NAME;
        this.title.setTitle(this.projectName);
        this.validateForm = this.fb.group({
            userAccount: [null, [Validators.required]],
            password: [null, [Validators.required]],
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    submitForm(): void {
        this.clicks.next();
    }
}
