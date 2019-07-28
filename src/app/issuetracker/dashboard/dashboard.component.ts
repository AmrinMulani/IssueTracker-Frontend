import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from './../../app.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';



class Issue {
  title: string
  createdOn: Date;
  reporter: string;
  status: string
}
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;

}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  issues: Issue[];
  currentUserId: string
  currentUserName: string
  authToken: string
  //private baseUrl = "http://localhost:3000/api/v1";
  private baseUrl = environment.baseUrl

  constructor(
    public _router: Router,
    public service: AppService,
    private toastr: ToastrService,
    private http: HttpClient

  ) { }

  ngOnInit() {
    let localStg = JSON.parse(localStorage.getItem('userInfo'));

    this.currentUserId = localStg.userDetails.userId;
    //this.userInfo = this._service.getUserInfoFromLocalStorage()
    this.currentUserName = localStg.userDetails.fullName
    this.authToken = localStg.authToken;
    const that = this;

    this.dtOptions = {
      pagingType: 'full_numbers',
      //pageLength: 5,
      serverSide: true,
      processing: true,
      autoWidth: false,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(
            `${this.baseUrl}/issue/getissuebyassignee/${this.currentUserId}?authToken=${this.authToken}`, dataTablesParameters, {}
          ).subscribe(resp => {
            that.issues = resp.data["data"];
            callback({
              recordsTotal: resp.data["recordsTotal"],
              recordsFiltered: resp.data["recordsFiltered"],
              data: []
            });
          });
      },
      columns: [{ data: 'title', width: '40%' }, { data: 'status' }, { data: 'reporter', width: '20%' }, {
        data: 'createdOn',
        width: '40%'
      }]
    };
  }
  createIssue: any = () => {
    this._router.navigate(["/createissue"]);
  }
  public issueSelected = (issueId) => {
    this._router.navigate(['/editissue', issueId]);
  }
}


