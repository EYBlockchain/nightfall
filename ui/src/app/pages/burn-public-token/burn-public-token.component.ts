import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TokenApiService } from '../../services/tokens/token-api.service';
import { NgSelectComponent } from '@ng-select/ng-select';

/**
 * Burn public token component, which is used for rendering the page of burn ERC-721 token.
 */
@Component({
  selector: 'app-burn-public-token',
  templateUrl: './burn-public-token.component.html',
  providers: [TokenApiService],
  styleUrls: ['./burn-public-token.component.css']
})

export class BurnPublicTokenComponent implements OnInit , AfterContentInit {

  /**
   * Selected Token List
   */
  selectedTokenList: any = [];
  /**
   * Used to identify the selected ERC-721 token.
   */
  selectedToken;

  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   *  List of all ERC-721 tokens.
   */
  tokenList: any = [];

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
    private router: Router
  ) { }

  ngOnInit() {
    this.getTokenList();
    this.nftName = localStorage.getItem('nftName');
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.select.filterInput.nativeElement.focus();
    }, 500);
  }

  /**
   * Method to burn ERC721 token
   */
  burnToken () {
    this.isRequesting = true;
    this.selectedToken = this.selectedTokenList[0];
    this.tokenApiService.burnNFToken(this.selectedToken).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Burn Successful');
        this.selectedToken = undefined;
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'publictokens' } });
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

  /**
   * Method to list down all ERC-721 tokens.
   */
  getTokenList() {
    this.tokenApiService.getNFTTokens().subscribe( (data: any) => {
      this.isRequesting = false;
      this.tokenList = data['data'];
      console.log('getTokenList', data);

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
