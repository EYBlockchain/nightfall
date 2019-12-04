import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import NftCommitmentService from '../../services/nft-commitment.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import UserService from '../../services//user.service';

/**
 * Burn private token component, which is used for rendering the page of burn ERC-721 commitment.
 */
@Component({
  selector: 'nft-commitment-burn',
  templateUrl: './index.html',
  providers: [NftCommitmentService, UserService],
  styleUrls: ['./index.css']
})
export default class NftCommitmentBurnComponent implements OnInit, AfterContentInit {
  /**
   * Transaction list
   */
  transactions: Array<Object>;
  /**
   * Selected Token List
   */
  selectedCommitmentList: any = [];
  /**
   * Used to identify the selected ERC-721 token commitment.
   */
  selectedCommitment: any;
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
   * Name of the receiver
   */
  receiverName: string;

  /**
   * Reference of combo box
   */
  @ViewChild('select') select: NgSelectComponent;

  constructor(
    private toastr: ToastrService,
    private nftCommitmentService: NftCommitmentService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit () {
    this.fetchTokens();
    this.nftName = localStorage.getItem('nftName');
    this.getAllRegisteredNames();
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
    const selectedCommitment = this.selectedCommitmentList[0];
    if (!selectedCommitment) {
      this.toastr.error('All fields are mandatory');
      return;
    }
    this.isRequesting = true;
    this.nftCommitmentService.burnNFTCommitment(
      selectedCommitment.token_id,
      selectedCommitment.token_uri,
      selectedCommitment.shield_contract_address,
      selectedCommitment.salt,
      selectedCommitment.token_commitment,
      selectedCommitment.token_commitment_index,
      this.receiverName
    ).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Token burned successfully.');
        transactions.splice(Number(index), 1);
        this.selectedCommitment = undefined;
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'nft-commitment' } });
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
    this.nftCommitmentService.getNFTCommitments(undefined, undefined)
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
   * Method will remove slected commitment.
   * @param item {Object} Item to be removed.
   */
  onRemove(item) {
    console.log('selected items', this.selectedCommitmentList, item);
    const newList = this.selectedCommitmentList.filter((it) => {
      return item._id !== it._id;
    });
    this.selectedCommitmentList = newList;
    console.log('selected new items', this.selectedCommitmentList);
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

}
