class Controller {
  bad(message) {
    return {
      data: {message},
      status: 400,
    };
  }

  ok(output) {
    return {
      data: output,
      status: 200,
    };
  }
}

module.exports = ViewBase;
