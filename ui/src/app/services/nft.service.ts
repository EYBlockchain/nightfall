import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { config } from '../shared/config';


/**
 * Token API services, which accomodated all ERC-721 related methods.
 */
@Injectable()
export default class NftService {

  assetHash: string;

  constructor(private http: HttpClient) {}

 /**
  * Method to initiate a HTTP request to mint ERC-721 token.
  *
  * @param tokenURI {String} Token name
  */
  mintNFToken (tokenURI: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = { tokenURI };

    const url = config.apiGateway.root + 'mintNFToken';

    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Token minted `)), catchError(this.handleError('mintNFToken', [])));
  }

  /**
   * Method to initiate a HTTP request to transfer ERC-721 token.
   *
   * @param nftToken {Object} Selected ERC-721 token
   * @param receiver_name {String} receiver name
   */
  transferNFToken (nftToken: any, receiver_name: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = { tokenID: nftToken.token_id, uri: nftToken.uri, receiver_name, contractAddress: nftToken.shield_contract_address};
    const url = config.apiGateway.root + 'transferNFToken';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Token minted `)), catchError(this.handleError('mintNFToken', [])));
  }

 /**
  * Method to initiate a HTTP request to burn ERC-721 token.
  *
  * @param nftToken {Object} Selected ERC-721 token
  */
  burnNFToken (nftToken: any) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = { tokenID: nftToken.token_id, uri: nftToken.uri, contractAddress: nftToken.shield_contract_address};
    const url = config.apiGateway.root + 'burnNFToken';

    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Token minted `)), catchError(this.handleError('mintNFToken', [])));
  }

  /**
   * Method to initiate a HTTP request to get all ERC-721 tokens.
   *
   * @param pageNo {Number} Page number
   * @param limit {Number} Page limit
   */
  getNFTokens(pageNo?: number, limit?: number) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    let url = config.apiGateway.root + 'getNFTokens?';

    if (pageNo) {
      url += 'pageNo=' + pageNo + '&';
    }

    if (limit) {
      url += 'limit=' + limit + '&';
    }

    return this.http
      .get(url, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('getNFTTokens', [])));
  }

  /**
   * Method to handle error on HTTp request.
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
