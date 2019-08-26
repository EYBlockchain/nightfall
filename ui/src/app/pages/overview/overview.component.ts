import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import {Config} from '../../config/config';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { UtilService } from '../../services/utils/util.service';
import { ActivatedRoute, Router } from '@angular/router';
/**
 * Overview component, which is used for rendering the overview page.
 * Here user can see the total count of ERC-20 tokens, ERC-20 token commitments, ERC-721 tokens and ERC-721 token commitments.
 * Also user can see all the token transaction history.
 */
@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  providers: [AccountsApiService, UtilService]
})
export class OverviewComponent extends Config implements OnInit {
  /**
   * To store all users
   */
  user: any;
  /**
   * Flag for http request
   */
  isRequesting =  false;
  /**
   *  To store ERC-721 token commitment transaction objects
   */
  tokenTransactions: any;
  /**
   *  To store ERC-721 token transaction objects
   */
  publicTokenTransactions: any = [];
  /**
   *  To store ERC-20 token transaction objects
   */
  publicCoinTransactions: any = [];
  /**
   *  To store ERC-20 token commitment transaction objects
   */
  coinTransactions: any;
  /**
   * ERC-20 token commitment count
   */
  coinCount;
  /**
   * ERC-721 token count
   */
  nftBalance;
  /**
   * ERC-721 token commitment count
   */
  count = {};

  /**
   * For pagination purpose
   */
  pageNo: number;
  /**
   * For pagination purpose, initial value for page size is set it as 4
   */
  pageSize = 4;
  /**
   * Total collection of objects to calculate pages for pagination.
   */
  totalCollection: Promise<number>;
  /**
   * Current selected type in the Tab component.
   */
  currentType: string;
  /**
   * Flag to show the pagination component.
   */
  isPagination = false;
  /**
   *  Non Fungeble Token name , read from ERC-721 contract.
   */
  nftName: string;
  /**
   *  Non Fungeble Token Symbol , read from ERC-721 contract.
   */
  nftSymbol: string;
  /**
   *  Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;
  /**
   *  Fungeble Token Symbol , read from ERC-20 contract.
   */
  ftSymbol: string;

  /**
   * Current selected tab
   */
  selectedTab = 'publictokens';

  constructor(
    private toastr: ToastrService,
    private accountService: AccountsApiService,
    private utilService: UtilService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super('ERC-20');
  }

  ngOnInit(): void {
    this.getUser();
    this.getUserERC20AndERC721TokenCount();
    this.route
      .queryParams
      .subscribe(params => {
        this.selectedTab = params['selectedTab'] || 'publictokens';
        if (this.selectedTab === 'publictokens') {
          this.getTransactions('publictokens');
        }if (this.selectedTab === 'tokens') {
          this.getTransactions('tokens');
        }if (this.selectedTab === 'publiccoins') {
          this.getTransactions('publiccoins');
        }if (this.selectedTab === 'coins') {
          this.getTransactions('coins');
        } else {
          this.getTransactions('publictokens');
        }
      });

  }

  /**
   * Method to retrive the count and symbols of ERC-20 token, ERC-20 token commitments, ERC-721 token & ERC-721 token commitments.
   */
  getUserERC20AndERC721TokenCount() {
    const coins = this.accountService.getCoins();
    const tokenCount = this.accountService.getCount();
    const nftBalance = this.accountService.getNFTBalance();
    Observable.forkJoin([coins, tokenCount, nftBalance]).subscribe(
      responseList  => {
        console.log(responseList[2]);
        this.count = responseList[1]['data'];
        this.coinCount =  responseList[0]['data']['balance'];
        this.ftName = responseList[0]['data']['name'];
        localStorage.setItem('ftName', this.ftName);
        this.ftSymbol = responseList[0]['data']['symbol'];
        localStorage.setItem('ftSymbol', this.ftSymbol);
        this.nftBalance = parseInt(responseList[2]['data']['balance'], 16);
        this.nftName = responseList[2]['data']['nftName'];
        localStorage.setItem('nftName', this.nftName);
        this.nftSymbol = responseList[2]['data']['nftSymbol'];
        localStorage.setItem('nftSymbol', this.nftSymbol);
        console.log('this.count', this.count );
        console.log('this.coinCount', this.coinCount);
        this.isRequesting = false;
      },
      error => {
        this.isRequesting = false;
        console.log('error in user get', error);
      });
  }


