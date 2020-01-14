import { Component, OnInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import FtService from '../../services/ft.service';
import { Router } from '@angular/router';
import UserService from '../../services/user.service';
import { UtilService } from '../../services/utils/util.service';

/**
 * Burn fungible token component, which is used for rendering the page of burn fungible token.
 */
@Component({
  selector: 'app-ft-burn',
  templateUrl: './index.html',
  providers: [FtService, UtilService, UserService],
  styleUrls: ['./index.css']
})
export default class FtBurnComponent implements OnInit {

  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * Amount to burn ERC-20 token
   */
  amount: number;

  /**
   * Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;

  /**
   *  Total available balance of ERC-20
   */
  erc20Balance: number;

  constructor(
    private toastr: ToastrService,
    private ftService: FtService,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router
  ) {

  }

  ngOnInit () {
    this.ftName = localStorage.getItem('ftName');
    this.getFTokenInfo();
  }

  /**
   * Method to get balance of ERC-20 tokens.
   */
  getFTokenInfo() {
    this.userService.getFTokenInfo().subscribe(
      data => {
        this.erc20Balance = data['data']['balance'];
        console.log('this.erc20Balance', this.erc20Balance);
      },
      error => {
        console.log('error in user get', error);
      }
    );
  }

  /**
   * Method to burn ERC-20 tokens.
   */
  burnFToken() {
    if (!this.amount) { return; }
    if (this.amount > this.erc20Balance) {
      return this.toastr.error('You do not have enough ERC-20 tokens');
    }
    this.isRequesting = true;
    this.ftService.burnFToken(this.amount).subscribe(transaction => {
      this.isRequesting = false;
      this.toastr.success('fungible token Burned Successfully.');
      this.router.navigate(['/overview'], { queryParams: { selectedTab: 'ft' } });
    }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }




}

