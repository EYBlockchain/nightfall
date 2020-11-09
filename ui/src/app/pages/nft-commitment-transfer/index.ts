import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import NftCommitmentService from '../../services/nft-commitment.service';
import UserService from '../../services/user.service';
import { UtilService } from '../../services/utils/util.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { toastrConfig } from '../../config/config';

/**
 *  Spend token component, which is used for rendering the page of transfer ERC-721 token commitment to the selected receipent.
 */
@Component({
  selector: 'app-nft-commitment-transfer',
  templateUrl: './index.html',
  providers: [NftCommitmentService, UserService, UtilService],
  styleUrls: ['./index.css']
})
export default class NftCommitmentTransferComponent implements OnInit, AfterContentInit {

  /**
   *  To store ERC-721 token commitment transaction objects
   */
  transactions: Array<Object>;

  /**
   * Selected Token List
   */
  selectedCommitmentList: any = [];

  /**
   * To store the selected ERC-721 token commitment.
   */
  selectedCommitment: any;

  /**
   * Name of the receiver
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
    private nftCommitmentService: NftCommitmentService,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router
  ) {}

  ngOnInit () {
    this.getAllRegisteredNames();
    this.fetchTokens();
    this.nftName = localStorage.getItem('nftName');
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.select.focus();
    }, 500);
  }

  /**
   * Method to transfer ERC-721 token commitement to selected user.
   */
  initiateSpend () {
    const {
      receiverName,
      transactions
    } = this;
    const selectedCommitment = this.selectedCommitmentList[0];
    if (!selectedCommitment || !receiverName) {
      this.toastr.warning('All fields are mandatory', 'Warning');
      return;
    }

    this.isRequesting = true;
    this.nftCommitmentService.transferNFTCommitment(
      selectedCommitment,
      this.receiverName,
    ).subscribe( data => {
        this.isRequesting = false;

        this.toastr.show(`Transferring non-fungible token commitment to ${receiverName}.`, '', toastrConfig, 'transferNFTCommitment');

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
   * Method to retrive all users.
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
   * Method list down all ERC-721 token commitments.
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
      this.toastr.error('Please try again.', 'Error');
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
