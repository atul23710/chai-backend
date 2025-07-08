class ApiError extends Error {
    constructor(
        statusCode, 
        message = "Something went wrong",
        errors = [],
        statck = "" //stack 
    ){
      //The Error base class needs the message so it can set its internal message property and build a stack trace.
      super(message);

      this.message = message;
      this.errors = errors;
      this.statusCode = statusCode;
      this.data = null; //read about it HW
      this.success = false;

      //this one written in production grade
      //stack trace - A stack trace is a report that shows you:
        // Where an error happened
        // How your code got there (the path through your functions)
        // Think of it like:
        // 📸 A snapshot of all the functions that were called leading up to the error.
      if (statck) {
        this.stack = statck;
      } else {
        //captureStackTrace fn --
        //Tells JavaScript: “Hey, generate a clean stack trace starting from this function.”
        // It’s especially useful in custom error classes, like your ApiError, to prevent polluting the trace with internal calls.
        //Create a stack trace for this error, but start skipping from the constructor itself — don't show internal framework lines.
        Error.captureStackTrace(this, this.constructor);
      }
    }
}

export {ApiError}