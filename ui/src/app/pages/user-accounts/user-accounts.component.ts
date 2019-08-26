import { Component, OnInit, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AccountsApiService } from '../../services/accounts/accounts-api.service';
import { CoinApiService } from '../../services/coins/coin-api.service';
import {Config} from '../../config/config';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { CustomSelectionComponent } from './custom-selection-component';
import { CustomTextComponent } from './custom-text-component';
import { LocalDataSource } from 'ng2-smart-table';

/**
 * Component to show the user linked sheild contarct addresses and its names.
 */
@Component({
  selector: 'app-user-accounts',
  templateUrl: './user-accounts.component.html',
  styleUrls: ['./user-accounts.component.css'],
  providers: [AccountsApiService, CoinApiService]
})
export class UserAccountsComponent extends Config implements OnInit {

  /**
   * Flag for http request status
   */
  isRequesting =  false;

  /**
   * Data source object of custom table component.
   */
  source: LocalDataSource;

  /**
   * Default Shield contract details.
   */
  defaultContractDetails: any;


  formatedDefaultData: any;

  formatedData: any;

  /**
   * Configuration of custom table.
   */
  settings = {
    columns: {
      contractAdd: {
        type: 'custom',
        title: 'Shield Contract Address',
        filter: false,
        renderComponent: CustomTextComponent,
      },
      contractName: {
        title: 'Contract Name',
        filter: false
      },
      selection: {
        title: 'Selection',
        type: 'custom',
        class: 'selection-checkbox',
        editor: {
          type: 'checkbox'
        },
        filter: false,
        renderComponent: CustomSelectionComponent
      }
    },
    noDataMessage: 'No linked shield contract addresses are available.',
    pager: {
      display: false
    },
    add: {
      addButtonContent: '',
      createButtonContent: '',
      cancelButtonContent: '',
      confirmCreate: true,
    },
    edit: {
      editButtonContent: '',
      saveButtonContent: '',
      cancelButtonContent: '',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent	: '',
      confirmDelete: true,
    }
  };

  /**
   *  Event emitter to detect, when default account data is populated in UI.
   */
  public onChange: EventEmitter<any> = new EventEmitter<any>();

  /**
   * To store the subscription object.
   */
  private _serviceSubscription;

  constructor(
    private toastr: ToastrService,
    private accountService: AccountsApiService
  ) {
    super('');
    this.source = new LocalDataSource();
    this.loadAccountDetails();
  }

  ngOnInit() {
    this._serviceSubscription = this.onChange.subscribe({
      next: (event: any) => {
          console.log(`Received message #${event.message}`);
          const rows = Array.from(document.querySelectorAll('.ng2-smart-actions'));
          rows.forEach((item: HTMLElement, key) => {
            if (key !== 0) {
              item.innerHTML = '<b>Default</b>';
            }
          });
      }
    });
  }


  /**
   * Method to format the data in the accepted format for the custom table.
   *
   * @param data {Object} Unformated data source
   */
  formatDataSource(data) {
    const coin_shield_contracts = data.coin_shield_contracts || [];
    const token_shield_contracts = data.token_shield_contracts || [];
    const selected_coin_shield_contract = data.selected_coin_shield_contract;
    const selected_token_shield_contract = data.selected_token_shield_contract;
    const formatedData = [];
    token_shield_contracts.map((item) => {
      const token721 =   {
            contractAdd: item.contract_address,
            contractName: item.contract_name,
            selection: (selected_token_shield_contract === item.contract_address) ? true : false,
            tokenShield: true
        };
        formatedData.push(token721);
    });
    coin_shield_contracts.map((item) => {
      const token20 =   {
            contractAdd: item.contract_address,
            contractName: item.contract_name,
            selection: (selected_coin_shield_contract === item.contract_address) ? true : false,
            coinShield: true
        };
        formatedData.push(token20);
    });


    return formatedData.reverse();
  }

