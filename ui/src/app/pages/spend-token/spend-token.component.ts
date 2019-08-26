import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TokenApiService } from '../../services/tokens/token-api.service';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import { UtilService } from '../../services/utils/util.service';
import { NgSelectComponent } from '@ng-select/ng-select';

/**
 *  Spend token component, which is used for rendering the page of transfer ERC-721 token commitment to the selected receipent.
 */
@Component({
  selector: 'app-spend-token',
  templateUrl: './spend-token.component.html',
  providers: [TokenApiService, AccountsApiService, UtilService],
  styleUrls: ['./spend-token.component.css']
})
export class SpendTokenComponent implements OnInit, AfterContentInit {

  /**
   *  To store ERC-721 token commitment transaction objects
   */
  transactions: Array<Object>;

  /**
   * Selected Token List
   */
  selectedTokenList: any = [];

  /**
   * To store the selected ERC-721 token commitment.
   */
  selectedToken: any;

  /**
   * Name of the transferee
   */
  receiverName: string;

  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * To identify the index of selected ERC-721 commitment.
   */
  index: string;

  /**
   * To store all users
   */
  users: any;

  /**
   * Total collection of objects to calculate pages for pagination.
   */
  totalCollection: Promise<number>;

  /**
   * Non Fungeble Token name , read from ERC-721 contract.
   */
  nftName: string;

  /**
   * Reference of combo box
   */
  @ViewChild('select') select: NgSelectComponent;

  constructor(
    private toastr: ToastrService,
    private tokenApiService: TokenApiService,
    private accountApiService: AccountsApiService,
    private utilService: UtilService,
    private router: Router
  ) {}

  ngOnInit () {
    this.getUsers();
    this.fetchTokens();
    this.nftName = localStorage.getItem('nftName');
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.select.filterInput.nativeElement.focus();
    }, 500);
  }

  /**
   * Method to transfer ERC-721 token commitement to selected user.
   */
  initiateSpend () {
    const {
      receiverName,
      index,
      transactions
    } = this;
    const selectedToken = this.selectedTokenList[0];
    if (!selectedToken || !receiverName) {
      this.toastr.error('All fields are mandatory');
      return;
    }

    this.isRequesting = true;
    this.tokenApiService.spendToken(
      selectedToken.token_id,
      selectedToken.token_uri,
      selectedToken.salt,
      selectedToken.token_commitment,
      localStorage.getItem('secretkey'),
      this.receiverName,
      selectedToken.token_commitment_index
    ).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Transfer to Recipient ' + receiverName);
        transactions.splice(Number(index), 1);
        this.selectedToken = undefined;
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'tokens' } });
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

  /**
   * Method to retrive all users.
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
   * Method list down all ERC-721 token commitments.
   */
  fetchTokens () {
    this.transactions = null;
    this.isRequesting = true;
    this.tokenApiService.fetchTokens(undefined, undefined)
    .subscribe( data => {
      this.isRequesting = false;
      if (data &&
        data['data'] &&
        data['data'].length) {
        this.transactions = data['data'];
      }
    }, error => {
      this.isRequesting = false;
      this.toastr.error('Please try again.', error);
    });
  }

  /**
   * Method to set new coin list in select box, on removing.
   * @param item {Object} Item to be removed.
   */
  onRemove(item) {
    console.log('selected items', this.selectedTokenList, item);
    const newList = this.selectedTokenList.filter((it) => {
      return item._id !== it._id;
    });
    this.selectedTokenList = newList;
    console.log('selected new items', this.selectedTokenList);
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
    term = term.toLowerCase();
    const itemToSearch = item.token_uri.toString().toLowerCase();
    return itemToSearch.indexOf(term) > -1;
  }

}
