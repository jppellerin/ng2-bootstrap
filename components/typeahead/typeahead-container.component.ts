import {Component, ElementRef, ViewEncapsulation} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
import {TypeaheadUtils} from './typeahead-utils';
import {TypeaheadDirective} from './typeahead.directive';
import {TypeaheadOptions} from './typeahead-options.class';
import {positionService} from '../position';
import {Ng2BootstrapConfig, Ng2BootstrapTheme} from '../ng2-bootstrap-config';
const TEMPLATE:any = {
  [Ng2BootstrapTheme.BS4]: `
  <div class="dropdown-menu"
       style="display: block"
      [ngStyle]="{top: top, left: left, display: display}"
      (mouseleave)="focusLost()">
      <a href="#"
         *ngFor="let match of matches"
         class="dropdown-item"
         (click)="selectMatch(match, $event)"
         (mouseenter)="selectActive(match)"
         [class.active]="isActive(match)"
         [innerHtml]="hightlight(match, query)"></a>
  </div>
  `,
  [Ng2BootstrapTheme.BS3]: `
  <ul class="dropdown-menu"
      style="display: block"
      [ngStyle]="{top: top, left: left, display: display}"
      (mouseleave)="focusLost()">
    <li *ngFor="let match of matches"
        [class.active]="isActive(match)"
        (mouseenter)="selectActive(match)">
        <a href="#" (click)="selectMatch(match, $event)" tabindex="-1" [innerHtml]="hightlight(match, query)"></a>
    </li>
  </ul>
  `
};
@Component({
  selector: 'typeahead-container',
  directives: [CORE_DIRECTIVES],
  template: TEMPLATE[Ng2BootstrapConfig.theme],
  encapsulation: ViewEncapsulation.None
})
export class TypeaheadContainerComponent {
  public parent:TypeaheadDirective;
  public query:any;
  public element:ElementRef;
  public isFocused:boolean = false;
  private _active:any;
  private _matches:Array<any> = [];
  private _field:string;
  private top:string;
  private left:string;
  private display:string;
  private placement:string;

  public constructor(element:ElementRef, options:TypeaheadOptions) {
    this.element = element;
    Object.assign(this, options);
  }

  public get matches():Array<string> {
    return this._matches;
  }

  public set matches(value:Array<string>) {
    this._matches = value;
    if (this._matches.length > 0) {
      this._active = this._matches[0];
    }
  }

  public set field(value:string) {
    this._field = value;
  }

  public position(hostEl:ElementRef):void {
    this.display = 'block';
    this.top = '0px';
    this.left = '0px';
    let p = positionService
      .positionElements(hostEl.nativeElement,
        this.element.nativeElement.children[0],
        this.placement, false);
    this.top = p.top + 'px';
    this.left = p.left + 'px';
  }

  public selectActiveMatch():void {
    this.selectMatch(this._active);
  }

  public prevActiveMatch():void {
    let index = this.matches.indexOf(this._active);
    this._active = this.matches[index - 1 < 0
      ? this.matches.length - 1
      : index - 1];
  }

  public nextActiveMatch():void {
    let index = this.matches.indexOf(this._active);
    this._active = this.matches[index + 1 > this.matches.length - 1
      ? 0
      : index + 1];
  }

  protected selectActive(value:any):void {
    this.isFocused = true;
    this._active = value;
  }

  protected hightlight(item:any, query:string):string {
    let itemStr:string = (typeof item === 'object' && this._field
      ? item[this._field]
      : item).toString();
    let itemStrHelper:string = (this.parent.typeaheadLatinize
      ? TypeaheadUtils.latinize(itemStr)
      : itemStr).toLowerCase();
    let startIdx:number;
    let tokenLen:number;
    // Replaces the capture string with the same string inside of a "strong" tag
    if (typeof query === 'object') {
      let queryLen:number = query.length;
      for (let i = 0; i < queryLen; i += 1) {
        // query[i] is already latinized and lower case
        startIdx = itemStrHelper.indexOf(query[i]);
        tokenLen = query[i].length;
        if (startIdx >= 0 && tokenLen > 0) {
          itemStr = itemStr.substring(0, startIdx) + '<strong>' + itemStr.substring(startIdx, startIdx + tokenLen) + '</strong>' + itemStr.substring(startIdx + tokenLen);
          itemStrHelper = itemStrHelper.substring(0, startIdx) + '        ' + ' '.repeat(tokenLen) + '         ' + itemStrHelper.substring(startIdx + tokenLen);
        }
      }
    } else if (query) {
      // query is already latinized and lower case
      startIdx = itemStrHelper.indexOf(query);
      tokenLen = query.length;
      if (startIdx >= 0 && tokenLen > 0) {
        itemStr = itemStr.substring(0, startIdx) + '<strong>' + itemStr.substring(startIdx, startIdx + tokenLen) + '</strong>' + itemStr.substring(startIdx + tokenLen);
      }
    }
    return itemStr;
  }

  protected focusLost():void {
    this.isFocused = false;
  }

  public isActive(value:any):boolean {
    return this._active === value;
  }

  private selectMatch(value:any, e:Event = void 0):boolean {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.parent.changeModel(value);
    this.parent.typeaheadOnSelect.emit({
      item: value
    });
    return false;
  }
}