  /**
   * Method to format the default shield contract data in the accepted format for the custom table.
   *
   * @param data {Object} Unformated data source
   */
  formatDefaultShieldContractData(data,
    userDetails,
    nftContractDetails,
    ftContractDetails) {
    const selected_coin_shield_contract = userDetails.selected_coin_shield_contract;
    const selected_token_shield_contract = userDetails.selected_token_shield_contract;
    const formatedData = [];
    const token721 = {
      contractAdd: data.tokenShield.contract_address,
      contractName: data.tokenShield.contract_name,
      selection: (!selected_token_shield_contract || selected_token_shield_contract === data.tokenShield.contract_address) ? true : false,
      tokenShield: true,
      tokenAddress: nftContractDetails.nftAddress
    };
    const token20 = {
      contractAdd: data.coinShield.contract_address,
      contractName: data.coinShield.contract_name,
      selection: (!selected_coin_shield_contract || selected_coin_shield_contract === data.coinShield.contract_address) ? true : false,
      coinShield: true,
      tokenAddress: ftContractDetails.ftAddress
    };
    formatedData.push(token20, token721);
    return formatedData;
  }

  /**
   * Method to add new shield contract address and its name.
   *
   * @param event {Object} New eneterd data
   */
  addAccount(event) {
    console.log('addAccount', event.newData);
    if (!this.isValidAccountForm(event.newData)) {
      this.toastr.error('Please fill all the fields.');
      event.confirm.reject(event.newData);
      return;
    }
    this.accountService.addContractAddress(event.newData).subscribe((data) => {
      this.loadAccountDetails();
      event.confirm.resolve(event.newData);
    }, (error) => {
      console.log('addAccount error ', error);
      this.toastr.error('Please try again!');
      event.confirm.reject(event.newData);
    });
  }

  /**
   * Method to edit shield contract address and its name.
   *
   * @param event {Object} edited data
   */
  editAccount(event) {
    console.log('edit', event);
    console.log('addAccount', event.newData);
    if (!this.isValidAccountForm(event.newData)) {
      this.toastr.error('Please fill all the fields.');
      event.confirm.reject(event.newData);
      return;
    }
    this.accountService.updateContractAccounts(event.newData).subscribe((data) => {
      this.loadAccountDetails();
      event.confirm.resolve(event.newData);
    }, (error) => {
      console.log('edit error ', error);
      this.toastr.error('Please try again!');
      event.confirm.reject(event.newData);
    });
  }

  /**
   * Method to delete shield contract address and its name.
   *
   * @param event {Object} data to delete
   */
  deleteAccount(event) {
    console.log('delete', event);
    if (!this.isValidAccountForm(event.data)) {
      this.toastr.error('Please fill all the fields.');
      event.confirm.reject(event.data);
      return;
    }
    this.accountService.deleteContractAddress(event.data).subscribe((data) => {
      this.loadAccountDetails();
      event.confirm.resolve(event.data);
    }, (error) => {
      console.log('edit error ', error);
      this.toastr.error('Please try again!');
      event.confirm.reject(event.data);
    });
  }

  /**
   * Method to populate existing shield contract addresses and its name in custom table.
   */
  loadAccountDetails() {
    const shieldDetails  = this.accountService.getDefaultShieldAddress();
    const userContracts = this.accountService.getUser();
    const nftContract = this.accountService.getNFTAddress();
    const ftContracts = this.accountService.getFTAddress();
    Observable.forkJoin([shieldDetails, userContracts, nftContract, ftContracts]).subscribe(
      (response) => {
        const defaultContractDetails = response[0]['data'];
        const userContractDetails  = response[1]['data'];
        const nftContractDetails  = response[2]['data'];
        const ftContractDetails  = response[3]['data'];

        console.log(response[2], response[3]);
        this.formatedDefaultData = this.formatDefaultShieldContractData(
          defaultContractDetails,
          userContractDetails,
          nftContractDetails,
          ftContractDetails);
        this.formatedData = this.formatDataSource(userContractDetails);
        this.source.load(this.formatedData );

      },
      (error) => {
        console.log('error', error);
      }
    );
  }

  /**
   * Method to get the default shield contract details.
   */
  getDefaultShieldContractDetails() {
    this.accountService.getDefaultShieldAddress().subscribe(
      (data: any) => {
        this.defaultContractDetails = data['data'];
    }, (error) => {
      console.log('error', error);
    });
  }

  /**
   * Method to validate the account object.
   *
   * @param account {Object} Account object
   */
  isValidAccountForm(account) {
    if (account.contractAdd && account.contractName) {
        return true;
    }
    return false;
  }

  /**
   * Destory lifecycle hook to clean up subscriptions.
   */
  ngDestroy() {
    this._serviceSubscription.unsubscribe();
  }


}
