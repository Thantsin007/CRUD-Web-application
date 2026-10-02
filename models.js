const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: Number,
    copies: { type: Number, default: 1 }
});

const MongoBook = mongoose.models.Book || mongoose.model('Book', bookSchema);
const localBooksFile = path.join(__dirname, '..', 'data', 'books.json');

function readLocalBooks() {
    try {
        return JSON.parse(fs.readFileSync(localBooksFile, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

function writeLocalBooks(books) {
    fs.mkdirSync(path.dirname(localBooksFile), { recursive: true });
    fs.writeFileSync(localBooksFile, JSON.stringify(books, null, 2));
}

function isMongoConnected() {
    return mongoose.connection.readyState === 1;
}

function toLocalBook(data, id = randomUUID()) {
    return {
        _id: id,
        title: data.title,
        author: data.author,
        year: data.year ? Number(data.year) : undefined,
        copies: data.copies ? Number(data.copies) : 1
    };
}

module.exports = {
    async find(...args) {
        return isMongoConnected() ? MongoBook.find(...args) : readLocalBooks();
    },
    async create(data) {
        if (isMongoConnected()) return MongoBook.create(data);
        const books = readLocalBooks();
        const book = toLocalBook(data);
        books.push(book);
        writeLocalBooks(books);
        return book;
    },
    async findById(id) {
        if (isMongoConnected()) return MongoBook.findById(id);
        return readLocalBooks().find(book => book._id === id) || null;
    },
    async findByIdAndUpdate(id, data) {
        if (isMongoConnected()) return MongoBook.findByIdAndUpdate(id, data);
        const books = readLocalBooks();
        const index = books.findIndex(book => book._id === id);
        if (index === -1) return null;
        books[index] = toLocalBook(data, id);
        writeLocalBooks(books);
        return books[index];
    },
    async findByIdAndDelete(id) {
        if (isMongoConnected()) return MongoBook.findByIdAndDelete(id);
        const books = readLocalBooks();
        const remainingBooks = books.filter(book => book._id !== id);
        if (remainingBooks.length === books.length) return null;
        writeLocalBooks(remainingBooks);
        return true;
    }
};