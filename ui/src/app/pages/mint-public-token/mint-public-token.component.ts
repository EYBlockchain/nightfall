import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TokenApiService } from '../../services/tokens/token-api.service';

/**
 * Mint public token component, which is used for rendering the page of mint ERC-721 token.
 */
@Component({
  selector: 'app-mint-public-token',
  templateUrl: './mint-public-token.component.html',
  providers: [TokenApiService],
  styleUrls: ['./mint-public-token.component.css']
})
export class MintPublicTokenComponent implements OnInit {

  /**
   * For ERC-721 token name
   */
  tokenURI: string;
  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * Non Fungeble Token name , read from ERC-721 contract.
   */
  nftName: string;

  constructor(
    private toastr: ToastrService,
    private tokenApiService: TokenApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.nftName = localStorage.getItem('nftName');
  }

  /**
   * Method to mint ERC-721 token.
   */
  mintToken() {
      this.isRequesting = true;
      this.tokenApiService.mintNFToken(this.tokenURI).subscribe(tokenDetails => {
        this.isRequesting = false;
        this.toastr.success('Token Minted is Successfully');
        this.tokenURI = undefined;
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'publictokens' } });
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

}
