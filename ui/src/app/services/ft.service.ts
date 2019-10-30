import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { config } from '../shared/config';

/**
 * Coin services, which accomodated all ERC-20 related methods.
 */
@Injectable()
export default class FtService {

 constructor(private http: HttpClient) {

 }

 /**
  * Method to initiate a HTTP request to mint ERC-20 token.
  * @param account {Object} Account object
  * @param amount {Number} Amount to mint
  */
 mintFToken(account, amount) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      amount : amount,
      account: account
    };
    const url = config.apiGateway.root + 'mintFToken';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Bought Coins.`)), catchError(this.handleError('mintFToken', [])));
  }

  /**
   *  Method to initiate a HTTP request to transfer ERC-20 token.
   *
   * @param amount {Number} Amount to transfer
   * @param account {Object} Account object
   * @param receiver_name {String} Receiver name
   */
  transferFToken(amount, account, receiver_name) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      amount : amount,
      receiver_name
    };
    const url = config.apiGateway.root + 'transferFToken';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Bought Coins.`)), catchError(this.handleError('transferFToken', [])));
  }

  /**
   * Method to initiate a HTTP request to burn ERC-20 token.
   *
   * @param account {Object} Account details
   * @param amount {Number} Amount to burn
   */
  burnFToken(account, amount) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      amount : amount,
      account: account
    };
    const url = config.apiGateway.root + 'burnFToken';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Bought Coins.`)), catchError(this.handleError('burnFToken', [])));
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
