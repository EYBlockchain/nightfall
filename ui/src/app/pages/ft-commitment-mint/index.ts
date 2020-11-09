import { Component, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import UserService from '../../services/user.service';
import FtCommitmentService from '../../services/ft-commitment.service';
import { UtilService } from '../../services/utils/util.service';
import { toastrConfig } from '../../config/config';

/**
 *  This component, which is used for rendering the page of Mint ERC-20 token commitment.
 */
@Component({
  selector: 'app-ft-commitment-mint',
  templateUrl: './index.html',
  providers: [FtCommitmentService, UserService, UtilService],
  styleUrls: ['./index.css'],
})
export default class FtCommitmentMintComponent implements OnInit {
  /**
   * Flag for http request
   */
  isRequesting = false;
  /**
   * To store the random hex string.
   */
  serialNumber = '';
  /**
   * Form object to collect mint details.
   */
  ftCommitmentMintForm: FormGroup;
  /**
   * To store the ERC-20 token count.
   */
  ftBalance;
  /**
   * Fungeble Token name , read from ERC-20 contract.
   */
  ftName: string;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ftCommitmentService: FtCommitmentService,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.ftName = localStorage.getItem('ftName');
    this.createForm();
    this.getFTokenInfo();
  }

  /**
   * Method to list down all ERC-20 tokens.
   */
  getFTokenInfo() {
    this.userService.getFTokenInfo().subscribe(
      data => {
        this.ftBalance = data['data']['balance'];
      },
      error => {
        console.log('Error in getting FTokens', error);
      },
    );
  }

  /**
   * Method to create Mint form
   */
  createForm() {
    this.ftCommitmentMintForm = this.fb.group({
      A: ['', Validators.required],
    });
  }

  /**
   * Method to Mint ERC-20 token commitemnt.
   */
  mintFTCommitment() {
    const amountToMint = this.ftCommitmentMintForm.controls['A'].value;
    if (!amountToMint) { return; }
    if (amountToMint > this.ftBalance) {
      return this.toastr.warning('You do not have enough ERC-20 tokens.', 'Warning');
    }
    this.isRequesting = true;
    const hexValue = (this.ftCommitmentMintForm.controls['A'].value).toString(16);
    const hexString = '0x' + hexValue.padStart(32, '0');
    this.ftCommitmentService.mintFTCommitment(hexString).subscribe(tokenDetails => {
      this.isRequesting = false;
      this.toastr.show('Minting fungible token commitment.', '', toastrConfig, 'mintFTCommitment');
      this.createForm();
    }, error => {
        this.isRequesting = false;
        this.toastr.error('Please try again.', 'Error');
      },
    );
  }
}
