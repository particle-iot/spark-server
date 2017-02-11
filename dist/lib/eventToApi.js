

Object.defineProperty(exports, '__esModule', {
  value: true,
});
const eventToApi = function eventToApi(event) {
  return {
    coreid: event.deviceID || null,
    data: event.data || null,
    published_at: event.publishedAt,
    ttl: event.ttl,
  };
};

exports.default = eventToApi;
