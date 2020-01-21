import { Component, OnInit } from '@angular/core';
import NftCommitmentService from '../../services/nft-commitment.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Component for listing all ERC-721 token commitments
 */
@Component({
  selector: 'app-nft-commitment-list',
  templateUrl: './index.html',
  styleUrls: ['./index.css'],
  providers: [NftCommitmentService],
})
export default class NftCommitmentListComponent implements OnInit {

  /**
   * Flag for http request
   */
  isRequesting =  false;

  /**
 *  Transaction list
 */
  transactions: any;

  /**
   * If no tokens are available, set this property as false;
   */
  noCommitment = false;

  /**
   * For pagination purpose
   */
  pageNo = 1;

  /**
   * For pagination purpose, initial value for page size is set it as 4
   */
  pageSize = 12;

  /**
   * Total collection of objects to calculate pages for pagination.
   */
  totalCollection: Promise<number>;

  /**
   * Non Fungeble Token name , read from ERC-721 contract.
   */
  nftName: string;

  constructor(
    private nftCommitmentService: NftCommitmentService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.fetchTokens();
    this.nftName = localStorage.getItem('nftName');
  }

  /**
   * Method to handle pagination.
   *
   * @param pageN {Number} Page number
   */
  pageChanged (pageNo) {
    if (isNaN(pageNo)) { return; }
    this.pageNo = pageNo;
    this.fetchTokens();
  }


  /**
   * Method list down all ERC-721 commitments.
   */
  fetchTokens () {
    this.transactions = null;
    this.isRequesting = true;
    this.nftCommitmentService.getNFTCommitments(this.pageNo, this.pageSize)
    .subscribe( data => {
      this.isRequesting = false;
      if (data &&
        data['data'] &&
        data['data']['data'] &&
        data['data']['data'].length) {
        this.transactions = data['data']['data'];

        if (this.totalCollection) { return; }
        this.totalCollection = Promise.resolve(parseInt(data['data']['totalCount'], 10));
      } else {
        this.noCommitment = true;
      }
    }, error => {
      this.isRequesting = false;
      this.toastr.error('Please Enter a valid SKU.', error);
    });
  }

}
