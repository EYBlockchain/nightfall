import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import NftService from '../../services/nft.service';
import UserService from '../../services/user.service';
import { NgSelectComponent } from '@ng-select/ng-select';

/**
 *  Spend public token component, which is used for rendering the page of transfer ERC-721 token to the selected receipent.
 */
@Component({
  selector: 'app-nft-transfer',
  templateUrl: './index.html',
  providers: [NftService, UserService],
  styleUrls: ['./index.css']
})
export default class NftTransferComponent implements OnInit, AfterContentInit {

  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * To store all users
   */
  users;

  /**
   * Name of the receiver
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
    private nftService: NftService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
     this.getAllRegisteredNames();
     this.getNFTokens();
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
  getAllRegisteredNames() {
    this.isRequesting = true;
    this.userService.getAllRegisteredNames().subscribe(
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
    const receiver = {
      name: this.receiverName
    };
    this.nftService.transferNFToken(this.selectedToken, receiver).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Transfer to Receiver ' + this.receiverName);
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'nft' } });
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', error);
    });
  }

  /**
   * Method list down all ERC-721 tokens.
   */
  getNFTokens() {
    this.nftService.getNFTokens().subscribe( (data: any) => {
      this.isRequesting = false;
      this.tokenList = data['data'];
    }, error => {
      this.isRequesting = false;
      console.log('getNFTokens error', error);
  });
  }


  /**
   * Method will remove selected token.
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
