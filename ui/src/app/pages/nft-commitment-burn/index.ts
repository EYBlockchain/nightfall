import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import NftCommitmentService from '../../services/nft-commitment.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import UserService from '../../services//user.service';
import { toastrConfig } from '../../config/config';

/**
 * Burn private token component, which is used for rendering the page of burn ERC-721 commitment.
 */
@Component({
  selector: 'app-nft-commitment-burn',
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
      this.select.focus();
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
      this.toastr.warning('All fields are mandatory.', 'Warning');
      return;
    }
    this.isRequesting = true;
    this.nftCommitmentService.burnNFTCommitment(
      selectedCommitment,
      this.receiverName,
    ).subscribe( data => {
        this.isRequesting = false;
        this.toastr.show(`Burning non-fungible token commitment.`, '', toastrConfig, 'burnNFTCommitment');

        // delete used commitment from commitment list
        transactions.splice(transactions.indexOf(selectedCommitment), 1);
        this.transactions = [ ...this.transactions ];

        // reset the form
        this.selectedCommitmentList = [];
        this.receiverName = null;

        // navigate to overview page if no more commitment left
        if (!transactions.length) {
          this.router.navigate(['/overview'], { queryParams: { selectedTab: 'nft-commitment' } });
        }
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again.', 'Error');
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
      this.toastr.error('Please Enter a valid SKU.', 'Error');
    });
  }

  /**
   * Method will remove slected commitment.
   * @param item {Object} Item to be removed.
   */
  onRemove(item) {
    const newList = this.selectedCommitmentList.filter((it) => {
      return item._id !== it._id;
    });
    this.selectedCommitmentList = newList;
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
