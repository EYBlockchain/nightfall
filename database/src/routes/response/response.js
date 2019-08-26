export default class Response {
  constructor(statusCode, data, err) {
    this.statusCode = statusCode;
    if (err) {
      this.err = err;
    } else {
      this.data = data;
    }
  }
}
