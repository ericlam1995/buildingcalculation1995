import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Roof } from 'src/app/models/roof';
import { LoginserviceService } from 'src/app/service/loginservice.service';
import { BuildingmodelService } from 'src/app/service/buildingmodel.service';
import { DesignService } from 'src/app/service/design.service';
import { Design } from 'src/app/models/design';
import { ToastrService } from 'ngx-toastr';
import { Register } from 'src/app/models/register';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ProjectService } from 'src/app/service/project.service';
import { Project } from 'src/app/models/project';


@Component({
  selector: 'app-ehc1heatingenergy',
  templateUrl: './ehc1heatingenergy.component.html',
  styleUrls: ['./ehc1heatingenergy.component.css']
})
export class Ehc1heatingenergyComponent implements OnInit {

  @ViewChild('content', { static: true }) content: ElementRef;
  projectid: string = "";
  designid: string = "";

  location = "";
  targeting = "";
  climatezone = "";
  targetingschedule: any = null;

  schedulemethod = [];

  wallwindowdoormodellist = [];
  roofskylightmodellist = [];
  floormodellist = []

  designobject: Design;
  projectobject: Project;

  roofrvalue: number = 0;
  wallrvalue: number = 0;
  windowrvalue: number = 0;
  floorrvalue: number = 0;
  skylightrvalue: number = 0;
  windowrvaluemore30: number = 0;

  totalarearoof: number = 0;
  totalnetarearoof: number = 0;
  totalareaskylight: number = 0;
  totalareawall: number = 0;
  totalareawindow: number = 0;
  totalareawindowless30: number = 0;
  totalareawindowmore30: number = 0;
  totalareafloor: number = 0;
  totalareadoor: number = 0;
  totalareaafterwindow: number = 0;
  totalwallarealeft: number = 0;

  maxdoorareaallow: number = 0;

  minrvaluewall: number = 0;
  minrvalueroof: number = 0;
  minrvaluewindow: number = 0;
  minrvaluefloor: number = 0;
  minrvalueskylight: number = 0;

  totalheatlosswall: number = 0;
  totalheatlosswindow: number = 0;
  totalheatlossdoor: number = 0;
  totalheatlossroof: number = 0;
  totalheatlossskylight: number = 0;
  totalheatlossfloor: number = 0;
  doorheatlost: number = 0;
  totalproposed: number = 0;

  skylightrvaluecondition: number = 0;
  windowrvaluecondition: number = 0;
  wallrvaluecondition: number = 0;

  totalheatlosswindowless30: number = 0;
  totalheatlosswindowmore30: number = 0;

  totalschedule: number = 0;

  wallbalancecheck_proposed: number = 0;
  wallbalancecheck_reference: number = 0;

  totalwallnorth: number = 0;
  totalwallsouth: number = 0;
  totalwalleast: number = 0;
  totalwallwest: number = 0;

  totalwindownorth: number = 0;
  totalwindowsouth: number = 0;
  totalwindoweast: number = 0;
  totalwindowwest: number = 0;

  rooflist: Array<any> = [];
  skylightlist: Array<any> = [];
  walllist: Array<any> = [];
  floorlist: Array<any> = [];
  windowlist: Array<any> = [];
  doorlist: Array<any> = [];

  isroofpass: boolean = false;
  iswallpass: boolean = false;
  isskylightpass: boolean = false;
  isfloorpass: boolean = false;
  iswindowpass: boolean = false;

  islessthan30window: boolean = false;
  iswallwesteatsouthlessthan30: boolean = false;
  isskylightarealessthen1point5: boolean = false;
  isachievedallrequire: boolean = false;

  isech1pass: boolean = false;

  isroofpasslist: Array<boolean> = [];
  iswallpasslist: Array<boolean> = [];
  isskylightpasslist: Array<boolean> = [];
  isfloorpasslist: Array<boolean> = [];
  iswindowpasslist: Array<boolean> = [];

  numberpoint: number = 0;

