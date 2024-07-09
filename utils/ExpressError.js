const expressErrorExtended = class ExpressError extends Error {
  constructor(message, statusCode) {
    super(); // calls error constructor (parent)
    this.message = message;
    this.statusCode = statusCode;
  }
}

export default expressErrorExtended