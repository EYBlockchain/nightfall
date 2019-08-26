import { Component, OnInit} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CoinApiService } from '../../services/coins/coin-api.service';
import { Router } from '@angular/router';
import { UtilService } from '../../services/utils/util.service';
/**
 * Mint public coin component, which is used for rendering the page of mint ERC-20 token.
 */
@Component({
  selector: 'app-mint-public-coin',
  templateUrl: './mint-public-coin.component.html',
  providers: [CoinApiService, UtilService],
  styleUrls: ['./mint-public-coin.component.css']
})
export class MintPublicCoinComponent implements OnInit {

  /**
   * Flag for http request
   */
  isRequesting = false;

   /**
   * Amount to Mint ERC-20 token
   */
  amount: number;

  /**
   * Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;

  constructor(
    private toastr: ToastrService,
    private coinApiService: CoinApiService,
    private utilService: UtilService,
    private router: Router
  ) {

  }

  ngOnInit () {
    this.ftName = localStorage.getItem('ftName');
  }

  /**
   * Method to mint ERC-20 token.
   */
  mintPublicCoin() {
    this.isRequesting = true;
    this.coinApiService.mintPublicCoin(localStorage.getItem('address'), this.amount).subscribe(transaction => {
      this.isRequesting = false;
      this.toastr.success('Public coin minted successfully.');
      this.router.navigate(['/overview'], { queryParams: { selectedTab: 'publiccoins' } });
    }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

}