  walldistinct = [];
  roofdistinct = [];
  skylightdistinct = [];
  floordistinct = [];
  windowdistinct = [];
  doordistinct = [];
  doornamelist = [];
  registeruser: Register;

  currentroute: string = "";

  constructor(public route: ActivatedRoute,
    private router: Router, private loginservice: LoginserviceService,
    private buildingmodelservice: BuildingmodelService, private designservice: DesignService,
    private toastr: ToastrService, private projectservice: ProjectService) {
    let loginapp = JSON.parse(localStorage.getItem('currentUser'));
    this.loginservice.currentUser.subscribe(x => {
      if (x === null) {
        this.registeruser = loginapp;
      } else {
        this.registeruser = x;
      }

    });
    this.route.queryParams.subscribe(params => {
      this.projectid = params['projectid'];
      this.designid = params['designid'];
    });
    this.currentroute = this.route.snapshot.url[0].path;
    console.log(this.route.snapshot.url[0].path);
  }

  ngOnInit() {
    this.setdefault();
    this.featchingmodel();

  }

  setdefault() {
    this.designobject = {
      DesignID: "",
      DesignName: "",
      TargetRating: null,
      CompletedBy: "",
      DrawingSet: "",
      Typology: "",
      DateCreated: null,
      ProjectID: "",
      UserID: "",
      Climatetype: "",
      City: "",
      StreetName: "",
      DateUpdate: "",
      Postcode: "",
      FloorArea: null
    };
    this.projectobject = {
      ProjectID: "",
      ProjectName: "",
      DateCreated: "",
      DateModified: "",
      UserID: ""
    };
  }

  featchingmodel() {

    this.projectservice.getprojectid(this.projectid).subscribe(x => {
      this.projectobject = {
        ProjectID: x.id,
        ProjectName: x.data.ProjectName,
        DateCreated: x.data.DateCreated,
        DateModified: x.data.DateModified,
        UserID: x.data.UserID
      }
    });
    this.designservice.getdesignbyID(this.designid).subscribe(res => {
      //console.log(res);
      this.designobject = {
        DesignID: res.id,
        DesignName: res.data.DesignName,
        TargetRating: res.data.TargetRating,
        CompletedBy: res.data.CompletedBy,
        DrawingSet: res.data.DrawingSet,
        Typology: res.data.Typology, DateCreated: res.data.DateCreated,
        ProjectID: res.data.ProjectID,
        UserID: res.data.UserID,
        Climatetype: res.data.Climatetype,
        City: res.data.City,
        StreetName: res.data.StreetName,
        DateUpdate: res.data.DateUpdate,
        Postcode: res.data.Postcode,
        FloorArea: res.data.FloorArea
      };
      this.location = this.designobject.StreetName + ", " + this.designobject.City + ", " + this.designobject.Postcode;
      this.targeting = this.designobject.TargetRating.HomeStar;
      this.climatezone = this.designobject.Climatetype;
      this.targetingschedule = this.designobject.TargetRating.ClimateZoneList.find(x => x.ClimateZone === this.climatezone);
      this.schedulemethod = this.designobject.TargetRating.ClimateZoneList;
      this.skylightrvalue = this.targetingschedule.ConstructionRValue.Skylights;
      this.roofrvalue = this.targetingschedule.ConstructionRValue.Roof;
      this.wallrvalue = this.targetingschedule.ConstructionRValue.Wall;
      this.floorrvalue = this.targetingschedule.ConstructionRValue.Floor;
      this.windowrvalue = this.targetingschedule.ConstructionRValue.Window;
      //console.log(this.targetingschedule);
    }, err => {
      this.toastr.error("Something wrong!", "Error Message");
    });


    this.startcalculate();
  }

