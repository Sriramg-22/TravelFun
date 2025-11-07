const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



//All Listings
module.exports.index=async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings })
};
//New Listing Form
module.exports.renderNewForm=(req, res) => {
  res.render("listings/new.ejs");
}
//Show New Form
module.exports.showNewForm=async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
  if (!listing) {
    req.flash("error", "Listing not Found!");
    return res.redirect("/listings"); // added return
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
}
//Create New Listing
module.exports.createListing = async (req, res, next) => {
  // 1. Get geocoding from Mapbox
  const response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    })
    .send();

  // 2. Save image
  const url = req.file.path;
  const filename = req.file.filename;

  // 3. Create new listing
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user.id;
  newListing.image = { url, filename };

  // 4. Set geometry from Mapbox response
  newListing.geometry = response.body.features[0].geometry;

  // 5. Save listing
  const savedListing = await newListing.save();
  console.log("Saved listing:", savedListing);

  // 6. Redirect
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

//Showing Edit form
module.exports.renderEditForm=async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing){
    req.flash("error","Listing you requested for doesnot exist");
    res.redirect("/listings");
  }
  let originalImageUrl=listing.image.url;
  originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit",{listing, originalImageUrl});

}
//Updating listing
module.exports.updateListing=async (req, res) => {
  let{ id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if(typeof req.file!== "undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
}
//Deleting Listing
module.exports.destroy=async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}

