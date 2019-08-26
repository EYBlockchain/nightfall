import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TokenApiService } from '../../services/tokens/token-api.service';
import { UtilService } from '../../services/utils/util.service';
import { NgSelectComponent } from '@ng-select/ng-select';

/**
 *  Mint token component, which is used for rendering the page of Mint ERC-721 token commitment.
 */
@Component({
  selector: 'app-mint-token',
  templateUrl: './mint-token.component.html',
  providers: [TokenApiService, UtilService],
  styleUrls: ['./mint-token.component.css']
})
export class MintTokensComponent implements OnInit, AfterContentInit {

  /**
   * To store the random hex string.
   */
  serialNumber = '';
  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * Selected Token List
   */
  selectedTokenList: any = [];
  /**
   * To store user selected token.
   */
  selectedToken;

  /**
   * To store ERC-721 tokens
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
    private utilService: UtilService,
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
   * Method to mint ERC-721 token commitment.
   */
  mintToken() {
      this.isRequesting = true;
      this.selectedToken = this.selectedTokenList[0];
      this.tokenApiService.mintToken(this.selectedToken).subscribe(tokenDetails => {
        console.log('Token Minted is ' + tokenDetails['data']['z_A']);
        this.isRequesting = false;
        this.toastr.success('Token Minted is ' + tokenDetails['data']['z_A'].slice(0, 20) + '...');
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'tokens' } });
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
    term = term.toLocaleLowerCase();
    const itemToSearch = item.uri.toString().toLocaleLowerCase();
    return itemToSearch.indexOf(term) > -1;
  }


  /**
   * Method to list down all ERC-721 tokens.
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

}
