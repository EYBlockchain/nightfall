import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UtilService } from '../../services/utils/util.service';

/**
 * Componenet to create new accounts.
 */
@Component({
  selector: 'app-create-accounts',
  templateUrl: './create-accounts.component.html',
  providers: [ AccountsApiService, UtilService],
  styleUrls: ['./create-accounts.component.css']
})
export class CreateAccountsComponent implements OnInit {
  /**
   * Form data object to create account.
   */
  createAccount: FormGroup;
  /**
   * Flag for http request
   */
  isRequesting = false;

  constructor(
      private fb: FormBuilder,
      private APIservice: AccountsApiService,
      private router: Router,
      private toastr: ToastrService,
      private utilService: UtilService) {
   }

   ngOnInit() {
    this.createForm();
  }

  /**
   * Method to create form for user creation.
   */
  createForm() {
    this.createAccount = this.fb.group({
      accountName : ['', Validators.required],
      email : ['', Validators.required],
      passphrase: ['', Validators.required],
      cfmpassphrase: ['', Validators.required]
    });
  }

  /**
   * Method to create account.
   */
  createAccounts() {
    this.isRequesting = true;
     this.APIservice.createAccount(this.createAccount.value).subscribe(
      data => {
        this.toastr.success('Account Created', 'Success');
        this.isRequesting = false;
        this.router.navigate(['/login']);
      },
      (err: HttpErrorResponse) => {
        this.toastr.error('Please try again', 'Error');
        this.isRequesting = false;
      }
    );
  }



}