  startcalculate() {
    this.buildingmodelservice.fetchwallwindowdoormodel(this.designid).subscribe(res => {
      this.wallwindowdoormodellist = res;
      this.walldistinct = Array.from(new Set(this.wallwindowdoormodellist.map((x: any) => x.data.Wall.WallName)));
      this.walldistinct.sort();
      let allwindowlist = [];
      for (let i of this.wallwindowdoormodellist) {

        //console.log(i.data.Window);
        if (i.data.Window.length > 0) {
          for (let a of i.data.Window) {
            allwindowlist.push(a);
          }
        }

      }
      this.windowdistinct = Array.from(new Set(allwindowlist.map(x =>
        x.WindowName
      )));
      this.windowdistinct.sort();

      for (let i of this.wallwindowdoormodellist) {
        if (i.data.Door.length !== 0) {
          i.data.Door.forEach(e => {
            this.doornamelist.push(e.DoorName);
          });
        }
      }
      this.doordistinct = Array.from(new Set(this.doornamelist.map((x: any) =>
        x
      )));

      for (let i of this.wallwindowdoormodellist) {
        if (i.data.Orientation === "North") {
          this.totalwallnorth += Number(Number(i.data.Wall.Area).toFixed(2));
          if (i.data.Window.length > 0) {
            for (let y of i.data.Window) {
              this.totalwindownorth += Number(Number(y.Area).toFixed(2));
            }
          }

        }

        if (i.data.Orientation === "South") {
          this.totalwallsouth += Number(Number(i.data.Wall.Area).toFixed(2));
          if (i.data.Window.length > 0) {
            for (let y of i.data.Window) {
              this.totalwindowsouth += Number(Number(y.Area).toFixed(2));
            }
          }
        }

        if (i.data.Orientation === "East") {
          this.totalwalleast += Number(Number(i.data.Wall.Area).toFixed(2));
          if (i.data.Window.length > 0) {
            for (let y of i.data.Window) {
              this.totalwindoweast += Number(Number(y.Area).toFixed(2));
            }
          }
        }
        if (i.data.Orientation === "West") {
          this.totalwallwest += Number(Number(i.data.Wall.Area).toFixed(2));
          if (i.data.Window.length > 0) {
            for (let y of i.data.Window) {
              this.totalwindowwest += Number(Number(y.Area).toFixed(2));
            }
          }
        }
      }
      for (let x of this.walldistinct) {
        let object = { wallname: x, numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0, orientation: "" };
        let totalwindow = 0, totaldoor = 0, netwallarea = 0;
        for (let i of this.wallwindowdoormodellist) {
          if (i.data.Wall.WallName === x) {
            object.numinclusion++;
            if (i.data.Window.length !== 0) {
              for (let y of i.data.Window) {
                totalwindow += Number(Number(y.Area).toFixed(2));
              }
            }

            if (i.data.Door.length !== 0) {
              i.data.Door.forEach(e => {
                totaldoor += Number(Number(e.Area).toFixed(2));
              });

            } else {

              totaldoor = 0;

            }



            netwallarea = Number(i.data.Wall.Area) - (totalwindow + totaldoor);
            object.totalarea += Number(netwallarea);
            object.totalrvalue = Number(i.data.Wall.ConstructionRValue);

            object.orientation = i.data.Wall.Orientation;
          }
          object.totalheatloss = Number(Number(Number(object.totalarea) / Number(object.totalrvalue)).toFixed(2));
          totaldoor = 0;
          totalwindow = 0;
          netwallarea = 0;
          //object.totalarea = object.totalarea - (totalwindow + totaldoor);
        }
        this.walllist.push(object);
        object = { wallname: "", numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0, orientation: "" };
      }
      console.log(this.walllist);

      for (let i of this.doordistinct) {
        let object = { doorname: i, numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0 };
        for (let x of this.wallwindowdoormodellist) {
          if (x.data.Door.length !== 0) {
            x.data.Door.forEach(e => {
              if (e.DoorName === i) {
                object.numinclusion++;
                object.totalarea += Number(Number(e.Area).toFixed(2));
                object.totalrvalue = Number(Number(e.ConstructionRValue).toFixed(2));
              }

            });
            //object.totalheatloss += Number(x.data.Door.Area) / Number(x.data.Door.ConstructionRValue);
          }


        }
        object.totalheatloss = Number((object.totalarea / object.totalrvalue).toFixed(2));
        this.doorlist.push(object);
        object = { doorname: "", numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0 };
      }


      for (let i of this.windowdistinct) {
        let object = { windowname: i, numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0, owa: 0 };
        for (let x of this.wallwindowdoormodellist) {
          for (let e of x.data.Window) {
            if (e.WindowName === i) {
              object.numinclusion++;
              object.totalarea += Number(Number(e.Area).toFixed(2));
              object.totalrvalue = Number(e.ConstructionRValue);

              object.owa = Number(e.OWA);
            }
          }
          object.totalheatloss = Number(Number(object.totalarea / object.totalrvalue).toFixed(2));
        }

        this.windowlist.push(object);
        object = { windowname: "", numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0, owa: 0 };
      }
    });


    this.buildingmodelservice.fetchroofskylightmodelGet(this.designid).subscribe(res => {
      this.roofskylightmodellist = res;
      this.roofdistinct = Array.from(new Set(this.roofskylightmodellist.map((x: any) => x.data.Roof.RoofName)));

      let allskylightlist = [];
      for (let i of this.roofskylightmodellist) {
        if (i.data.Skylight.length !== 0) {
          for (let a of i.data.Skylight) {
            allskylightlist.push(a);
          }
        }
      }

      this.skylightdistinct = Array.from(new Set(allskylightlist.map((x: any) =>
        x.SkylightsName
      )));
      for (let i of this.roofdistinct) {
        let object = { roofname: i, numinclusion: 0, totalarea: 0, totalnetarea: 0, totalrvalue: 0, totalheatloss: 0 };
        let totalskylightarea = 0, netroofarea = 0;
        for (let x of this.roofskylightmodellist) {
          if (x.data.Roof.RoofName === i) {
            object.numinclusion++;
            if (x.data.Skylight.length !== 0) {
              for (let a of x.data.Skylight) {
                totalskylightarea += Number(Number(a.Area).toFixed(2));
              }
            }
            netroofarea = Number(x.data.Roof.ExposedArea) - totalskylightarea;
            object.totalnetarea = netroofarea;
            object.totalarea += Number(x.data.Roof.ExposedArea);
            object.totalrvalue = Number(x.data.Roof.ConstructionRValue);
            //object.totalheatloss += Number(x.data.Roof.ExposedArea) / Number(x.data.Roof.ConstructionRValue);
          }
          object.totalheatloss = Number(Number(object.totalnetarea / object.totalrvalue).toFixed(2));
          totalskylightarea = 0, netroofarea = 0;
        }
        this.rooflist.push(object);
        object = { roofname: "", numinclusion: 0, totalarea: 0, totalnetarea: 0, totalrvalue: 0, totalheatloss: 0 };
      }



      for (let i of this.skylightdistinct) {
        let object = { skylightname: i, numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0 };
        for (let x of this.roofskylightmodellist) {
          for (let e of x.data.Skylight) {
            if (e.SkylightsName === i) {
              object.numinclusion++;
              object.totalarea += Number(e.Area);
              object.totalrvalue = Number(e.ConstructionRValue);
              object.totalheatloss += Number(Number(e.Area / e.ConstructionRValue).toFixed(2));
            }
          }
        }
        this.skylightlist.push(object);
        object = { skylightname: "", numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0 };
      }

    });

    this.buildingmodelservice.fetchfloormodel(this.designid).subscribe(res => {
      this.floormodellist = res;
      this.floordistinct = Array.from(new Set(this.floormodellist.map((x: any) => x.data.Floor.FloorName)));
      for (let x of this.floordistinct) {
        let object = { floorname: x, numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0 };
        for (let i of this.floormodellist) {
          if (i.data.Floor.FloorName === x) {
            object.numinclusion++;
            object.totalarea += Number(i.data.Floor.ExposedArea);
            object.totalrvalue = Number(i.data.Floor.ConstructionRValue);
            object.totalheatloss += Number(Number(i.data.Floor.ExposedArea / i.data.Floor.ConstructionRValue).toFixed(2));
          }
        }
        this.floorlist.push(object);
        object = { floorname: "", numinclusion: 0, totalarea: 0, totalrvalue: 0, totalheatloss: 0 };
      }

    });

    setTimeout(() => {
      this.finalcalculation();
    }, 2000);


  }



