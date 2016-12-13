// @flow

class HttpError extends Error {
  status: number;

  constructor(message: string, status?: number = 400) {
    super(message);
    this.status = status;
  }
}

export default HttpError;
