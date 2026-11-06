const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const middleware = require('zustand/middleware');

// Exercise the real persist middleware against fixture-only memory storage.
function loadStore(saved) {
  const memory = new Map(saved ? [['cart-storage', JSON.stringify(saved)]] : []);
  const storage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  };
  const source = readFileSync(join(__dirname, '../src/stores/cartStore.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  const fixtureRequire = (name) => name === 'zustand/middleware' ? {
    persist: (creator, options) => middleware.persist(creator, {
      ...options, storage: middleware.createJSONStorage(() => storage),
    }),
  } : require(name);
  const now = Date.now();
  class FrozenDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  vm.runInNewContext(outputText, { exports, require: fixtureRequire, Date: FrozenDate });
  return { store: exports.useCartStore, memory };
}
const product = { id: 'fixture-product', name: 'Fixture', price: 40, stock: 100 };
function coupon(overrides = {}) {
  return {
    id: 'fixture-coupon', code: 'FIXTURE', name: 'Fixture', description: '',
    type: 'percentage', value: 10, minOrderAmount: 0,
    startDate: '2000-01-01T00:00:00Z', endDate: '2100-01-01T00:00:00Z',
    usageLimit: 100, usedCount: 0, isActive: true, ...overrides,
  };
}
function variants() {
  const { store } = loadStore();
  store.getState().addToCart(product, 1, { size: 'S' });
  store.getState().addToCart(product, 2, { size: 'M' });
  return store;
}

test('remove selects one cart item, preserving other specifications', () => {
  const store = variants();
  const [small, medium] = store.getState().items;
  store.getState().removeFromCart(small.id);
  assert.equal(store.getState().items.length, 1);
  assert.equal(store.getState().items[0].id, medium.id);
  assert.equal(store.getState().totalItems, 2);
});

test('quantity changes and zero removal affect only the selected cart item', () => {
  const store = variants();
  const [small, medium] = store.getState().items;
  store.getState().updateQuantity(small.id, 3);
  assert.equal(store.getState().items[0].quantity, 3);
  assert.equal(store.getState().items[1].quantity, 2);
  store.getState().updateQuantity(small.id, 0);
  assert.equal(store.getState().items[0].id, medium.id);
  assert.equal(store.getState().items.length, 1);
});

test('empty carts have no shipping fee after recalculation or last-item removal', () => {
  const { store } = loadStore();
  store.getState().calculateTotals();
  assert.equal(store.getState().shippingFee, 0);
  assert.equal(store.getState().totalAmount, 0);
  store.getState().addToCart(product);
  store.getState().removeFromCart(store.getState().items[0].id);
  assert.equal(store.getState().totalAmount, 0);
  assert.equal(store.getState().shippingFee, 0);
});

test('existing shipping threshold is unchanged for nonempty carts', () => {
  const { store } = loadStore();
  store.getState().addToCart({ ...product, price: 98 });
  assert.equal(store.getState().shippingFee, 10);
  assert.equal(store.getState().totalAmount, 108);
  store.getState().clearCart();
  store.getState().addToCart({ ...product, price: 99 });
  assert.equal(store.getState().shippingFee, 0);
});

test('specification order does not create duplicate cart items', () => {
  const { store } = loadStore();
  store.getState().addToCart(product, 1, { size: 'S', color: 'blue' });
  store.getState().addToCart(product, 2, { color: 'blue', size: 'S' });
  assert.equal(store.getState().items.length, 1);
  assert.equal(store.getState().items[0].quantity, 3);
});

test('cart item IDs are unique even for variants added within the same millisecond', () => {
  const store = variants();
  assert.notEqual(store.getState().items[0].id, store.getState().items[1].id);
});

test('selected specifications are copied and lookup chooses the requested variant', () => {
  const { store } = loadStore();
  const specs = { size: 'S' };
  store.getState().addToCart(product, 1, specs);
  specs.size = 'M';
  assert.equal(store.getState().items[0].selectedSpecs.size, 'S');
  assert.equal(store.getState().getCartItem(product.id, { size: 'S' }).quantity, 1);
  assert.equal(store.getState().getCartItem(product.id, { size: 'M' }), undefined);
});

