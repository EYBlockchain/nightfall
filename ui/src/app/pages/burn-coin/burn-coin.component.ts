import { Component, OnInit, ViewChild, AfterContentInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CoinApiService } from '../../services/coins/coin-api.service';
import { Router } from '@angular/router';
import {UtilService} from '../../services/utils/util.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
/**
 *  Burn coin component, which is used for rendering the page of burn private coin.
 */
@Component({
  selector: 'app-burn-coin',
  templateUrl: './burn-coin.component.html',
  providers: [AccountsApiService, CoinApiService, UtilService],
  styleUrls: ['./burn-coin.component.css']
})
export class BurnCoinComponent implements OnInit , AfterContentInit {
  /**
   * Transaction list
   */
  transactions: Array<Object>;
  /**
   * Seleceted ERC-20 commitment
   */
  selectedCoin: any;
  /**
   * Seleceted list of ERC-20 commitment
   */
  selectedCoinList: any = [];
  /**
   * If no coins are available, set this property as false;
   */
  nocoin = false;
  /**
   * Flag for http request
   */
  isRequesting = false;
  /**
   * To identify the index of selected ERC-20 commitment.
   */
  index: string;
  /**
   * Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;

  /**
   * To store all users
   */
  users: any;

/**
 * Name of the transferee
 */
  receiverName: string;

  /**
   * Reference of combo box
   */
  @ViewChild('select') select: NgSelectComponent;

  constructor(
    private toastr: ToastrService,
    private utilService: UtilService,
    private coinApiService: CoinApiService,
    private accountApiService: AccountsApiService,
    private router: Router
  ) {
    this.fetchCoins();
    this.customSearchFn = this.customSearchFn.bind(this);
  }

  ngOnInit () {
    this.ftName = localStorage.getItem('ftName');
    this.getUsers();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.select.filterInput.nativeElement.focus();
  }, 500);

  }

  /**
   * Method to list down all ERC-20 coins.
   */
  fetchCoins () {
    this.transactions = null;
    this.isRequesting = true;
      this.coinApiService.fetchCoins(localStorage.getItem('address'))
      .subscribe( data => {
        this.isRequesting = false;
        if (data &&
          data['data'] &&
          data['data'].length
         ) {
          this.transactions = data['data'].map((tx, indx) => {
            tx.selected = false;
            tx.id = indx;
            return tx;
          });
        } else {
          this.nocoin = true;
        }
      }, error => {
        this.isRequesting = false;
      });
  }

  /**
   * Method to burn a private coin, this will revert back to public
   */
  initiateBurn () {
    this.selectedCoin = this.selectedCoinList[0];
    console.log(this.selectedCoin, 'selected coin');
    const coin = this.selectedCoin;
    if (!coin) { return; }
    const {
      transactions,
      index
    } = this;
    this.isRequesting = true;
    this.coinApiService.burnCoin(
      coin['coin_value'],
      localStorage.getItem('secretkey'),
      coin['salt'],
      coin['coin_commitment_index'],
      coin['coin_commitment'],
      localStorage.getItem('publickey'),
      this.receiverName
    ).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Burned Coin ' + coin['coin_commitment']);
        transactions.splice(Number(index), 1);
        this.selectedCoin = undefined;
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'coins' } });
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

  /**
   * Method to set new coin list in select box, on removing.
   * @param item {Object} Item to be removed.
   */
  onRemove(item) {
    console.log('selected items', this.selectedCoinList, item);
    const newList = this.selectedCoinList.filter((it) => {
      return item._id !== it._id;
    });
    this.selectedCoinList = newList;
    console.log('selected new items', this.selectedCoinList);
  }

  /**
   * Method to serach an item from the combobox.
   *
   * @param term {String} Term that user entered
   * @param item {Item} Item which searched by user.
   */
  customSearchFn(term: string, item: any) {
    if (!item) {
      return;
    }
    term = term.toLocaleLowerCase();
    const itemToSearch = this.utilService.convertToNumber(item.coin_value).toString().toLocaleLowerCase();
    return itemToSearch.indexOf(term) > -1;
  }

  /**
   * Method to retrive all users.
   *
   */
  getUsers () {
    this.isRequesting = true;
    this.accountApiService.getUsers().subscribe(
      data => {
        this.isRequesting = false;
        this.users = data['data'];
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again.', 'Error');
      });
  }

}