  /**
   * Method to fetch the token transaction based on type user click on the tab.
   *
   * @param type {String} Possible types are tokens, publictokens, coins, publiccoins
   */
  getTransactions(type: string) {
    this.tokenTransactions = [];
    this.publicTokenTransactions = [];
    this.publicCoinTransactions = [];
    this.coinTransactions = [];

    this.pageNo = 1; // reset page number to 1
    this.isPagination = false;
    this.accountService.getTransactions(type, this.pageNo, this.pageSize).subscribe(
      data => {
        console.log('getTransactions', data);
        if (type === 'tokens') {
          this.currentType = 'tokens';
          this.tokenTransactions = data['data']['data'].length > 0 ? data['data']['data'] : [];
          const totalCount = parseInt(data['data']['totalCount'], 10);
          const totalPages = this.getTotalPages(totalCount);
          console.log('totalPages', totalPages);
          if (totalPages > 1) {
            this.isPagination = true;
          }
          this.totalCollection = Promise.resolve(totalCount); // should be a promise for ngb pagination component
        } else if (type === 'publictokens') {
          this.currentType = 'publictokens';
          this.publicTokenTransactions = data['data']['data'].length > 0 ? data['data']['data'] : [];
          const totalCount = parseInt(data['data']['totalCount'], 10);
          const totalPages = this.getTotalPages(totalCount);
          console.log('totalPages', totalPages);
          if (totalPages > 1) {
            this.isPagination = true;
          }
          this.totalCollection = Promise.resolve(totalCount); // should be a promise for ngb pagination component
        } else if (type === 'publiccoins') {
          this.currentType = 'publiccoins';
          this.publicCoinTransactions = data['data']['data'].length > 0 ? data['data']['data'] : [];
          const totalCount = parseInt(data['data']['totalCount'], 10);
          const totalPages = this.getTotalPages(totalCount);
          console.log('totalPages', totalPages);
          if (totalPages > 1) {
            this.isPagination = true;
          }
          this.totalCollection = Promise.resolve(totalCount); // should be a promise for ngb pagination component
        } else {
          this.currentType = 'coins';
          this.coinTransactions = data['data']['data'].length > 0 ? data['data']['data'] : [];
          const totalCount = parseInt(data['data']['totalCount'], 10);
          const totalPages = this.getTotalPages(totalCount);
          console.log('totalPages', totalPages);
          if (totalPages > 1) {
            this.isPagination = true;
          }
          this.totalCollection = Promise.resolve(totalCount); // should be a promise for ngb pagination component
        }
        console.log('this.this.coinTransactions', this.coinTransactions);
      },
      error => {
        console.log('error in user get', error);
      }
    );
  }

  /**
   * Method to find total pages.
   *
   * @param totalCount {Number} returns total pages
   */
  getTotalPages(totalCount) {
    const totalPages = Math.ceil(totalCount / this.pageSize);
    return totalPages;
  }

  /**
   * Method to retrive transactions based on pages.
   */
  getTransactionList(type, pageN, pageSize) {
    this.accountService.getTransactions(type, pageN, pageSize).subscribe(
      data => {
        console.log('getTransactions', data);
        if (type === 'tokens') {
          this.currentType = 'tokens';
          this.tokenTransactions = data['data']['data'].length > 0 ? data['data']['data'] : [];
        } else if (type === 'publictokens') {
          this.currentType = 'publictokens';
          this.publicTokenTransactions = data['data']['data'].length > 0 ? data['data']['data'] : [];
        } else if (type === 'publiccoins') {
          this.currentType = 'publiccoins';
          this.publicCoinTransactions = data['data']['data'].length > 0 ? data['data']['data'] : [];
        } else {
          this.currentType = 'coins';
          this.coinTransactions = data['data']['data'].length > 0 ? data['data']['data'] : [];
        }
      },
      error => {
        console.log('error in user get', error);
      }
    );
  }


  /**
   * Method to handle pagination.
   *
   * @param pageN {Number} Page number
   */
  pageChanged(pageN) {
    this.pageNo = pageN;
    this.getTransactionList(this.currentType, this.pageNo, this.pageSize);
  }

  /**
   * Method to retrive all users.
   *
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
