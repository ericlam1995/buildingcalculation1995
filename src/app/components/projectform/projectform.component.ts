import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'src/app/models/project';
import { ProjectService } from 'src/app/service/project.service';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Register } from 'src/app/models/register';
import { LoginserviceService } from 'src/app/service/loginservice.service';

@Component({
  selector: 'app-projectform',
  templateUrl: './projectform.component.html',
  styleUrls: ['./projectform.component.css']
})
export class ProjectformComponent implements OnInit {

  registeruser: Register;
  project: Project;

  constructor(private projectservice: ProjectService, private toastr: ToastrService,
    private loginservice: LoginserviceService) {
    //this.setDefault();
    let loginapp = JSON.parse(localStorage.getItem('currentUser'));
    this.loginservice.currentUser.subscribe(x => {
      if (x === null) {
        this.registeruser = loginapp;
      } else {
        this.registeruser = x;
      }

    });
  }

  ngOnInit() {
    this.setdefault();
  }

  onSubmit(form: NgForm) {
    let date = new Date();
    var datestring: string = date.getDate().toString() + "-" + (date.getMonth() + 1).toString() + "-" + date.getFullYear().toString();
    var timestring = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
    const timedatestring = datestring;
    if (form.value.projectname) {
      
      this.project = {
        ProjectName: form.value.projectname,
        DateCreated: timedatestring,
        DateModified: timedatestring,
        UserID: this.registeruser.ID
      }

      this.projectservice.projectposting(this.project, this.registeruser.ID).toPromise().then(res => {
        this.toastr.success("Create Project Successful.", "ProjectForm Message");
        this.setdefault();
        this.projectservice.projectfetching(this.registeruser.ID);
      }, err => {
        this.toastr.error("There was an error occurred.", "ProjectForm Message");
      });
    }

  }

  setdefault() {
    this.project = {
      ProjectName: "",
      DateCreated: null,
      DateModified: null,
    };
  }

  setDefault() {
    this.registeruser = {
      ID: "",
      FirstName: "",
      LastName: "",
      Email: "",
      Password: ""
    };
  }

}
