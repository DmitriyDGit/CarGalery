var express = require('express'),
    router  = express.Router(),
    galleryController  = require("../../server/controllers/galleryController");

router.get('/testApi', galleryController.testApi);

router.get('/getGalleryList', galleryController.getGalleryList);

router.post('/saveGalleryItem', galleryController.saveGalleryItem);

router.get('/getGalleryItemByName', galleryController.getGalleryItemByName);


module.exports = router;