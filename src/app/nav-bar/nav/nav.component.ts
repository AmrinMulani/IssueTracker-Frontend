import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { IssueService } from './../../issue.service';
import { SocketService } from 'src/app/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {

  userInfo: any;
  authToken: any;
  userName: string
  userId: string;
  modalRef: BsModalRef;
  notifyList: any[];
  verifyUser: Subscription; createIssueNotification: Subscription;
  constructor(private socketService: SocketService, public router: Router, public appService: AppService, private toastr: ToastrService, private _issueService: IssueService, private modalService: BsModalService) { }

  ngOnInit() {

    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    console.log(this.userInfo);

    this.authToken = this.userInfo.authToken;
    this.userId = this.userInfo.userDetails.userId

    this.userName = this.userInfo.userDetails.fullName;
    console.log(this.userName);
    this.getNotification()

    if (this.authToken !== '' || this.authToken !== null || this.authToken !== undefined) {
      this.verifyUserConfirmation();
      this.createIssueNotificationCall();
    }

  }

  ngOnDestroy(): void {
    this.verifyUser.unsubscribe(); //unsubscribe observable
    this.createIssueNotification.unsubscribe();
    // this.friendReqNotification.unsubscribe();
    // this.friendAcceptNotification.unsubscribe();
  }
  public verifyUserConfirmation = () => {
    this.verifyUser = this.socketService.verifyUser().subscribe(
      response => {
        console.log('Hey I am inside verify user ' + response);
        this.socketService.setUser(this.authToken)
      }
    )
  }
  createIssueNotificationCall() {
    this.createIssueNotification = this.socketService.createIssueNotification(this.userId).subscribe(
      response => {
        console.log("socket create call")
        console.log(response)

        this.toastr.info(`${response.message}. Click to open`, '', {
          disableTimeOut: false,
          closeButton: true
        })
          .onTap
          .subscribe(() => this.toasterClickedHandler(response.issueId));
      },
      err => {
        this.toastr.error(err)
      }
    )
  }
  toasterClickedHandler(data) {
    this.router.navigate(['/editissue/' + data]);
  }
  logout = () => {
    this.appService.logoutUser(this.userInfo.userDetails.userId, this.authToken).subscribe((apiResponse) => {
      console.log(apiResponse);
      if (apiResponse.status === 200) {
        Cookie.delete('authToken');
        Cookie.delete('receiverId');
        Cookie.delete('receiverName');
        // while logout we need to clear localstorage
        localStorage.clear();
        //disconnecting socket
        this.socketService.disconnectSocket();
        this.toastr.success('Logged out successfully!!');
        this.router.navigate(['/']);
      } else {
        console.log(apiResponse.message);
        this.toastr.error(apiResponse.message);
        this.router.navigate(['/']);
      }
    });
  }; // end of logout
  openModalWithClass(template: TemplateRef<any>) {
    this.getNotification()
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }
  public getNotification() {
    console.log("get Notification")
    this._issueService.getNotify(this.userId, this.authToken)
      .subscribe(
        (resp) => {
          if (resp.status == 200) {
            console.log(" get notify")

            this.notifyList = resp.data
            console.log(this.notifyList)

          } else {

          }
        }
      )
  }
  public issueSelected = (issueId) => {
    this.router.navigate(['/editissue', issueId]);
    this.modalRef.hide()
  }



}