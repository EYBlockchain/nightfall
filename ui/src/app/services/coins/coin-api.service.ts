import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { config } from '../../shared/config';

/**
 * Coin services, which accomodated all ERC-20 related methods.
 */
@Injectable()
export class CoinApiService {

 constructor(private http: HttpClient) {

 }

 /**
  * Method to initiate a HTTP request to mint ERC-20 token commitment.
  * @param A {String} Amount to mint
  * @param pk_A {String} Public key of Alice
  * @param S_A {String} Random Serial number
  */
 mintCoin(A: string, pk_A: string) {
  const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  const body = {
    A: A,
    pk_A
  };

  const url = config.apiGateway.root + 'coin/mint';

  return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Coin minted `)), catchError(this.handleError('mintCoin', [])));

 }

 /**
  * Method to initiate a HTTP request to mint ERC-20 token.
  * @param account {Object} Account object
  * @param amount {Number} Amount to mint
  */
 mintPublicCoin(account, amount) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      amount : amount,
      account: account
    };
    const url = config.apiGateway.root + 'ft/mint';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Bought Coins.`)), catchError(this.handleError('mintCoin', [])));
  }

  /**
   *  Method to initiate a HTTP request to transfer ERC-20 token.
   *
   * @param amount {Number} Amount to transfer
   * @param account {Object} Account object
   * @param receiver_name {String} Receiver name
   */
  transferPublicCoin(amount, account, receiver_name) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      amount : amount,
      receiver_name
    };
    const url = config.apiGateway.root + 'ft/transfer';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Bought Coins.`)), catchError(this.handleError('mintCoin', [])));
  }

  /**
   * Method to initiate a HTTP request to burn ERC-20 token.
   *
   * @param account {Object} Account details
   * @param amount {Number} Amount to burn
   */
  burnPublicCoin(account, amount) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      amount : amount,
      account: account
    };
    const url = config.apiGateway.root + 'ft/burn';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Bought Coins.`)), catchError(this.handleError('mintCoin', [])));
  }

  /**
   * Method to initiate a HTTP request to fetch ERC-20 token commitments.
   *
   * @param account {Object} Account details
   */
  fetchCoins(account) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const url = config.database.root + 'coin?account=' + account;

    return this.http
      .get(url, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('getCoinByAccount', [])));
  }

  /**
   * Method to initiate a HTTP request to burn ERC-20 token commitments.
   *
   * @param A {String} Amount to burn
   * @param sk_A {String} Seceret key of Alice
   * @param S_A {String} Serial number
   * @param z_A_index {String} Token commitment index
   * @param z_A {String} Token commitment
   * @param pk_A {String} Public key of Alice
   */
  burnCoin (
    A: string,
    sk_A: string,
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
      sk_A,
      S_A,
      pk_A,
      z_A_index,
      z_A,
      payTo
    };
    const url = config.apiGateway.root + 'coin/burn';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('BurnCoin', [])));
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
   * @param sk_A {String} Secret key of Alice
   * @param pk_A {String} Public key of Alice
   * @param receiver_name {String} Rceiver name
   */
  transferCoin (
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
    sk_A: string,
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
      sk_A,
      z_C,
      z_D,
      pk_A,
      receiver_name
    };

    const url = config.apiGateway.root + 'coin/transfer';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('spendCoin', [])));
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
