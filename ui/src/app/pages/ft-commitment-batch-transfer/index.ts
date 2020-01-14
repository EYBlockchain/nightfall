import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import FtCommitmentService from '../../services/ft-commitment.service';
import UserService from '../../services/user.service';
import { UtilService } from '../../services/utils/util.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';

/**
 *  ft-commitment trasfer component, which is used for rendering the page of transfer ERC-20 token commitments to the selected receipent.
 */
@Component({
  selector: 'app-ft-commitment-batch-transfer',
  templateUrl: './index.html',
  providers: [FtCommitmentService, UserService, UtilService],
  styleUrls: ['./index.css']
})

export default class FtCommitmentBatchTrasnferComponent implements OnInit , AfterContentInit {

  /**
   *  To store ERC-20 token commitment transaction objects
   */
  transactions: Array<Object>;

  /**
   * To store the selected ERC-20 token commitments
   */
  selectedCommitmentList: any = [];

  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * Amount to transfer
   */
  batchTransactions: any;

  /**
   * To store all users
   */
  users: any;

  /**
   * Name of the receiver
   */
  receiverName: string;

  /**
   *  Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;

  /**
   *  Fungeble Token Symbol , read from ERC-20 contract.
   */
  ftSymbol: string;

  /**
   * To store all transferror and value
   */
  transferDetails: FormArray;

  addForm: FormGroup;

  transferData: any;
  /**
   * Reference of combo box
   */
  @ViewChild('select') select: NgSelectComponent;

  constructor(
    private toastr: ToastrService,
    private ftCommitmentService: FtCommitmentService,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {

    this.customSearchFn = this.customSearchFn.bind(this);
    this.addForm = this.formBuilder.group({
      transfers: []
    });
    this.transferDetails = this.formBuilder.array([]);
  }

  ngOnInit () {
    this.ftName = localStorage.getItem('ftName');
    this.ftSymbol = localStorage.getItem('ftSymbol');
    this.getAllRegisteredNames();
    this.getFTCommitments();
    this.addForm.addControl('rows', this.transferDetails);
    this.transferDetails.push(this.createItemFormGroup());
  }

  ngAfterContentInit() {
    setTimeout(() => {
      if (this.select) {
        this.select.filterInput.nativeElement.focus();
      }
    }, 500);
  }

  /**
   * Method list down all ERC-20 commitments.
   */
  getFTCommitments() {
    this.isRequesting = true;
    this.ftCommitmentService.getFTCommitments()
      .subscribe(
        (data) => {
        this.isRequesting = false;
        if (data && data['data'].length ) {
          this.transactions = data['data'].map((tx, indx) => {
            tx.selected = false;
            tx.id = indx;
            return tx;
          });
        }
      }, (error) => {
        console.log('error', error);
        this.isRequesting = false;
      });
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
   * Method to transfer two ERC-20 token commitement to selected user.
   */
  initiateTransfer () {
    let emptyInputFlag: boolean;
    const count = this.selectedCommitmentList.length;
    if (!count || count !== 1) {
      this.toastr.error('Invalid commitment Selection.');
      return;
    }
    this.transferData = this.transferDetails.value.map(({value, receiverName}) => {
      if (value == null || receiverName == null) {
        emptyInputFlag = true;
      } else {
        if (value != null) {
          return {
            value: this.toHex(value),
            receiver: { name: receiverName },
          };
        }
      }
    });
    const { transactions } = this;
    if (emptyInputFlag === true) {
      this.toastr.error('All fields are mandatory');
      return;
    }
    this.isRequesting = true;
    const [commitment] = this.selectedCommitmentList;
    // const transactionId = this.batchTransactions['id'];
    this.ftCommitmentService.transferFTBatchCommitment(
      this.selectedCommitmentList[0],
      this.transferData,
    ).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Transferred to selected receivers');
        transactions.splice(commitment.id, 1);
        this.getFTCommitments();
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'ft-batch-commitment' } });
      }, ({error}) => {
        this.isRequesting = false;
        if (error.error && error.error.message) {
          this.toastr.error(error.error.message, 'Error');
        } else {
          this.toastr.error('Please try again', 'Error');
        }
    });
  }

  /**
   * Method unset the selected commitment.
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
    term = term.toLocaleLowerCase();
    const itemToSearch = this.utilService.convertToNumber(item.value).toString().toLocaleLowerCase();
    return itemToSearch.indexOf(term) > -1;
  }

  /**
   * Method to convert number to hex string
   *
   * @param num {Number} Number
   */
  toHex(num: number) {
    if (!num || isNaN(num)) {
      num = 0;
    }
    const hexValue = (num).toString(16);
    return '0x' + hexValue.padStart(32, '0');
  }
  /**
   * Method to return the value to and reveiver name updated in form
   */
  createItemFormGroup(): FormGroup {
    return this.formBuilder.group({
      value: null,
      receiverName: null
    });
  }

  /**
   * Method to show inputs to add new ft commitment trnasfer information
   *
   * @param event {Event} Event
   */
  addTransferInfo(event) {
    this.transferDetails.push(this.createItemFormGroup());
  }

  /**
   * Method to remove a row with ft commitment trnasfer information
   *
   * @param index {Number} Number
   */
  removeTransferInfo(index: number) {
    this.transferDetails.removeAt(index);
  }
}
