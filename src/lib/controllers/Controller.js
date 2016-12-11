export default class Controller {
  bad(message, status: number = 400) {
    return {
      data: {
        error: message,
        ok: false,
      },
      status: status,
    };
  }

  ok(output) {
    return {
      data: output,
      status: 200,
    };
  }
}
