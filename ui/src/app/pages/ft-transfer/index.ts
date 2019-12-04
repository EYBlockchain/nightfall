import { Component, OnInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import FtService from '../../services/ft.service';
import UserService from '../../services/user.service';
import { Router } from '@angular/router';
import { UtilService } from '../../services/utils/util.service';

/**
 *  Spend fungible token component, which is used for rendering the page of transfer ERC-20 token to the selected receipent.
 */
@Component({
  selector: 'ft-transfer',
  templateUrl: './index.html',
  providers: [FtService, UserService, UtilService],
  styleUrls: ['./index.css']
})
export default class FtTransferComponent implements OnInit {

  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * Amount to transfer
   */
  amount: number;

  /**
   * To store all users
   */
  users: any = [];

  /**
   * Name of the receiver
   */
  receiverName: string;

  /**
   * Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;
  /**
   * To store the ERC-20 token count.
   */
  ftBalance;


  constructor(
    private toastr: ToastrService,
    private ftService: FtService,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router
  ) {

  }

  ngOnInit () {
    this.getAllRegisteredNames();
    this.ftName = localStorage.getItem('ftName');
    this.getFTokenInfo();
  }

  /**
   * Method to list down all ERC-20 tokens.
   */
  getFTokenInfo() {
    this.userService.getFTokenInfo().subscribe(
      data => {
        this.ftBalance = data['data']['balance'];
      },
      error => {
        console.log('error in user get', error);
      }
    );
  }
  /**
   * Method to transfer two ERC-20 tokens to selected user.
   */
  transferFToken() {
    if (!this.amount || !this.receiverName) { return; }
    if (this.amount > this.ftBalance) {
      return this.toastr.error('You do not have enough ERC-20 tokens');
    }
    this.isRequesting = true;
    this.ftService.transferFToken(this.amount, localStorage.getItem('address'), this.receiverName).subscribe(transaction => {
      this.isRequesting = false;
      this.toastr.success('fungible token transferred Successfully.');
      this.router.navigate(['/overview'], { queryParams: { selectedTab: 'ft' } });
    }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

  /**
   * Method to retrive all users.
   *
   */
  getAllRegisteredNames() {
    this.isRequesting = true;
    this.userService.getAllRegisteredNames().subscribe(
      data => {
        this.isRequesting = false;
        this.users = data['data'];
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again.', 'Error');
      });
  }
}