  returntoSchedule() {
    this.router.navigate(["/main/" + `${this.registeruser.ID}` + "/buildingschedule"], { queryParams: { projectid: this.projectid, designid: this.designid } });
  }

  finalcalculation() {

    for (let x of this.walllist) {
      this.totalareawall += Number(x.totalarea);
      this.totalheatlosswall += Number(x.totalheatloss);
      this.iswallpasslist.push((x.totalarea / x.totalrvalue) < (x.totalarea / this.wallrvalue));
    }


    for (let x of this.doorlist) {
      this.totalareadoor += Number(x.totalarea);
      this.totalheatlossdoor += Number(x.totalheatloss);
    }

    for (var x of this.windowlist) {
      this.totalareawindow += Number(x.totalarea);
      this.totalheatlosswindow += Number(x.totalheatloss);
      this.iswindowpasslist.push((x.totalarea / x.totalrvalue) <= (x.totalarea / this.windowrvalue));
    }

    for (var x of this.rooflist) {
      this.totalarearoof += x.totalarea;
      this.totalnetarearoof += Number(x.totalnetarea);
      this.totalheatlossroof += Number(x.totalheatloss);
      this.isroofpasslist.push((x.totalarea / x.totalrvalue) <= (x.totalarea / this.roofrvalue));
      console.log(this.totalarearoof);
    }

    for (var x of this.skylightlist) {
      this.totalareaskylight += Number(x.totalarea);
      this.totalheatlossskylight += Number(x.totalheatloss);
      this.isskylightpasslist.push((x.totalarea / x.totalrvalue) <= (x.totalarea / this.skylightrvalue));
    }

    for (var x of this.floorlist) {
      this.totalareafloor += Number(x.totalarea);
      this.totalheatlossfloor += Number(x.totalheatloss);
      this.isfloorpasslist.push((x.totalarea / x.totalrvalue) <= (x.totalarea / this.floorrvalue));
    }

    //Get minimum r value
    if (this.walllist.length !== 0) {
      this.minrvaluewall = Math.min.apply(Math, this.walllist.map(x => {
        return x.totalrvalue;
      }));
    }

    if (this.rooflist.length !== 0) {
      this.minrvalueroof = Math.min.apply(Math, this.rooflist.map(x => {
        return x.totalrvalue;
      }));
    }

    if (this.windowlist.length !== 0) {
      this.minrvaluewindow = Math.min.apply(Math, this.windowlist.map(x => {
        return x.totalrvalue;
      }));
    }
    if (this.floorlist.length !== 0) {
      this.minrvaluefloor = Math.min.apply(Math, this.floorlist.map(x => {
        return x.totalrvalue;
      }));
    }
    if (this.skylightlist.length !== 0) {
      this.minrvalueskylight = Math.min.apply(Math, this.skylightlist.map(x => {
        return x.totalrvalue;
      }));
    }

    let allrequireelement = [];

    //Filter to check of pass
    if (this.walllist.length !== 0) {
      this.iswallpass = this.iswallpasslist.filter(x => x).length === this.walllist.length;
      allrequireelement.push(this.iswallpass);
    }
    if (this.rooflist.length !== 0) {
      this.isroofpass = this.isroofpasslist.filter(x => x).length === this.rooflist.length;
      allrequireelement.push(this.isroofpass)
    }
    if (this.windowlist.length !== 0) {
      this.iswindowpass = this.iswindowpasslist.filter(x => x).length === this.windowlist.length;
      allrequireelement.push(this.iswindowpass);
    }
    if (this.floorlist.length !== 0) {
      this.isfloorpass = this.isfloorpasslist.filter(x => x).length === this.floorlist.length;
      allrequireelement.push(this.isfloorpass);
    }
    if (this.skylightlist.length !== 0) {
      this.isskylightpass = this.isskylightpasslist.filter(x => x).length === this.skylightlist.length;
      allrequireelement.push(this.isskylightpass);
    }

    this.maxdoorareaallow = Math.max(6, (this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth) * 0.06);

    this.doorheatlost = this.maxdoorareaallow > this.totalareadoor ? Number((this.totalareadoor / (this.totalareawall / this.totalheatlosswall)).toFixed(2)) : Number(this.totalheatlossdoor.toFixed(2));
    //this.totalwallarealeft = this.totalareawall - this.totalareawindow;
    this.totalproposed = Number((Number(this.totalheatlossroof.toFixed(2)) + Number(this.doorheatlost.toFixed(2)) + Number(this.totalheatlossskylight.toFixed(2)) + Number(this.totalheatlosswindow.toFixed(2)) + Number(this.totalheatlosswall.toFixed(2)) + Number(this.totalheatlossfloor.toFixed(2))).toFixed(2));

    // console.log(Number(this.totalheatlossroof.toFixed(2)));
    // console.log(Number(this.totalheatlossdoor.toFixed(2)));
    // console.log(Number(this.totalheatlossskylight.toFixed(2)));
    // console.log(Number(this.totalheatlosswindow.toFixed(2)));
    // console.log(Number(this.totalheatlosswall.toFixed(2)));
    // console.log(Number(this.totalheatlossfloor.toFixed(2)));

    this.totalareawindowless30 = Number(((this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth) * 0.30).toFixed(2));

    this.skylightrvaluecondition = 0.015 < (this.totalareaskylight / this.totalarearoof) ? this.totalareaskylight / this.skylightrvalue : this.totalareaskylight / this.roofrvalue;
    this.wallrvaluecondition = 0.30 > (this.totalwindowsouth + this.totalwindoweast + this.totalwindowwest + this.totalwindownorth) / (this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth) ? (((this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth) * 0.7) / this.wallrvalue) : (this.totalareawall / this.wallrvalue);


    if ((this.totalwindowsouth + this.totalwindoweast + this.totalwindowwest + this.totalwindownorth) / (this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth) <= 0.30) {
      this.totalschedule = Number((this.totalarearoof / this.roofrvalue).toFixed(2)) + Number(this.skylightrvaluecondition.toFixed(2))
        + Number(this.wallrvaluecondition.toFixed(2)) + Number((this.totalareawindowless30 / this.windowrvalue).toFixed(2))
        + Number((this.totalareafloor / this.floorrvalue).toFixed(2));
      console.log(this.totalschedule);
    } else if ((this.totalwindowsouth + this.totalwindoweast + this.totalwindowwest + this.totalwindownorth) / (this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth) > 0.30) {
      this.totalareawindowmore30 = Number(((this.totalareawindow + this.totalareadoor) - this.totalareawindowless30).toFixed(2));
      this.totalschedule = Number((this.totalarearoof / this.roofrvalue).toFixed(2))
        + Number(this.skylightrvaluecondition.toFixed(2))
        + Number(this.wallrvaluecondition.toFixed(2)) + (Number(this.totalareawindowless30.toFixed(2)) / this.windowrvalue)
        + Number((this.totalareawindowmore30 / this.wallrvalue).toFixed(2)) + Number((this.totalareafloor / this.floorrvalue).toFixed(2));
    }
    this.wallbalancecheck_proposed = this.totalareawall + this.totalareawindow + this.totalareadoor;
    if (0.30 > ((this.totalwindowsouth + this.totalwindoweast + this.totalwindowwest + this.totalwindownorth) / (this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth))) {
      this.wallbalancecheck_reference = (((this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth) * 0.7) + this.totalareawindowless30 + this.totalareawindowmore30);
    } else if (0.30 <= ((this.totalwindowsouth + this.totalwindoweast + this.totalwindowwest + this.totalwindownorth) / (this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth))) {
      this.wallbalancecheck_reference = this.totalareawall + this.totalareawindowless30 + this.totalareawindowmore30
    }

    let ehc1result = [];

    if (((this.totalwindowsouth + this.totalwindoweast + this.totalwindowwest + this.totalwindownorth) / (this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth)) > 0) {
      this.islessthan30window = 0.30 >= ((this.totalwindowsouth + this.totalwindoweast + this.totalwindowwest + this.totalwindownorth) / (this.totalwallsouth + this.totalwalleast + this.totalwallwest + this.totalwallnorth));
      ehc1result.push(this.islessthan30window);
    }


    if (((this.totalwindowsouth + this.totalwindoweast + this.totalwindowwest) / (this.totalwallsouth + this.totalwalleast + this.totalwallwest)) > 0) {
      this.iswallwesteatsouthlessthan30 = 0.30 >= ((this.totalwindowsouth + this.totalwindoweast + this.totalwindowwest) / (this.totalwallsouth + this.totalwalleast + this.totalwallwest));
      ehc1result.push(this.iswallwesteatsouthlessthan30);
    }

    if (this.totalareaskylight > 0) {
      this.isskylightarealessthen1point5 = 0.015 > (this.totalareaskylight / this.totalarearoof);
      ehc1result.push(this.isskylightarealessthen1point5);
    }

    if (allrequireelement.length > 0) {
      this.isachievedallrequire = allrequireelement.every(Boolean);
      ehc1result.push(this.isachievedallrequire)
    }

    if (ehc1result.length > 0) {
      this.isech1pass = ehc1result.every(Boolean);
      console.log(ehc1result);
    }

    let climatepoint = 0
    if(this.targeting === "NZBC - H1 Compliance Assessment"){
      climatepoint = 0
    }else if (this.targeting === "6 Homestar"){
      climatepoint = 12
    }else{
      climatepoint = 13
    }

    this.numberpoint = (this.totalproposed < this.totalschedule) || this.isech1pass ? climatepoint : 0;
  }



