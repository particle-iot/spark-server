// @flow

class HttpError extends Error {
  status: number;

  constructor(error: string | Error | HttpError, status?: number = 400) {
    super(error.message || error);
    if (typeof error.status === 'number') {
      this.status = error.status;
    } else {
      this.status = status;
    }
  }
}

export default HttpError;
