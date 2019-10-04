import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CoinApiService } from '../../services/coins/coin-api.service';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import { UtilService } from '../../services/utils/util.service';
import { NgSelectComponent } from '@ng-select/ng-select';

/**
 *  Spend coin component, which is used for rendering the page of transfer ERC-20 token commitments to the selected receipent.
 */
@Component({
  selector: 'app-accounts',
  templateUrl: './spend-coin.component.html',
  providers: [CoinApiService, AccountsApiService, UtilService],
  styleUrls: ['./spend-coin.component.css']
})

export class SpendCoinComponent implements OnInit , AfterContentInit {

  /**
   *  To store ERC-20 token commitment transaction objects
   */
  transactions: Array<Object>;

  /**
   * To store the selected ERC-20 token commitments
   */
  selectedCoinList: any = [];

  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * Amount to transfer
   */
  transferValue: number;

  /**
   * If no coins are available, set this property as false;
   */
  noCoin = false;

  /**
   * To store all users
   */
  users: any;

  /**
   * Name of the receiver
   */
  receiverName: string;

  /**
   *  Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;

  /**
   * Reference of combo box
   */
  @ViewChild('select') select: NgSelectComponent;

  constructor(
    private toastr: ToastrService,
    private coinApiService: CoinApiService,
    private accountApiService: AccountsApiService,
    private utilService: UtilService,
    private router: Router
  ) {

    this.customSearchFn = this.customSearchFn.bind(this);
  }

  ngOnInit () {
    this.ftName = localStorage.getItem('ftName');
    this.getUsers();
    this.fetchCoins();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.select.filterInput.nativeElement.focus();
    }, 500);
  }

  /**
   * Method list down all ERC-20 commitments.
   */
  fetchCoins () {
    this.transactions = null;
    this.isRequesting = true;
    this.coinApiService.fetchCoins()
      .subscribe(
        (data) => {
        this.isRequesting = false;
        if (data && data['data'].length ) {
          this.transactions = data['data'].map((tx, indx) => {
            tx.selected = false;
            tx.id = indx;
            return tx;
          });
        } else {
          this.noCoin = true;
        }
      }, (error) => {
        console.log('error', error);
        this.isRequesting = false;
      });
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

  /**
   * Method to transfer two ERC-20 token commitement to selected user.
   */
  initiateTransfer () {
    const count = this.selectedCoinList.length;
    console.log('count', count, this.selectedCoinList);
    if (!count || count !== 2) {
      this.toastr.error('Invalid Coin Selection.');
      return;
    }
    const [coin1, coin2] = this.selectedCoinList;
    const {
      transferValue,
      transactions
    } = this;

    if (!transferValue || !this.receiverName) {
      this.toastr.error('All fields are mandatory');
      return;
    }

    this.isRequesting = true;
    let returnValue = Number(coin1['coin_value']) + Number(coin2['coin_value']);
    returnValue -= transferValue;
    console.log('RETURNVALUE', returnValue, transferValue, this.toHex(returnValue), this.toHex(transferValue));

    this.coinApiService.transferCoin(
      coin1['coin_value'],
      coin2['coin_value'],
      this.toHex(transferValue),
      this.toHex(returnValue),
      coin1['salt'],
      coin2['salt'],
      coin1['coin_commitment_index'],
      coin2['coin_commitment_index'],
      coin1['coin_commitment'],
      coin2['coin_commitment'],
      localStorage.getItem('publickey'),
      this.receiverName
    ).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Transfer to Receiver ' + this.receiverName);
        transactions.splice(Number(coin1['id']), 1);
        transactions.splice(Number(coin2['id']) - 1, 1);
        this.fetchCoins();
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
   * Method to convert number to hex string
   *
   * @param num {Number} Number
   */
  toHex(num: number) {
    if (!num || isNaN(num)) {
      num = 0;
    }
    const hexValue = (num).toString(16);
    return '0x' + hexValue.padStart(32, '0');
  }

}


