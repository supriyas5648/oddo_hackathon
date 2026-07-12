const express = require('express');
const controller = require('../controllers/asset.controller');
const validate = require('../middlewares/validate');
const v = require('../validations/asset.validation');

const router = express.Router();

router
  .route('/')
  .get(validate(v.listAssets), controller.list)
  .post(validate(v.createAsset), controller.create);

// Aggregate counts for the dashboard stat cards.
// Declared before '/:id' so "stats" isn't matched as an asset id.
router.get('/stats', controller.stats);

// Lifecycle timeline (created / allocated / returned events), newest first.
router.get('/:id/lifecycle', validate(v.assetId), controller.lifecycle);

router
  .route('/:id')
  .get(validate(v.assetId), controller.getById)
  // PUT per module spec; PATCH accepted too for partial-update consistency.
  .put(validate(v.updateAsset), controller.update)
  .patch(validate(v.updateAsset), controller.update)
  .delete(validate(v.assetId), controller.remove);

module.exports = router;
