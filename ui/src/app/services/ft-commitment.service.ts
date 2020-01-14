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
  * @param value {String} Amount to mint
  * @param S_A {String} Random Serial number
  */
 mintFTCommitment(value: string) {
  const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  const body = {
    outputCommitments: [{value}],
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
  burnFTCommitment (commitment, name: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      inputCommitments: [commitment],
      receiver: { name },
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
   * @param inputCommitments {Object} selected commitments
   * @param outputCommitments {Object} values array of transferred and change
   * @param name {String} receiver name
   */
  transferFTCommitment (inputCommitments, outputCommitments, name) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      inputCommitments,
      outputCommitments,
      receiver: { name },
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
    commitment,
    outputCommitments,
    ) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      inputCommitments: [commitment],
      outputCommitments,
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
