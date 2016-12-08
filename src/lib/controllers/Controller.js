// @flow

// todo annotate better
export default class Controller {
  bad = (message: string): Object => ({
    data: { message },
    status: 400,
  });

  ok = (output?: Object): Object => ({
    data: output,
    status: 200,
  });
}
