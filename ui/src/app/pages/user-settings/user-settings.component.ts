import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import {Config} from '../../config/config';

/**
 * User Settings Component is a container componet, which loads user profile component and account components
 * as child.
 */
@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css'],
  providers: [AccountsApiService]
})
export class UserSettingsComponent extends Config implements OnInit {

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
