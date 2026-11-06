const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Compile the actual store with the locked compiler; no backend or browser storage.
function loadStore(schedule = (callback) => callback()) {
  const source = readFileSync(join(__dirname, '../src/stores/productStore.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require, setTimeout: schedule });
  return exports.useProductStore;
}

test('minimum rating excludes products below the threshold', async () => {
  const store = loadStore();
  await store.getState().fetchProducts({ rating: 4.8 });
  assert.deepEqual(Array.from(store.getState().products, (p) => p.id), ['1']);
  assert.equal(store.getState().pagination.total, 1);
});

test('rating composes with category and price filters', async () => {
  const store = loadStore();
  await store.getState().fetchProducts({ rating: 4.9, categoryId: '1', priceRange: { min: 0, max: 10000 } });
  assert.equal(store.getState().products.length, 0);
  assert.equal(store.getState().pagination.totalPages, 0);
});

test('rating zero preserves all products and price sorting', async () => {
  const store = loadStore();
  await store.getState().fetchProducts({ rating: 0, sortBy: 'price', sortOrder: 'asc' });
  assert.deepEqual(Array.from(store.getState().products, (p) => p.id), ['3', '1', '2']);
});

test('missing detail clears a previously selected product', async () => {
  const store = loadStore();
  await store.getState().fetchProductById('1');
  await store.getState().fetchProductById('missing');
  assert.equal(store.getState().currentProduct, null);
  assert.equal(store.getState().error, '商品不存在');
  assert.equal(store.getState().isLoading, false);
});

test('starting a new detail request clears the old product while loading', async () => {
  const pending = [];
  const store = loadStore((callback) => pending.push(callback));
  const first = store.getState().fetchProductById('1');
  pending.shift()();
  await first;
  const second = store.getState().fetchProductById('2');
  assert.equal(store.getState().currentProduct, null);
  assert.equal(store.getState().isLoading, true);
  pending.shift()();
  await second;
  assert.equal(store.getState().currentProduct.id, '2');
});

test('a slower old detail request cannot replace the latest product', async () => {
  const pending = [];
  const store = loadStore((callback) => pending.push(callback));
  const first = store.getState().fetchProductById('1');
  const second = store.getState().fetchProductById('2');
  pending[1]();
  await second;
  pending[0]();
  await first;
  assert.equal(store.getState().currentProduct.id, '2');
  assert.equal(store.getState().error, null);
});

test('an older missing detail cannot overwrite a newer success with an error', async () => {
  const pending = [];
  const store = loadStore((callback) => pending.push(callback));
  const first = store.getState().fetchProductById('missing');
  const second = store.getState().fetchProductById('2');
  pending[1]();
  await second;
  pending[0]();
  await first;
  assert.equal(store.getState().error, null);
  assert.equal(store.getState().currentProduct.id, '2');
});
