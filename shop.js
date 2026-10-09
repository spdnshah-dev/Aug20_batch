// Shared cart / order helpers for the ShopLane demo pages.
// Everything is kept in the visitor's own browser; nothing is sent anywhere.
(function () {
  var mem = {};
  function store() {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return localStorage; } catch (e) {}
    try { sessionStorage.setItem('__t', '1'); sessionStorage.removeItem('__t'); return sessionStorage; } catch (e) {}
    return { getItem: function (k) { return k in mem ? mem[k] : null; }, setItem: function (k, v) { mem[k] = String(v); }, removeItem: function (k) { delete mem[k]; } };
  }
  var S = store();
  function read(k, d) { try { var v = JSON.parse(S.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function write(k, v) { try { S.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var inr = function (n) { return '₹' + Math.round(n).toLocaleString('en-IN'); };

  function getCart() { return read('sl_cart', []); }
  function setCart(c) { write('sl_cart', c); }
  function addItems(items) {
    var cart = getCart();
    items.forEach(function (it) {
      var ex = cart.find(function (c) { return c.id === it.id; });
      if (ex) ex.qty = Math.min(5, ex.qty + (it.qty || 1));
      else cart.push(Object.assign({ qty: 1 }, it));
    });
    setCart(cart);
  }
  function count(items) { return (items || getCart()).reduce(function (n, i) { return n + i.qty; }, 0); }

  // Accessories get the combo price only while a phone is in the same order.
  function priced(items) {
    var hasPhone = items.some(function (i) { return i.kind === 'phone'; });
    return items.map(function (i) {
      var unit = i.kind === 'acc' && hasPhone && i.combo ? i.combo : i.price;
      return Object.assign({}, i, { unit: unit, line: unit * i.qty, mrpLine: (i.mrp || i.price) * i.qty });
    });
  }
  function totals(items) {
    var p = priced(items);
    var mrp = p.reduce(function (s, i) { return s + i.mrpLine; }, 0);
    var total = p.reduce(function (s, i) { return s + i.line; }, 0);
    return { items: p, mrp: mrp, discount: mrp - total, total: total, count: count(items) };
  }

  window.ShopLane = {
    inr: inr, read: read, write: write,
    getCart: getCart, setCart: setCart, addItems: addItems, count: count, totals: totals,
    setBuyNow: function (items) { write('sl_buynow', items); },
    getBuyNow: function () { return read('sl_buynow', []); },
    saveOrder: function (o) { write('sl_last_order', o); },
    lastOrder: function () { return read('sl_last_order', null); }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var b = document.getElementById('cart-count');
    if (b) { var n = count(); b.textContent = n; b.hidden = n === 0; }
  });
})();
