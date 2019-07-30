import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private url = environment.socketURL;

  private socket: any;
  constructor(private http: HttpClient) { }

  //events to be listened


  public verifyUser = (): Observable<any> => {
    //handshake
    this.socket = io(this.url)
    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data)
      }) //end socket
    }) //end observerable
  } //end verifyUser method


  //socket for friend request sent notification
  public createIssueNotification = (userId) => {
    return Observable.create((observer) => {
      this.socket.on(userId, (notification) => {
        observer.next(notification);
      }); //end Socket
    }); //end Observable
  }//socket listener end

  // public updateIssueListener = (userId) => {
  //   return Observable.create((observer) => {
  //     this.socket.on(userId, (notification) => {
  //       observer.next(notification);
  //     }); //end Socket
  //   }); //end Observable
  // }


  //events to be emitted

  public setUser = (authToken) => {
    this.socket.emit('set-user', (authToken))
  } //end setUser

  public createIssue = (data) => {
    this.socket.emit('create-issue', (data));
  }
  public updateIssueEmit = (data) => {
    this.socket.emit('update-issue', (data));
  }
  public disconnectSocket = () => {
    this.socket.emit('logout')
  }
}
