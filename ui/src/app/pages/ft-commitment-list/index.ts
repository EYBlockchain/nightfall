import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import FtCommitmentService from '../../services/ft-commitment.service';
import { UtilService } from '../../services/utils/util.service';

/**
 * Component for listing all ERC-20 commitments
 */
@Component({
  selector: 'app-ft-commitment-list',
  templateUrl: './index.html',
  styleUrls: ['./index.css'],
  providers: [FtCommitmentService, UtilService]
})
export default class FtCommitmentListComponent implements OnInit {
/**
 *  Transaction list
 */
  transactions: any;
  /**
   * Flag for http request
   */
  isRequesting = false;
  /**
   * Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;
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
  totalCollection: number;

  constructor(
    private toastr: ToastrService,
    private ftCommitmentService: FtCommitmentService,
    private utilService: UtilService,
  ) { }

  ngOnInit() {
    this.ftName = localStorage.getItem('ftName');
    this.getFTCommitments();
  }

  /**
   * Method to handle pagination.
   *
   * @param pageN {Number} Page number
   */
  pageChanged (pageNo) {
    if (isNaN(pageNo)) { return; }
    this.pageNo = pageNo;
    this.getFTCommitments();
  }

  /**
   * Method list down all ERC-20 commitments.
   */
  getFTCommitments() {
    this.transactions = null;
    this.isRequesting = true;
    this.ftCommitmentService.getFTCommitments(this.pageNo, this.pageSize)
      .subscribe( data => {
        this.isRequesting = false;
        if (data &&
        data['data'] &&
        data['data']['data'] &&
        data['data']['data'].length) {
          this.totalCollection = Number(data['data']['totalCount']);
          this.transactions = data['data']['data'].map((tx, indx) => {
            tx.selected = false;
            tx.id = indx;
            return tx;
          });
        }
      }, error => {
        this.isRequesting = false;
      });
  }


}
