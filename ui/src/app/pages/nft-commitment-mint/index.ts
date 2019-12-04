import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import NftCommitmentService from '../../services/nft-commitment.service';
import NftService from '../../services/nft.service';
import { UtilService } from '../../services/utils/util.service';
import { NgSelectComponent } from '@ng-select/ng-select';

/**
 *  Mint token component, which is used for rendering the page of Mint ERC-721 token commitment.
 */
@Component({
  selector: 'ft-commitment-mint',
  templateUrl: './index.html',
  providers: [NftCommitmentService, NftService, UtilService],
  styleUrls: ['./index.css']
})
export default class NftCommitmentMintComponent implements OnInit, AfterContentInit {

  /**
   * To store the random hex string.
   */
  serialNumber = '';
  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   * Selected Token List
   */
  selectedCommitmentList: any = [];
  /**
   * To store user selected token.
   */
  selectedCommitment;

  /**
   * To store ERC-721 tokens
   */
  tokenList: any = [];

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
    private nftService: NftService,
    private utilService: UtilService,
    private router: Router
  ) { }


  ngOnInit() {
    this.getNFTokens();
    this.nftName = localStorage.getItem('nftName');
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.select.filterInput.nativeElement.focus();
    }, 500);
  }

  /**
   * Method to mint ERC-721 token commitment.
   */
  mintNFTCommitment() {
      this.isRequesting = true;
      this.selectedCommitment = this.selectedCommitmentList[0];
      this.nftCommitmentService.mintNFTCommitment(this.selectedCommitment).subscribe(tokenDetails => {
        console.log('Token Minted is ' + tokenDetails['data']['z_A']);
        this.isRequesting = false;
        this.toastr.success('Token Minted is ' + tokenDetails['data']['z_A'].slice(0, 20) + '...');
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'nft-commitment' } });
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }


  /**
   * Method will remove selcted token.
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
    const itemToSearch = item.uri.toString().toLocaleLowerCase();
    return itemToSearch.indexOf(term) > -1;
  }


  /**
   * Method to list down all ERC-721 tokens.
   */
  getNFTokens() {
    this.nftService.getNFTokens().subscribe( (data: any) => {
      this.isRequesting = false;
      this.tokenList = data['data'];
    }, error => {
      this.isRequesting = false;
      console.log('getNFTokens error', error);
  });
  }

}
