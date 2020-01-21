import { Component, OnInit, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import UserService from '../../services/user.service';
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
  providers: [UserService]
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
    private userService: UserService
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
  formatDataSource({ fTokenShields, nfTokenShields, selectedFTokenShield, selectedNFTokenShield  }) {
    const formatedData = [];
    nfTokenShields.map((item) => {
      const token721 =   {
            contractAdd: item.contractAddress,
            contractName: item.contractName,
            selection: (selectedNFTokenShield === item.contractAddress) ? true : false,
            tokenShield: true
        };
        formatedData.push(token721);
    });
    fTokenShields.map((item) => {
      const token20 =   {
            contractAdd: item.contractAddress,
            contractName: item.contractName,
            selection: (selectedFTokenShield === item.contractAddress) ? true : false,
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
    const selectedFTokenShield = userDetails.selectedFTokenShield;
    const selectedNFTokenShield = userDetails.selectedNFTokenShield;
    const formatedData = [];
    const token721 = {
      contractAdd: data.nftCommitmentShield.shieldAddress,
      contractName: data.nftCommitmentShield.name,
      get selection() {
        return (selectedNFTokenShield === this.contractAdd);
      },
      tokenShield: true,
      tokenAddress: nftContractDetails.nftAddress
    };
    const token20 = {
      contractAdd: data.ftCommitmentShield.shieldAddress,
      contractName: data.ftCommitmentShield.name,
      get selection() {
        return (selectedFTokenShield === this.contractAdd);
      },
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
    if (!this.isValidAccountForm(event.newData)) {
      this.toastr.error('Please fill all the fields.');
      event.confirm.reject(event.newData);
      return;
    }
    this.userService.addContractInfo(event.newData).subscribe((data) => {
      this.loadAccountDetails();
      event.confirm.resolve(event.newData);
    }, (error) => {
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
    if (!this.isValidAccountForm(event.newData)) {
      this.toastr.error('Please fill all the fields.');
      event.confirm.reject(event.newData);
      return;
    }
    this.userService.updateContractInfo(event.newData).subscribe((data) => {
      this.loadAccountDetails();
      event.confirm.resolve(event.newData);
    }, (error) => {
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
    if (!this.isValidAccountForm(event.data)) {
      this.toastr.error('Please fill all the fields.');
      event.confirm.reject(event.data);
      return;
    }
    this.userService.deleteContractInfo(event.data).subscribe((data) => {
      this.loadAccountDetails();
      event.confirm.resolve(event.data);
    }, (error) => {
      this.toastr.error('Please try again!');
      event.confirm.reject(event.data);
    });
  }

  /**
   * Method to populate existing shield contract addresses and its name in custom table.
   */
  loadAccountDetails() {
    const shieldDetails  = this.userService.getDefaultShieldAddress();
    const userContracts = this.userService.getUserDetails();
    const nftContract = this.userService.getNFTAddress();
    const ftContracts = this.userService.getFTAddress();
    Observable.forkJoin([shieldDetails, userContracts, nftContract, ftContracts]).subscribe(
      (response) => {
        const defaultContractDetails = response[0]['data'];
        const userContractDetails  = response[1]['data'];
        const nftContractDetails  = response[2]['data'];
        const ftContractDetails  = response[3]['data'];

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
    this.userService.getDefaultShieldAddress().subscribe(
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
