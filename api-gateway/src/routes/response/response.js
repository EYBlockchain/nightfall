export default class Response {
  set statusCode(code) {
    this.code = code;
  }

  set data(responseData) {
    this.responseData = responseData;
  }

  toJSON() {
    return {
      statusCode: this.code,
      data: this.responseData,
    };
  }
}
