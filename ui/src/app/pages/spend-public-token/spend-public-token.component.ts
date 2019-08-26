import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TokenApiService } from '../../services/tokens/token-api.service';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import { NgSelectComponent } from '@ng-select/ng-select';

/**
 *  Spend public token component, which is used for rendering the page of transfer ERC-721 token to the selected receipent.
 */
@Component({
  selector: 'app-spend-public-token',
  templateUrl: './spend-public-token.component.html',
  providers: [TokenApiService, AccountsApiService],
  styleUrls: ['./spend-public-token.component.css']
})
export class SpendPublicTokenComponent implements OnInit, AfterContentInit {

  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * To store all users
   */
  users;

  /**
   * Name of the transferee
   */
  receiverName;

  /**
   * To store ERC-721 tokens
   */
  tokenList: any = [];

  /**
   * Selected Token List
   */
  selectedTokenList: any = [];

  /**
   * To store the selected ERC-721 token.
   */
  selectedToken: any;

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
    private router: Router
  ) { }

  ngOnInit() {
     this.getUsers();
     this.getTokenList();
     this.nftName = localStorage.getItem('nftName');
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.select.filterInput.nativeElement.focus();
    }, 500);
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
   * Method to transfer ERC-721 token to selected user.
   */
  transferToken () {
    this.isRequesting = true;
    console.log('selectedToken', this.selectedToken);
    this.selectedToken = this.selectedTokenList[0];
    this.tokenApiService.transferNFToken(this.selectedToken, this.receiverName).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Transfer to Recipient ' + this.receiverName);
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'publictokens' } });
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', error);
    });
  }

  /**
   * Method list down all ERC-721 tokens.
   */
  getTokenList() {
    this.tokenApiService.getNFTTokens().subscribe( (data: any) => {
      this.isRequesting = false;
      this.tokenList = data['data'];
    }, error => {
      this.isRequesting = false;
      console.log('getTokenList error', error);
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
    const itemToSearch = item.uri.toString().toLowerCase();
    return itemToSearch.indexOf(term) > -1;
  }


}
