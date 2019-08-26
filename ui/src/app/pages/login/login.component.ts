import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import { SimpleGlobal } from 'ng2-simple-global';

/**
 * Component where user can login to the application.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [ AccountsApiService ],
})
export class LoginComponent implements OnInit {

  /**
   * Form object to collect user credentials.
   */
  loginAccount: FormGroup;

  /**
   * Flag for http request
   */
  isRequesting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router  ,
    private APIservice: AccountsApiService,
    private toastr: ToastrService,
    private sg: SimpleGlobal
  ) {}

  ngOnInit() {
    this.createForm();
  }

  /**
   * Method to create login form.
   */
  createForm() {
    this.loginAccount = this.fb.group({
      accountName: ['', Validators.required],
      passphrase: [''],
    });
  }

  /**
   * Method for user to login.
   */
  login() {
    this.isRequesting = true;
    this.APIservice.login(this.loginAccount.value).subscribe(
      data => {
        localStorage.setItem('token', data['data']['token']);
        localStorage.setItem('address', data['data']['address']);
        localStorage.setItem('name', data['data']['name']);
        localStorage.setItem('publickey', data['data']['publickey']);
        localStorage.setItem('secretkey', data['data']['secretkey']);
        this.isRequesting = false;
        this.sg['name'] = data['data']['name'];
        this.router.navigate(['/overview']);

      },
      (err: HttpErrorResponse) => {
         let errmsg =  err['error']['error']['message'] ? err['error']['error']['message'] : '';
         if (errmsg.indexOf(':') > -1) {
           errmsg = errmsg.split(':')[1];
         }
        this.toastr.error(errmsg, 'Error');
        this.isRequesting = false;
      }
    );
  }

}
