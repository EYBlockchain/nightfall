import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { config } from '../shared/config';

/**
 * Fungible Token services, which accomodated all ERC-20 related methods.
 */
@Injectable()
export default class FtCommitmentService {

 constructor(private http: HttpClient) {

 }

 /**
  * Method to initiate a HTTP request to mint ERC-20 token commitment.
  * @param A {String} Amount to mint
  * @param pk_A {String} Public key of Alice
  * @param S_A {String} Random Serial number
  */
 mintFTCommitment(A: string, pk_A: string) {
  const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  const body = {
    A: A,
    pk_A
  };

  const url = config.apiGateway.root + 'mintFTCommitment';

  return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`ft-commitment minted `)), catchError(this.handleError('mintFTCommitment', [])));
 }

  /**
   * Method to initiate a HTTP request to fetch ERC-20 token commitments.
   *
   */
  getFTCommitments() {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const url = config.apiGateway.root + 'getFTCommitments';

    return this.http
      .get(url, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('getFTCommitments', [])));
  }

  /**
   * Method to initiate a HTTP request to burn ERC-20 token commitments.
   *
   * @param A {String} Amount to burn
   * @param S_A {String} Serial number
   * @param z_A_index {String} Token commitment index
   * @param z_A {String} Token commitment
   * @param pk_A {String} Public key of Alice
   */
  burnFTCommitment (
    A: string,
    S_A: string,
    z_A_index: string,
    z_A: string,
    pk_A: string,
    payTo: string
  ) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      A,
      S_A,
      pk_A,
      z_A_index,
      z_A,
      payTo
    };
    const url = config.apiGateway.root + 'burnFTCommitment';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('burnFTCommitment', [])));
  }

  /**
   *
   * Method to initiate a HTTP request to transfer ERC-20 token commitments.
   *
   * @param C {String} Amount of selected token1
   * @param D {String} Amount of selected token2
   * @param E {String} Amount of token to transfer
   * @param F {String} Amount of token after transfer
   * @param pk_B {String} Public key of Bob
   * @param S_C {String} Serial number of token1
   * @param S_D {String} Serial number of token2
   * @param z_C_index {String} Token1 commitment index
   * @param z_D_index {String} Token2 commitment index
   * @param S_E {String} Serial number of token to transfer
   * @param S_F {String} Serial number of change token
   * @param z_C {String} Token1 commitment
   * @param z_D {String} Token2 commitment
   * @param pk_A {String} Public key of Alice
   * @param receiver_name {String} Rceiver name
   */
  transferFTCommitment (
    C: string,
    D: string,
    E: string,
    F: string,
    S_C: string,
    S_D: string,
    z_C_index: string,
    z_D_index: string,
    z_C: string,
    z_D: string,
    pk_A: string,
    receiver_name) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      C,
      D,
      E,
      F,
      S_C,
      S_D,
      z_C_index,
      z_D_index,
      z_C,
      z_D,
      pk_A,
      receiver_name
    };

    const url = config.apiGateway.root + 'transferFTCommitment';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)));
  }

  /**
   *
   * Method to initiate a HTTP request to transfer ERC-20 token batch commitments.
   *
   * @param amount {String} Amount of selected fungible token
   * @param commitmentIndex {String} Fungible Token commitment index
   * @param commitment {String} fungible token commitment
   * @param salt {String} Public key of Alice
   * @param transferData {Array} Array of value to transfer and receiver name
   */
  transferFTBatchCommitment (
    amount: string,
    salt: string,
    commitment: string,
    commitmentIndex: Number,
    transferData: Object
    ) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      amount,
      salt,
      commitment,
      commitmentIndex,
      transferData
    };

    const url = config.apiGateway.root + 'simpleFTCommitmentBatchTransfer';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)));
  }

  /**
   * Method for HTTP error handler
   *
   * @param operation {String}
   * @param result {Object}
   */
 private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return error;
    };
  }
}
