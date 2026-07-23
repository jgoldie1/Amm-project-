const crypto = require('crypto');

function createBooksManager({ manifest, io } = {}) {
  const books = new Map();
  const orders = new Map();
  const printQuotes = new Map();

  function createBook(input = {}) {
    if (!input.title || !input.authorId) throw new Error('title and authorId are required');
    const book = {
      id: crypto.randomUUID(),
      title: String(input.title).slice(0, 300),
      authorId: input.authorId,
      formats: Array.isArray(input.formats) ? input.formats : ['ebook'],
      status: 'draft',
      rightsStatus: input.rightsStatus || 'unverified',
      metadata: input.metadata || {},
      pricing: input.pricing || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    books.set(book.id, book);
    io?.emit('books:book', book);
    return book;
  }

  function updateBook(id, patch = {}) {
    const book = books.get(id);
    if (!book) return null;
    const allowed = ['status', 'formats', 'rightsStatus', 'metadata', 'pricing', 'title'];
    for (const key of allowed) if (key in patch) book[key] = patch[key];
    book.updatedAt = new Date().toISOString();
    io?.emit('books:book', book);
    return book;
  }

  function createPrintQuote(input = {}) {
    if (!input.bookId || !books.has(input.bookId) || !input.providerId) throw new Error('valid bookId and providerId are required');
    const quote = {
      id: crypto.randomUUID(), bookId: input.bookId, providerId: input.providerId,
      quantity: Number(input.quantity || 1), specification: input.specification || {},
      printCost: Number(input.printCost || 0), shippingCost: Number(input.shippingCost || 0),
      currency: input.currency || 'USD', expiresAt: input.expiresAt || null,
      status: 'quoted', createdAt: new Date().toISOString()
    };
    printQuotes.set(quote.id, quote);
    return quote;
  }

  function createOrder(input = {}) {
    if (!input.bookId || !books.has(input.bookId)) throw new Error('valid bookId is required');
    const order = {
      id: crypto.randomUUID(), bookId: input.bookId, buyerId: input.buyerId || null,
      format: input.format || 'ebook', quantity: Number(input.quantity || 1),
      fulfillmentMode: input.fulfillmentMode || 'digital', providerId: input.providerId || null,
      status: 'created', totals: input.totals || {}, tracking: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    orders.set(order.id, order);
    io?.emit('books:order', order);
    return order;
  }

  function updateOrder(id, patch = {}) {
    const order = orders.get(id);
    if (!order) return null;
    const allowed = ['status', 'providerId', 'tracking', 'totals', 'fulfillmentMode'];
    for (const key of allowed) if (key in patch) order[key] = patch[key];
    order.updatedAt = new Date().toISOString();
    io?.emit('books:order', order);
    return order;
  }

  return {
    manifest,
    createBook, updateBook, getBook: (id) => books.get(id) || null, listBooks: () => Array.from(books.values()),
    createPrintQuote, getPrintQuote: (id) => printQuotes.get(id) || null, listPrintQuotes: () => Array.from(printQuotes.values()),
    createOrder, updateOrder, getOrder: (id) => orders.get(id) || null, listOrders: () => Array.from(orders.values())
  };
}

module.exports = { createBooksManager };
