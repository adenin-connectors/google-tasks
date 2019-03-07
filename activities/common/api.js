'use strict';
const got = require('got');
const isPlainObj = require('is-plain-obj');
const HttpAgent = require('agentkeepalive');
const cfActivity = require('@adenin/cf-activity');
const HttpsAgent = HttpAgent.HttpsAgent;

let _activity = null;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }

  opts = Object.assign({
    json: true,
    token: _activity.Context.connector.token,
    endpoint: 'https://www.googleapis.com',
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    accept: 'application/json',
    'user-agent': 'adenin Now Assistant Connector, https://www.adenin.com/now-assistant'
  }, opts.headers);

  if (opts.token) {
    opts.headers.Authorization = `Bearer ${opts.token}`;
  }

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) {
    return got.stream(url, opts);
  }

  return got(url, opts).catch(err => {
    throw err;
  });
}
//**maps response data to items */
api.convertTasks = function (response) {
  let items = [];
  let tasks = [];

  if (response.body.items != null) {
    tasks = response.body.items;
  }

  for (let i = 0; i < tasks.length; i++) {
    let raw = tasks[i];
    let item = { id: raw.id, title: raw.title, description: raw.notes, link: raw.selfLink, raw: raw };
    items.push(item);
  }

  return { items: items };
};
const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

api.stream = (url, opts) => apigot(url, Object.assign({}, opts, {
  json: false,
  stream: true
}));

api.initialize = function (activity) {
  _activity = activity;
};

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, { method }));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, { method }));
}

/**returns all tasks due today until midnight*/
api.getTodaysTasks = function () {
  var dateRange = cfActivity.dateRange(_activity, "today");
  let timeMax = ISODateString(new Date(dateRange.endDate));

  return api(`/tasks/v1/lists/@default/tasks?dueMax=${timeMax}`);
};

/**formats string to match google api requirements*/
function ISODateString(d) {
  function pad(n) { return n < 10 ? '0' + n : n }
  return d.getUTCFullYear() + '-'
    + pad(d.getUTCMonth() + 1) + '-'
    + pad(d.getUTCDate()) + 'T'
    + pad(d.getUTCHours()) + ':'
    + pad(d.getUTCMinutes()) + ':'
    + pad(d.getUTCSeconds()) + 'Z';
}

module.exports = api;