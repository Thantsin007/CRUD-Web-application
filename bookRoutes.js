const express = require('express');
const router = express.Router();
const c = require('./bookController');

router.get('/', c.list);
router.get('/new', c.newForm);
router.post('/', c.create);
router.get('/:id/edit', c.editForm);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;