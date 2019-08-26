import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { TokenApiService } from '../../services/tokens/token-api.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';

/**
 * Burn private token component, which is used for rendering the page of burn ERC-721 commitment.
 */
@Component({
  selector: 'app-burn-token',
  templateUrl: './burn-token.component.html',
  providers: [TokenApiService, AccountsApiService],
  styleUrls: ['./burn-token.component.css']
})
export class BurnTokenComponent implements OnInit, AfterContentInit {
  /**
   * Transaction list
   */
  transactions: Array<Object>;
  /**
   * Selected Token List
   */
  selectedTokenList: any = [];
  /**
   * Used to identify the selected ERC-721 token commitment.
   */
  selectedToken: any;
  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * To identify the index of selected ERC-721 token commitment.
   */
  index: string;

  /**
   * Non Fungeble Token name , read from ERC-721 contract.
   */
  nftName: string;

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
    private tokenApiService: TokenApiService,
    private accountApiService: AccountsApiService,
    private router: Router
  ) {}

  ngOnInit () {
    this.fetchTokens();
    this.nftName = localStorage.getItem('nftName');
    this.getUsers();
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.select.filterInput.nativeElement.focus();
    }, 500);
  }

  /**
   * Method to burn private ERC-721 token.
   */
  initiateBurn () {
    const {
      index,
      transactions
    } = this;
    const selectedToken = this.selectedTokenList[0];
    if (!selectedToken) {
      this.toastr.error('All fields are mandatory');
      return;
    }
    this.isRequesting = true;
    this.tokenApiService.burnToken(
      selectedToken.token_id,
      selectedToken.token_uri,
      selectedToken.salt,
      selectedToken.token_commitment,
      localStorage.getItem('secretkey'),
      selectedToken.token_commitment_index,
      this.receiverName
    ).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Token burned successfully.');
        transactions.splice(Number(index), 1);
        this.selectedToken = undefined;
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'tokens' } });
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

  /**
   * Method to list down all private ERC-721 tokens.
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
      this.toastr.error('Please Enter a valid SKU.', error);
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
   * For implementing type ahead feature, this method will be called for searching
   * the user entered item from the list of items.
   *
   * @param term User want to search
   * @param item selected item.
   */
  customSearchFn(term: string, item: any) {
    if (!item) {
      return;
    }
    term = term.toLocaleLowerCase();
    const itemToSearch = item.token_uri.toLowerCase();
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
