import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import FtCommitmentService from '../../services/ft-commitment.service';
import UserService from '../../services/user.service';
import { UtilService } from '../../services/utils/util.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms'

/**
 *  ft-commitment trasfer component, which is used for rendering the page of transfer ERC-20 token commitments to the selected receipent.
 */
@Component({
  selector: 'ft-batch-commitment-transfer',
  templateUrl: './index.html',
  providers: [FtCommitmentService, UserService, UtilService],
  styleUrls: ['./index.css']
})

export default class FtBatchCommitmentTrasnferComponent implements OnInit , AfterContentInit {

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
  transferValue: number;

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
   * To store all transferror and value
   */
  transferDetails: FormArray;

  addRowExceed: boolean = false;

  addForm: FormGroup;
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
    this.getAllRegisteredNames();
    this.getFTCommitments();
    this.addForm.addControl('rows', this.transferDetails);
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.select.filterInput.nativeElement.focus();
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
        console.log(data['data']);
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
    const count = this.selectedCommitmentList.length;
    console.log('count', count, this.selectedCommitmentList);
    if (!count || count !== 2) {
      this.toastr.error('Invalid commitment Selection.');
      return;
    }
    const [coin1, coin2] = this.selectedCommitmentList;
    const {
      transferValue,
      transactions
    } = this;

    if (!transferValue || !this.receiverName) {
      this.toastr.error('All fields are mandatory');
      return;
    }

    this.isRequesting = true;
    let returnValue = Number(coin1['ft_commitment_value']) + Number(coin2['ft_commitment_value']);
    returnValue -= transferValue;
    console.log('RETURNVALUE', returnValue, transferValue, this.toHex(returnValue), this.toHex(transferValue));

    this.ftCommitmentService.transferFTCommitment(
      coin1['ft_commitment_value'],
      coin2['ft_commitment_value'],
      this.toHex(transferValue),
      this.toHex(returnValue),
      coin1['salt'],
      coin2['salt'],
      coin1['ft_commitment_index'],
      coin2['ft_commitment_index'],
      coin1['ft_commitment'],
      coin2['ft_commitment'],
      localStorage.getItem('publickey'),
      this.receiverName
    ).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Transfer to Receiver ' + this.receiverName);
        transactions.splice(Number(coin1['id']), 1);
        transactions.splice(Number(coin2['id']) - 1, 1);
        this.getFTCommitments();
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'ft-commitment' } });
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
    console.log('selected items', this.selectedCommitmentList, item);
    const newList = this.selectedCommitmentList.filter((it) => {
      return item._id !== it._id;
    });
    this.selectedCommitmentList = newList;
    console.log('selected new items', this.selectedCommitmentList);
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
    const itemToSearch = this.utilService.convertToNumber(item.ft_commitment_value).toString().toLocaleLowerCase();
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
   * Method to show inputs to add new ft commitment trnasfer information
   *
   * @param event {Event} Event
   */
  addTransferInfo(event){
    this.transferDetails.push(this.createItemFormGroup());
    if(this.transferDetails.value && this.transferDetails.value.length >= 20){
      this.addRowExceed = true;
    }
  }

  /**
   * Method to add a row with ft commitment trnasfer information
   *
   * @param event {Event} Event
   */
  addTransferInfoComplete(event){
    console.log(this.transferDetails.value);
  }

  /**
   * Method to remove a row with ft commitment trnasfer information
   *
   * @param index {Number} Number
   */
  removeTransferInfo(index: number){
    this.transferDetails.removeAt(index);
    if(this.transferDetails.value && this.transferDetails.value.length >= 20){
      this.addRowExceed = true;
    }
  }

  createItemFormGroup(): FormGroup {
    return this.formBuilder.group({
      transferValue: null,
      receiverName: null
    });
  }

}
