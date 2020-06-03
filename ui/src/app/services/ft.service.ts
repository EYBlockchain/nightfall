import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { config } from '../shared/config';

/**
 * fungible services, which accomodated all ERC-20 related methods.
 */
@Injectable()
export default class FtService {

 constructor(private http: HttpClient) {

 }

 /**
  * Method to initiate a HTTP request to mint ERC-20 token.
  * @param value {Number} Amount to mint
  */
 mintFToken(value) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      value,
    };
    const url = config.apiGateway.root + 'mintFToken';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Mint fungible token successfully.`)), catchError(this.handleError('mintFToken', [])));
  }

  /**
   *  Method to initiate a HTTP request to transfer ERC-20 token.
   *
   * @param value {Number} Amount to transfer
   * @param name {String} Receiver name
   */
  transferFToken(value, name) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      value,
      receiver: { name }
    };
    const url = config.apiGateway.root + 'transferFToken';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Transfer fungible successfully.`)), catchError(this.handleError('transferFToken', [])));
  }

  /**
   * Method to initiate a HTTP request to burn ERC-20 token.
   *
   * @param value {Number} Amount to burn
   */
  burnFToken(value) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      value,
    };
    const url = config.apiGateway.root + 'burnFToken';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Burn fungible token successfully.`)), catchError(this.handleError('burnFToken', [])));
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
