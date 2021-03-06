import { Component, OnInit, Input } from '@angular/core';
import { Door } from 'src/app/models/door';
import { LocalStorage } from 'ngx-webstorage';
import { WalldoorwindowService } from 'src/app/service/walldoorwindow.service';
import { ActivatedRoute } from '@angular/router';
import { LoginserviceService } from 'src/app/service/loginservice.service';
import { ToastrService } from 'ngx-toastr';
import { Register } from 'src/app/models/register';
import { NgForm } from '@angular/forms';
import { BuildingmodelService } from 'src/app/service/buildingmodel.service';

@Component({
  selector: 'app-doorform',
  templateUrl: './doorform.component.html',
  styleUrls: ['./doorform.component.css']
})
export class DoorformComponent implements OnInit {

  doorobject: Door;
  @Input() doorobjectlist = [];
  designid: string = "";
  projectid: string = "";
  registeruser: Register;
  constructor(public wallservice: WalldoorwindowService, public route: ActivatedRoute, private loginservice: LoginserviceService,
    private toastr: ToastrService, private buildingmodelservice: BuildingmodelService) {
    this.route.queryParams.subscribe(params => {
      this.projectid = params['projectid'];
      this.designid = params['designid'];
    });
    //this.setdefault();
    let loginapp = JSON.parse(localStorage.getItem('currentUser'));
    this.loginservice.currentUser.subscribe(x => {
      if (x === null) {
        this.registeruser = loginapp;
      } else {
        this.registeruser = x;
      }

    });
    this.setDefault();

  }

  ngOnInit() {
    this.wallservice.doorlistdata(this.designid);
  }



  fetchingdoordata() {
    this.wallservice.doorlistdata(this.designid);
  }

  setDefault() {
    this.doorobject = {
      DesignID: null,
      ID: null,
      ProjectID: null,
      UserID: null,
      DoorName: null,
      Area: null,
      ConstructionRValue: null,
      Height: null,
      Width: null,
      DateCreated: null
    };
  }

  onSubmit(form: NgForm) {
    if (form.value.id === null) {
      let date = new Date();
      this.doorobject = {
        DesignID: this.designid,
        ProjectID: this.projectid,
        UserID: this.registeruser.ID,
        DoorName: form.value.doorName,
        Area: Number(this.doorobject.Area),
        ConstructionRValue: Number(form.value.constructionRValue),
        Height: Number(form.value.height),
        Width: Number(form.value.width),
        DateCreated: date.toString()
      };

      const found = this.wallservice.doorlist.some(x => {
        return x.data.DoorName === this.doorobject.DoorName
      }); //This boolean will detect if the wall name is existed to prevent duplicate with different value

      if (!found) {
        this.wallservice.doorposting(this.doorobject, this.designid).subscribe(res => {
          this.toastr.success("Door Has Been Added Successfully!", "Successful");
          setTimeout(() => {
            this.fetchingdoordata();
          }, 1500);
          this.setDefault();
        }, err => {
          this.toastr.error("Door Has Been Failed To Add!", "Successful");
        });
      } else {
        this.toastr.warning("The door name is existed.", "No Duplicate Name");
        form.reset();
      }

    } else {
      this.doorobject = {
        ID: form.value.id,
        DesignID: this.designid,
        ProjectID: this.projectid,
        UserID: this.registeruser.ID,
        DoorName: form.value.doorName,
        Area: Number(this.doorobject.Area),
        ConstructionRValue: Number(form.value.constructionRValue),
        Height: Number(form.value.height),
        Width: Number(form.value.width)
      };

      this.wallservice.doorput(this.doorobject, this.designid).subscribe(res => {
        this.toastr.success("Door Has Been Updated Successfully!", "Info Message!");
        this.updatedoormodel(this.designid, this.doorobject);
        setTimeout(() => {
          this.fetchingdoordata();
        }, 1500);

      }, err => {
        this.toastr.error("Door Has Been Failed To Update!", "Info Message!");
      });
    }
  }