for (const quantity of [-1, 0, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  test(`add rejects invalid quantity ${quantity}`, () => {
    const { store } = loadStore();
    store.getState().addToCart(product, quantity);
    assert.equal(store.getState().items.length, 0);
    assert.equal(store.getState().totalAmount, 0);
  });
}
for (const quantity of [-1, 1.5, NaN, Infinity]) {
  test(`update rejects invalid quantity ${quantity} without removing the item`, () => {
    const store = variants();
    store.getState().updateQuantity(store.getState().items[0].id, quantity);
    assert.equal(store.getState().items.length, 2);
    assert.equal(store.getState().items[0].quantity, 1);
  });
}

test('persistence reload recomputes all derived totals', () => {
  const { store, memory } = loadStore();
  store.getState().addToCart(product, 2);
  const saved = JSON.parse(memory.get('cart-storage'));
  const restored = loadStore(saved).store.getState();
  assert.equal(restored.items.length, 1);
  assert.equal(restored.totalItems, 2);
  assert.equal(restored.shippingFee, 10);
  assert.equal(restored.totalAmount, 90);
});

for (const quantity of [0, -1, 1.5, '2', null, undefined, true, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
  test(`persistence drops invalid quantity ${typeof quantity}:${String(quantity)} before merging variants`, () => {
    const { store, memory } = loadStore();
    store.getState().addToCart(product, 1, { size: 'S' });
    store.getState().addToCart(product, 2, { size: 'M' });
    const saved = JSON.parse(memory.get('cart-storage'));
    const invalid = { ...saved.state.items[0], quantity };
    // Invalid lines must not corrupt a valid line with the same specifications.
    saved.state.items.unshift(invalid);
    saved.state.items.push(invalid);
    const restored = loadStore(saved).store.getState();
    assert.equal(restored.items.length, 2);
    assert.equal(restored.items[0].quantity, 1);
    assert.equal(restored.items[1].quantity, 2);
    assert.equal(restored.totalItems, 3);
    assert.equal(restored.totalAmount, 120);
    assert.equal(restored.shippingFee, 0);

    saved.state.items = [invalid];
    const empty = loadStore(saved).store.getState();
    assert.equal(empty.items.length, 0);
    assert.equal(empty.totalItems, 0);
    assert.equal(empty.totalAmount, 0);
    assert.equal(empty.shippingFee, 0);
  });
}

test('coupon minimum uses merchandise subtotal, excluding shipping', () => {
  const { store } = loadStore();
  store.getState().addToCart(product, 2);
  assert.throws(() => store.getState().applyCoupon(coupon({ minOrderAmount: 85 })));
  assert.equal(store.getState().appliedCoupon, undefined);
});

test('coupon minimum remains valid when replacing a previous coupon', () => {
  const { store } = loadStore();
  store.getState().addToCart(product, 3);
  store.getState().applyCoupon(coupon({ value: 50 }));
  assert.doesNotThrow(() => store.getState().applyCoupon(coupon({ minOrderAmount: 100 })));
  assert.equal(store.getState().totalAmount, 108);
});

test('coupon is removed when quantity drops below its minimum', () => {
  const { store } = loadStore();
  store.getState().addToCart(product, 3);
  store.getState().applyCoupon(coupon({ minOrderAmount: 100 }));
  store.getState().updateQuantity(store.getState().items[0].id, 2);
  assert.equal(store.getState().appliedCoupon, undefined);
  assert.equal(store.getState().totalAmount, 90);
});

for (const invalid of [
  { startDate: 'invalid' }, { endDate: 'invalid' }, { value: NaN },
  { value: -1 }, { value: 101 }, { usageLimit: 0 }, { maxDiscountAmount: -1 },
]) {
  test(`malformed coupon is rejected: ${JSON.stringify(invalid)}`, () => {
    const { store } = loadStore();
    store.getState().addToCart(product, 3);
    assert.throws(() => store.getState().applyCoupon(coupon(invalid)));
    assert.equal(store.getState().totalAmount, 120);
  });
}

test('restored expired coupon is removed and totals are recalculated', () => {
  const { store, memory } = loadStore();
  store.getState().addToCart(product, 3);
  const saved = JSON.parse(memory.get('cart-storage'));
  saved.state.appliedCoupon = coupon({ endDate: '2001-01-01T00:00:00Z' });
  const restored = loadStore(saved).store.getState();
  assert.equal(restored.appliedCoupon, undefined);
  assert.equal(restored.totalAmount, 120);
});

test('fixed coupon cannot discount shipping and final currency uses cents', () => {
  const { store } = loadStore();
  store.getState().addToCart({ ...product, price: 0.1 }, 3);
  assert.equal(store.getState().totalAmount, 10.3);
  store.getState().applyCoupon(coupon({ type: 'fixed', value: 50 }));
  assert.equal(store.getState().totalAmount, 10);
});

test('legacy timestamp collisions and equivalent specifications restore without losing quantities', () => {
  const { store, memory } = loadStore();
  store.getState().addToCart(product, 1, { size: 'S', color: 'blue' });
  store.getState().addToCart(product, 2, { size: 'M', color: 'blue' });
  const saved = JSON.parse(memory.get('cart-storage'));
  for (const item of saved.state.items) item.id = 'legacy-timestamp-collision';
  saved.state.items.push({ ...saved.state.items[0], quantity: 3, selectedSpecs: { color: 'blue', size: 'S' } });
  const restored = loadStore(saved).store;
  assert.equal(restored.getState().items.length, 2);
  assert.notEqual(restored.getState().items[0].id, restored.getState().items[1].id);
  assert.equal(restored.getState().totalItems, 6);
  assert.equal(restored.getState().getCartItem(product.id, { size: 'S', color: 'blue' }).quantity, 4);
  restored.getState().removeFromCart(restored.getState().items[0].id);
  assert.equal(restored.getState().totalItems, 2);
});
