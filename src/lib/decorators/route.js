export default (
  route: string,
): Decorator => (target, name, descriptor): Object => {
  target[name].route = route;
  return descriptor;
};
