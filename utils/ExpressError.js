export class ExpressError extends Error {
  constructor(message, statusCode) {
    super(); // calls error constructor (parent)
    this.message = message;
    this.statusCode = statusCode;
  }
}
