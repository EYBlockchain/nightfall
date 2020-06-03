import { Component, OnInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import UserService from '../../services/user.service';
import { UtilService } from '../../services/utils/util.service';
import { Router } from '@angular/router';

/**
 *  Spend fungible token component, which is used for rendering the page of transfer ERC-20 token to the selected receipent.
 */
@Component({
  selector: 'app-admin',
  templateUrl: './index.html',
  providers: [UserService, UtilService],
  styleUrls: ['./index.css']
})
export default class AdminComponent implements OnInit {
  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * To store all users
   */
  users: any = [];

  /**
   * To store transaction hash
   */
  transactionHash;
  /**
   * retrieved decrypted data for the transaction
   */
  decryptedData: any;

  constructor(
    private toastr: ToastrService,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router
  ) {

  }

  ngOnInit () {
    this.verifyAdminAccount();
  }

  /**
   * Method to verfiy admin user
   */
  verifyAdminAccount() {
    this.isRequesting = true;
      this.userService.getUserDetails().subscribe(
        data => {
          if (data['data'].name === 'admin') {
            this.getBlacklistedUsers();
          } else {
            this.router.navigate(['/overview']);
          }
          this.isRequesting = false;
      }, error => {
        this.isRequesting = false;

      });
  }

  /**
   * Method to retrive all users.
   *
   */
  getBlacklistedUsers() {
    this.isRequesting = true;
    this.userService.getBlacklistedUsers().subscribe(
      data => {
        this.isRequesting = false;
        this.users = data['data'];
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again.', 'Error');
      });
  }

  /**
   * Method to block account.
   */
  setAddressToBlacklist(name) {
    this.isRequesting = true;
    this.userService.setAddressToBlacklist(name).subscribe(data => {
      this.isRequesting = false;
      this.users.forEach(value => {
        if (name === value.name) {
          value.isBlacklisted = true;
        }
      });
      this.toastr.success('Successfully blacklisted ', name);
    }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

    /**
   * Method to unblock account.
   */
  unsetAddressFromBlacklist(name) {
    this.isRequesting = true;
    this.userService.unsetAddressFromBlacklist(name).subscribe(data => {
      this.isRequesting = false;
      this.users.forEach(value => {
        if (name === value.name) {
          value.isBlacklisted = false;
        }
      });
      this.toastr.success('Successfully unblacklisted ', name);
    }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

  /**
   * Method to block account
   */
  userActions(previousStatus, name) {
    (previousStatus ? this.unsetAddressFromBlacklist(name) : this.setAddressToBlacklist(name));
  }

  parseJson(html, object, parentKey = '') {
    for (const key in object) {
      if (typeof object[key] === 'object') {
        html = this.parseJson(html, object[key], key);
      } else {
        html += `<tr>
          <td><strong>${parentKey} ${key}</strong></td>
          <td>${object[key]}</td>
        </tr>`;
      }
    }
    return html;
  }

  async onSearchChange(value) {
    this.isRequesting = true;
    this.userService.getBlacklistedUsers().subscribe(data => {
      this.isRequesting = false;
      if (!value) {
        this.users = data['data'];
        return;
      }
      this.users = data['data'].filter(({ name }) => name.includes(value));
    });
  }

  /**
   * Method to decrypt the transaction details
   */
  decryptTransaction(txHash, type) {
    this.isRequesting = true;
    this.userService.getAndDecodeTransaction(txHash, type).subscribe(
      data => {
        let innerHtml = `<table class="table table-hover table-striped">
          <tbody>
          `;
        this.isRequesting = false;
        if (!data['data']) {
          return;
        }
        innerHtml = this.parseJson(innerHtml, data['data']);
        innerHtml += '</tbody></table>';
        this.decryptedData = innerHtml;
    }, error => {
        this.isRequesting = false;
        this.toastr.error('Invalid transaction hash or transaction type', 'Error');
    });
  }
}
