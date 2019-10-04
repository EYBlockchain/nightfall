import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CoinApiService } from '../../services/coins/coin-api.service';
import { UtilService } from '../../services/utils/util.service';

/**
 * Component for listing all ERC-20 commitments
 */
@Component({
  selector: 'app-coin-list',
  templateUrl: './coin-list.component.html',
  styleUrls: ['./coin-list.component.css'],
  providers: [CoinApiService, UtilService]
})
export class CoinListComponent implements OnInit {
/**
 *  Transaction list
 */
  transactions: any;
  /**
   * Flag for http request
   */
  isRequesting = false;
  /**
   * If no coins are available, set this property as false;
   */
  noCoin = false;
  /**
   * Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;

  constructor(
    private toastr: ToastrService,
    private coinApiService: CoinApiService,
    private utilService: UtilService,
  ) { }

  ngOnInit() {
    this.ftName = localStorage.getItem('ftName');
    this.fetchCoins();
  }


  /**
   * Method list down all ERC-20 commitments.
   */
  fetchCoins () {
    this.transactions = null;
    this.isRequesting = true;
    this.coinApiService.fetchCoins()
      .subscribe( data => {
        this.isRequesting = false;
        if (data &&
          data['data']) {
          this.transactions = data['data'].map((tx, indx) => {
            tx.selected = false;
            tx.id = indx;
            return tx;
          });
        } else {
          this.noCoin = true;
          // this.toastr.error('No Coin found.');
        }
      }, error => {
        this.isRequesting = false;
      });
  }


}
