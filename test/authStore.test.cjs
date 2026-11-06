const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const middleware = require('zustand/middleware');

function loadStore(fetchFixture) {
  const memory = new Map();
  const storage = {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  };
  const source = readFileSync(join(__dirname, '../src/stores/authStore.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  const fixtureRequire = (name) => name === 'zustand/middleware' ? {
    persist: (creator, options) => middleware.persist(creator, {
      ...options, storage: middleware.createJSONStorage(() => storage),
    }),
  } : require(name);
  vm.runInNewContext(outputText, {
    exports, require: fixtureRequire, fetch: fetchFixture, localStorage: storage,
  });
  return exports.useAuthStore;
}

for (const operation of ['login', 'register']) {
  for (const failure of ['http', 'network']) {
    test(`${operation} rejects ${failure} failure so the form does not navigate`, async () => {
      const store = loadStore(async () => {
        if (failure === 'network') throw new Error('Fixture unavailable');
        return { ok: false, status: 401 };
      });
      // Mirrors the existing form's await -> navigate -> catch control flow.
      let navigated = false;
      const action = () => operation === 'login'
        ? store.getState().login('fixture', 'fixture')
        : store.getState().register({ email: 'fixture', password: 'fixture', name: 'Fixture' });
      try { await action(); navigated = true; } catch { /* Error stays in the store. */ }
      assert.equal(navigated, false);
      assert.equal(store.getState().isAuthenticated, false);
      assert.equal(store.getState().isLoading, false);
      assert.equal(typeof store.getState().error, 'string');
      await assert.rejects(action);
    });
  }
}
