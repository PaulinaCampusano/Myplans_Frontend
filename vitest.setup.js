import '@testing-library/jest-dom';

// Node.js 22+ expone localStorage como undefined a menos que se pase --localstorage-file.
// jsdom lo define en window.localStorage pero no sobreescribe el global de Node.
// Este polyfill garantiza que localStorage funcione en los tests.
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; },
        key: (index) => Object.keys(store)[index] ?? null,
        get length() { return Object.keys(store).length; },
    };
})();

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
});
