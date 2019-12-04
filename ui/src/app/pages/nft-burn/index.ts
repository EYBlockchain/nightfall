import { Component, OnInit, ViewChild, AfterContentInit} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import NftService from '../../services/nft.service';
import { NgSelectComponent } from '@ng-select/ng-select';

/**
 * Burn non-fungible token component, which is used for rendering the page of burn ERC-721 token.
 */
@Component({
  selector: 'nft-burn',
  templateUrl: './index.html',
  providers: [NftService],
  styleUrls: ['./index.css']
})

export default class NftBurnComponent implements OnInit , AfterContentInit {

  /**
   * Selected Token List
   */
  selectedCommitmentList: any = [];
  /**
   * Used to identify the selected ERC-721 token.
   */
  selectedCommitment;

  /**
   * Flag for http request
   */
  isRequesting = false;

  /**
   *  List of all ERC-721 tokens.
   */
  nfTokens: any = [];

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
    private nftService: NftService,
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
   * Method to burn ERC721 token
   */
  burnToken () {
    this.isRequesting = true;
    this.selectedCommitment = this.selectedCommitmentList[0];
    this.nftService.burnNFToken(this.selectedCommitment).subscribe( data => {
        this.isRequesting = false;
        this.toastr.success('Burn Successful');
        this.selectedCommitment = undefined;
        this.router.navigate(['/overview'], { queryParams: { selectedTab: 'nft' } });
      }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again', 'Error');
    });
  }

  /**
   * Method to list down all ERC-721 tokens.
   */
  getNFTokens() {
    this.nftService.getNFTokens().subscribe( (data: any) => {
      this.isRequesting = false;
      this.nfTokens = data['data'];

    }, error => {
      this.isRequesting = false;
    });
  }

  /**
   * Method will remove selected token
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
    term = term.toLowerCase();
    const itemToSearch = item.uri.toString().toLowerCase();
    return itemToSearch.indexOf(term) > -1;
  }


}
