
mapboxgl.accessToken =mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12', // Use the standard style for the map
    zoom: 9, // initial zoom level, 0 is the world view, higher values zoom in
    center: listing.geometry.coordinates
});


console.log(coordinates);
 const marker= new mapboxgl.Marker({color:'black'})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({offset:25})
    .setHTML(`<h4>${listing.location}</h4><p>Exact Loaction Provided after Booking!</p>`))
    .addTo(map);