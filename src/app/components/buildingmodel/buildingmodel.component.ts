import { Component, OnInit, Input } from '@angular/core';
import { WindowObject } from 'src/app/models/windowobject';
import { Wall } from 'src/app/models/wall';
import { Door } from 'src/app/models/door';
import { Skylights } from 'src/app/models/skylights';
import { Roof } from 'src/app/models/roof';
import { Floors } from 'src/app/models/floors';
import { LocalStorage } from 'ngx-webstorage';
@Component({
  selector: 'app-buildingmodel',
  templateUrl: './buildingmodel.component.html',
  styleUrls: ['./buildingmodel.component.css']
})
export class BuildingmodelComponent implements OnInit {

  @Input() windowobjectlist: WindowObject[];
  @Input() wallobjectlist: Wall[];
  @Input() doorobjectlist: Door[];
  @Input() wallwindowdoorobject = {};
  @Input() roofskylightobject = {};
  @Input() floorsobject = {};
  @Input() skylightsobjectlist: Skylights[];
  @Input() roofobjectlist: Roof[];
  @Input() floorobjectlist: Floors[];
  @Input() wallwindowdoorobjectlist = [];
  @Input() roofskylightobjectlist = [];
  @Input() floormodelobjectlist = [];
  constructor() { }

  ngOnInit() {
  }

}
