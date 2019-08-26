import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { config } from '../../shared/config';


/**
 * Token API services, which accomodated all ERC-721 related methods.
 */
@Injectable()
export class TokenApiService {

  assetHash: string;

  constructor(private http: HttpClient) {}


  /**
   *
   * Method to initiate a HTTP request to mint ERC-721 token commitment.
   *
   * @param token {String} Amount to mint
   */
  mintToken(token: any) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      uri: token.uri,
      tokenID: token.token_id,
      contractAddress: token.shield_contract_address
    };

    const url = config.apiGateway.root + 'token/mint';

    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(`Token minted `)), catchError(this.handleError('mintToken', [])));
  }


/**
 * Method to initiate a HTTP request to transfer ERC-721 token commitments.
 *
 * @param A {String} Token Id
 * @param uri {String} Token name
 * @param S_A {String} Serial number of token
 * @param z_A {String} Token2 commitment
 * @param sk_A {String} Secret key of Alice
 * @param receiver_name {String} Rceiver name
 * @param z_A_index {String} Token commitment index
 */
  spendToken(A: string, uri: string, S_A: string, z_A: string, sk_A: string, receiver_name: string, z_A_index: number) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const body = {
      A,
      uri,
      S_A,
      sk_A,
      z_A,
      receiver_name,
      z_A_index
    };
    const url = config.apiGateway.root + 'token/transfer';

    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('spendToken', [])));
  }

  /**
   * Method to initiate a HTTP request to burn ERC-721 token commitments.
   *
   * @param A {String} Token Id
   * @param uri {String} Token name
   * @param S_A {String} Serial number of token
   * @param z_A {String} Token commitment
   * @param Sk_A {String} Secret key of Alice
   * @param z_A_index {String} Token commitment index
   */
  burnToken(A: string, uri: string, S_A: string, z_A: string, Sk_A: string, z_A_index: number, payTo: string) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const body = {
      A,
      uri,
      S_A,
      z_A,
      Sk_A,
      z_A_index,
      payTo
    };
    const url = config.apiGateway.root + 'token/burn';
    return this.http
      .post(url, body, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('burnToken', [])));
  }

/**
 * Fetch ERC-721 token commitmnets
 *
 * @param pageNo {Number} Page number
 * @param limit {Number} Page limit
 */
  fetchTokens(pageNo: number, limit: number) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    let url = config.database.root + 'token?';

    if (pageNo) {
      url += 'pageNo=' + pageNo + '&';
    }

    if (limit) {
      url += 'limit=' + limit + '&';
    }

    return this.http
      .get(url, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('getTokens', [])));
  }


  /**
   * Method to initiate a HTTP request to get users.
   */
  getUsers() {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const url = config.offchain.root + 'pkd/names';

    return this.http
      .get(url, httpOptions)
      .pipe(tap(data => console.log(data)), catchError(this.handleError('getUsers', [])));
  }

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

    const url = config.apiGateway.root + 'nft/mint';

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
    const url = config.apiGateway.root + 'nft/transfer';
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
    const url = config.apiGateway.root + 'nft/burn';

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
  getNFTTokens(pageNo?: number, limit?: number) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    let url = config.apiGateway.root + 'nft?';

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