  downloadresult() {
    let date = new Date();
    let stringdate: string = "";
    stringdate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + "_" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
    this.toastr.info("Please wait until finishing rendering!");
    html2canvas(document.querySelector('#content'),
      { scale: 2 }
    ).then(canvas => {

      let pdf = new jsPDF('p', 'mm', 'a4'), margin = {
        top: 40,
        bottom: 60,
        left: 40,
        width: 522
      };
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 211, 298);
      pdf.fromHTML(canvas, margin.left, margin.top, {
        // y coord
        width: margin.width // max width of content on PDF
      }, dispose => {
        this.toastr.success("Rendering Completed!");
        pdf.save("heatloss_" + stringdate);
      }, margin)
    });
  }

  getcalculateheatloss() {
    if(this.currentroute === "ehc1heatingenergy"){
      alert("You are now in EHC-1 Heat Loss!")
    }
    // this.router.navigate(["/main/" + `${this.registeruser.ID}` + "/ehc1heatingenergy"], { queryParams: { projectid: this.projectid, designid: this.designid } });
  }

  getcalculatenaturallighting() {
    this.router.navigate(["/main/" + `${this.registeruser.ID}` + "/ehc1naturallightingenergy"], { queryParams: { projectid: this.projectid, designid: this.designid } });
  }

  getcalculatecoolingenergy() {
    this.router.navigate(["/main/" + `${this.registeruser.ID}` + "/ehc1coolingenergy"], { queryParams: { projectid: this.projectid, designid: this.designid } });
  }
  
  getcalculatepassive() {
    this.router.navigate(["/main/" + `${this.registeruser.ID}` + "/ehc1passiveventilation"], { queryParams: { projectid: this.projectid, designid: this.designid } });
  }
}
