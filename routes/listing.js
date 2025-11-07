const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const listingController=require("../controller/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({storage })

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn,upload.single("listing[image]"),wrapAsync(listingController.createListing));







// isLoggedIn, wrapAsync(listingController.createListing)

router.get("/new", isLoggedIn,listingController.renderNewForm);

router
.route("/:id")
.get( wrapAsync(listingController.showNewForm))
.put(isLoggedIn,upload.single("listing[image]"), isOwner, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroy));



router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));


module.exports = router;
