export default (
  route: string,
): Decorator => (target, name, descriptor): Object => {
  descriptor.route = route;
  return descriptor;
};
