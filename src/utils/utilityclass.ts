class ErrorHandler extends Error {
    constructor(public message: string, public statusCode: number) {
      super(message); // Call the parent class constructor (Error)
      this.statusCode = statusCode;
  
      // This is important to correctly set the prototype for instance of ErrorHandler
      Object.setPrototypeOf(this, ErrorHandler.prototype);
    }
  }
  
  export default ErrorHandler; // Default export of the class
  