import {
    Component,
    OnInit,
    forwardRef,
    AfterViewInit,
    Input,
    OnChanges,
    SimpleChanges,
    ChangeDetectorRef,
    Output,
    EventEmitter,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'dictionary-input',
    templateUrl: './dictionary-input.component.html',
    styleUrls: ['./dictionary-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DictionaryInputComponent),
            multi: true,
        },
    ],
})
export class DictionaryInputComponent
    implements ControlValueAccessor, OnChanges, OnInit, AfterViewInit {
    /**
     * 代码项
     */
    @Input() code: string;
    /**
     * 代码中文
     */
    _text: string = '';
    @Input()
    set text(value) {
        this._text = value || '';
    }
    get text() {
        return this._text;
    }
    @Output() textChange = new EventEmitter<any>();

    @Output() codeChange = new EventEmitter<any>();
    /**
     * 确认后事件
     */
    @Output() confirmChange = new EventEmitter<any>();

    /**
     * 是否只读
     */
    @Input()
    disabled = false;
    /**
     * 录入提示信息
     */
    @Input() placeholder = '请选择';
    /**
     * 过滤方式
     */
    @Input() filterWay = false; // true: 显示， false: 不显示
    /**
     * 过滤项
     */
    @Input() filterItems: string[] = [];
    /**
     * 自定义父节点
     */
    @Input() parent = '-1'; //

    // 定义ControlValueAccessor提供的事件回调
    value: string;
    onChange: (value: string | string[]) => void = () => null;
    onTouched: () => void = () => null;

    /**
     * 代码抽屉是否显示
     */
    visible = false;
    constructor(private cdr: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges) {}

    ngOnInit() {}

    ngAfterViewInit(): void {}

    writeValue(obj: any): void {
        // 代码特殊设置值 { text: '男', value: 1 }
        if (Object.prototype.toString.call(obj) === '[object Object]') {
            this.value = obj.value;
            this.text = obj.text;
            this.onChange(this.value);
            this.cdr.markForCheck();
        } else {
            this.value = obj;
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

    /**
     * 代码点击事件
     */
    dictionaryDrawerShow() {
        this.visible = true;
    }

    /**
     * 文本改变事件
     * @param event 代码中文
     */
    dictionaryTextChange(event) {
        this.text = event;
        this.textChange.emit(this.text);
        this.cdr.markForCheck();
    }

    /**
     * 代码选中事件
     * @param event 选中项
     */
    dictionaryValueChange(event) {
        this.value = event;
        this.codeChange.emit(this.value);
        this.onChange(this.value);
        this.cdr.markForCheck();
    }

    /**
     * 确认选择代码后事件
     */
    evtConfirmChange() {
        this.confirmChange.emit();
    }
}
