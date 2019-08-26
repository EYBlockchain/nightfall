import { Component, OnInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CoinApiService } from '../../services/coins/coin-api.service';
import { Router } from '@angular/router';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import { UtilService } from '../../services/utils/util.service';

/**
 * Burn public coin component, which is used for rendering the page of burn public coin.
 */
@Component({
  selector: 'app-burn-public-coin',
  templateUrl: './burn-public-coin.component.html',
  providers: [CoinApiService, UtilService, AccountsApiService],
  styleUrls: ['./burn-public-coin.component.css']
})
export class BurnPublicCoinComponent implements OnInit {

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
    private coinApiService: CoinApiService,
    private accountsApiService: AccountsApiService,
    private utilService: UtilService,
    private router: Router
  ) {

  }

  ngOnInit () {
    this.ftName = localStorage.getItem('ftName');
    this.getCoins();
  }

  /**
   * Method to get balance of ERC-20 tokens.
   */
  getCoins() {
    this.accountsApiService.getCoins().subscribe(
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
  burnPublicCoin() {
    if (!this.amount) { return; }
    if (this.amount > this.erc20Balance) {
      return this.toastr.error('You do not have enough ERC-20 tokens');
    }
    this.isRequesting = true;
    this.coinApiService.burnPublicCoin(localStorage.getItem('address'), this.amount).subscribe(transaction => {
      this.isRequesting = false;
      this.toastr.success('Public Coin Burned Successfully.');
      this.router.navigate(['/overview'], { queryParams: { selectedTab: 'publiccoins' } });
    }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }




}

