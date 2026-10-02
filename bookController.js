const Book = require('./models');

exports.list = async (req, res) => {
    const books = await Book.find();
    res.render('index', { books });
};

exports.newForm = (req, res) => res.render('new');

exports.create = async (req, res) => {
    await Book.create(req.body);
    res.redirect('/books');
};

exports.editForm = async (req, res) => {
    const book = await Book.findById(req.params.id);
    res.render('edit', { book });
};

exports.update = async (req, res) => {
    await Book.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/books');
};

exports.remove = async (req, res) => {
    await Book.findByIdAndDelete(req.params.id);
    res.redirect('/books');
};