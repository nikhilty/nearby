
const FOURSQUARE_SEARCH_URL = "https://api.foursquare.com/v2/venues/explore?&client_id=FPRD2S2RFIB4QLBNBBHNAMLYOUF2AZSZ21ZK53QYASWCRJ1Z&client_secret=FEFA44EG0YDZ0XKA1UWX5ZWLZJLE30E2GYRLGB44PKE5KZ0E&v=20170915";

var gmarkers = [];
let locations = [];


let state = {
    radius: 500, //default value
    currentLocation: {},
    category: "TOPPICKS"

};

const fetchvenues = (lat, lng, radius, category) => {

    var section = "TOPPICKS";
    if (category) {
        section = category;
    }
    $.ajax(FOURSQUARE_SEARCH_URL, {
        data: {
            ll: `${lat},${lng}`,
            radius,
            venuePhotos: 1,
            limit: 25,
            query: 'recommended',
            section: section
        },
        dataType: 'json',
        type: 'GET',
        success: function (data) {
            clearMap();
            try {
                if (data.response.groups[0].items.length === 0) {
                    alert("Sorry! No Results Found.");
                    return;
                }
                let results = data.response.groups[0].items.map(function (item, index) {
                    var loc = [`${item.venue.name}<br>\ ${item.venue.location.formattedAddress[0]} <br>\ ${item.venue.location.formattedAddress[1]} <br>\
                                        ${item.venue.location.formattedAddress[2]} <br>\
                                        <a href="http://maps.google.com/maps?q=loc: ${item.venue.location.lat}, ${item.venue.location.lng}&navigate=yes">Get Directions</a>`, item.venue.location.lat, item.venue.location.lng];

                    locations.push(loc);
                });
                initMap();
            } catch (e) {
                alert("Error occurred while rendering data!");
            }
        },
        error: function (e) {
            alert("Error occurred while retreiving data!");
        }
    });
}

function initMap() {

    var center = {
        lat: state.currentLocation.lat,
        lng: state.currentLocation.lng
    };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: center
    });
    var infowindow = new google.maps.InfoWindow({});
    var marker, count;

    for (count = 0; count < locations.length; count++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(locations[count][1], locations[count][2]),
            map: map,
            title: locations[count][0]
        });
        gmarkers.push(marker);
        google.maps.event.addListener(marker, 'click', (function (marker, count) {
            return function () {
                infowindow.setContent(locations[count][0]);
                infowindow.open(map, marker);
            }
        })(marker, count));
    }
    document.getElementById('map').style.display = "block";
}

const clearMap = () => {
    if (gmarkers.length > 0) {
        locations = [];
        for (var i = 0; i < gmarkers.length; i++) {
            gmarkers[i].setMap(null);
        }
    }
}

const initiate = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            state.currentLocation.lng = position.coords.longitude;
            state.currentLocation.lat = position.coords.latitude;
            render();
        }, (error) => {
            alert("Couldn't fetch your current location.");
        });
    }
}

const changeRadius = (event) => {
    state.radius = parseInt(event.target.value);
    fetchvenues(state.currentLocation.lat,state.currentLocation.lng,state.radius);
}

const render = () => {
    
    $('.navigation').removeClass("hide");
    $('#radius').removeClass("hide");
    $("#radius").change(function (e) {
        changeRadius(e);
    });
    $('.category-button').click(function () {
        let city = $('.search-query').val();
        state.category = $(this).text();
        fetchvenues(state.currentLocation.lat, state.currentLocation.lng, state.radius, state.category);
    });
    fetchvenues(state.currentLocation.lat, state.currentLocation.lng, state.radius);
};


export default {fetchvenues, state, initiate};