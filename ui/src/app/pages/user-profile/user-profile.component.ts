import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import {Config} from '../../config/config';

/**
 * Component to show the user profile details.
 */
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  providers: [AccountsApiService]
})
export class UserProfileComponent extends Config implements OnInit {

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
    private accountService: AccountsApiService
  ) {
    super('');
  }

  ngOnInit(): void {
    this.getUser();
  }

  /**
   * Get the current logged in user details
   */
  getUser() {
    this.accountService.getUser().subscribe(
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