  editFieldValue(Door: any) {
    let door: Door = {
      ID: Door.id,
      DoorName: Door.data.DoorName,
      ConstructionRValue: Door.data.ConstructionRValue,
      Width: Door.data.Width,
      Height: Door.data.Height,
      Area: Door.data.Area,
      DesignID: this.designid,
      ProjectID: this.projectid,
      UserID: this.registeruser.ID
    };

    this.doorobject = Object.assign({}, door);
  }





  deleteFieldValue(id: string, door: any) {
    if (confirm("Are you sure to delete this item?") === true) {
      this.wallservice.doordelete(id, this.designid).subscribe(res => {
        this.toastr.success("Door Has Been Deleted Successfully!", "Info Message!");
        this.deletedoormodel(this.designid, door);
        setTimeout(() => {
          this.fetchingdoordata();
        }, 1500);
      }, err => {
        this.toastr.error("Door Has Been Failed To Delete!", "Info Message!");
      });
    }
  }

  updatedoormodel(id: string, door: Door){
    this.buildingmodelservice.fetchwallwindowdoormodel(this.designid);
    if(this.buildingmodelservice.wallwindowdoormodellist.length !== 0){
      for(let i of this.buildingmodelservice.wallwindowdoormodellist){
        let doormodellist: Array<any> = i.data.Door;
        //console.log(windowmodellist);
        const found = doormodellist.some(x => {
          return x.DoorName === door.DoorName
        }); //This boolean will detect if the name is existed to prevent duplicate with different value
        if (found) {
          doormodellist.forEach((element, index) => {
            if (element.DoorName === door.DoorName) {
              element.ConstructionRValue = door.ConstructionRValue;
              element.Width = door.Width;
              element.Height = door.Height;
            }
          });

          i.data.Window = doormodellist;
          //console.log(windowmodellist);
          this.buildingmodelservice.wallwindowdoormodelUpdate(i.id, i.data, this.designid).subscribe(res => {
            this.toastr.success("Wall Model Has Been Successfully Update!", "Info Message");

            this.buildingmodelservice.wallwindowdoormodelGet(this.designid);
          }, err => {
            this.toastr.error("Wall Model Has Been Failed To Update!", "Info Message");
          });
        }
      }
    }

  }

  deletedoormodel(id: string, doori: any){
    this.buildingmodelservice.fetchwallwindowdoormodel(this.designid);
    if(this.buildingmodelservice.wallwindowdoormodellist.length !== 0){
      for(let i of this.buildingmodelservice.wallwindowdoormodellist){
        let doormodellist: Array<any> = i.data.Door;
        const found = doormodellist.some(x => {
          return x.DoorName === doori.DoorName
        }); //This boolean will detect if the name is existed to prevent duplicate with different value
        if (found) {
          i.data.Door = doormodellist.filter(x => x.DoorName !== doori.DoorName);
          //this.buildingmodelservice.wallwindowdoormodelUpdate(i.id, i.data, this.designid);
          this.buildingmodelservice.wallwindowdoormodelUpdate(i.id, i.data, this.designid).subscribe(res => {
            this.toastr.success("Wall Model Has Been Successfully Update!", "Info Message");

            this.buildingmodelservice.wallwindowdoormodelGet(this.designid);
          }, err => {
            this.toastr.error("Wall Model Has Been Failed To Update!", "Info Message");
          });
        }
      }
    }
  }

  onKeyWidth(event: any) { // without type info
    if (event.target.value === "") {
      this.doorobject.Area = 0;
    } else {
      this.doorobject.Width = event.target.value;
      this.doorobject.Area = this.doorobject.Width * this.doorobject.Height;
    }

  }

  onKeyHeight(event: any) { // without type info
    if (event.target.value === "") {
      this.doorobject.Area = 0;
    } else {
      this.doorobject.Height = event.target.value;
      this.doorobject.Area = this.doorobject.Width * this.doorobject.Height;
    }

  }

  setdefault() {
    this.loginservice.registermember = {
      ID: "",
      FirstName: "",
      LastName: "",
      Email: "",
      Password: ""
    };
  }

}
