import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import UserService from '../../services/user.service';
import {Config} from '../../config/config';

/**
 * Component to show the user profile details.
 */
@Component({
  selector: 'app-user-profile',
  templateUrl: './index.html',
  styleUrls: ['./index.css'],
  providers: [UserService]
})
export default class UserProfileComponent extends Config implements OnInit {

  /**
   * To store user details
   */
  user: any;
  /**
   * Flag for http request status
   */
  isRequesting =  false;

  constructor(
    private toastr: ToastrService,
    private userService: UserService
  ) {
    super('');
  }

  ngOnInit(): void {
    this.getUserDetails();
  }

  /**
   * Get the current logged in user details
   */
  getUserDetails() {
    this.userService.getUserDetails().subscribe(
      data => {
        console.log('data', data);
        this.user = data['data'];
      },
      error => {
        console.log('error in user get', error);
      }
    );
  }

}
