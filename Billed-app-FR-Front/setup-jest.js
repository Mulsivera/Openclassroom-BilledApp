import $ from 'jquery';

global.$ = global.jQuery = $;

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);