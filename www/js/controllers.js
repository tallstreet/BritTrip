angular.module('starter.controllers', ['facebook', 'ionic'])

//angular.module('starter.controllers', [])

.config(['FacebookProvider', function(FacebookProvider) {
    FacebookProvider.init('456458934502537');
    }
])

.controller('LoginCtrl', function($scope, $ionicPopup, $state, Facebook) {
        $scope.user = {};
        $scope.logged = false;

        $scope.$watch(
            function() {
                return Facebook.isReady();
            },
            function(newVal) {
                if (newVal)
                    $scope.facebookReady = true;
            }
        );

        var isUserLoggedIn = false;

        $scope.login = function() {
            if (isUserLoggedIn) {
                $state.go('app.counter');
            } else {
                Facebook.login(function(response) {
                    if (response.status == 'connected') {
                        window.localStorage.fbAccessToken = response.authResponse.accessToken;
                        window.localStorage.fbResponse = response;
                        $scope.logged = true;
                        $state.go('app.counter');
                    } else {
                        window.localStorage.fbAccessToken = ''
                        window.localStorage.fbResponse = {};
                        $scope.showLoginFailed();
                        $scope.logged = false;
                    }
                }, {scope: 'user_about_me, user_likes'});
            }
        };

        $scope.showLoginFailed = function() {
            var alertPopup = $ionicPopup.alert({
                title: 'Cats are evil',
                template: 'Login failed.'
            });
        };
    }
)

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeLogin();
        }, 1000);
    };
})

.controller('PlaylistsCtrl', function($scope) {
    $scope.playlists = [{
        title: 'Reggae',
        id: 1
    }, {
        title: 'Chill',
        id: 2
    }, {
        title: 'Dubstep',
        id: 3
    }, {
        title: 'Indie',
        id: 4
    }, {
        title: 'Rap',
        id: 5
    }, {
        title: 'Cowbell',
        id: 6
    }];
})

.controller('weight', function($scope) {
    // resObj = window.localStorage.fbResponse
    // response = JSON.parse(window.localStorage.fbResponse);
    cats = [["cities and towns", 0],
            ["countryside", 0],
            ["culture", 0],
            ["family friendly", 0],
            ["film and tv", 0],
            ["food and drinks", 0],
            ["landmarks", 0],
            ["music", 0]];

    fbCats = ["cities","food"];

    for(i = 0; i<fbCats.length; i++){
        max = 0;
        target = "";
        for(c = 0; c < cats.length; c++){
            var l = new Levenshtein(fbCats[i], cats[c][0]);
            if(l > max){ max = l; target = c}
        }
        cats[target][1] += max;
    }

    //var l = new Levenshtein('hello', 'man');
    //$scope.dist = l.distance;
    console.log(cats);
})

.controller('counterPage', function($scope, $state, Facebook, $cordovaGeolocation) {
    $scope.settings = {};
    $scope.settings.time_left = new Date();
    $scope.settings.time_left.setSeconds(0);
    $scope.settings.time_left.setMilliseconds(0);
    $scope.settings.final_dest_text = "";

    var posOptions = {
        timeout: 10000,
        enableHighAccuracy: false
    };
    $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function(position) {
            $scope.final_dest = position.coords;
        }, function(err) {
            // error
        });


    var watchOptions = {
        frequency: 1000,
        timeout: 3000,
        enableHighAccuracy: false // may cause errors if true
    };

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
    watch.then(
        null,
        function(err) {
            // error
        },
        function(position) {
            $scope.final_dest = position.coords;
        });

    $scope.$on('destroy', function() {
      watch.clearWatch();
    });

    $scope.on_search = function() {
      var service = new google.maps.places.AutocompleteService();
      service.getQueryPredictions({ input: $scope.settings.final_dest_text }, function(predictions, status) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          console.log(status);
          return;
        }

        $scope.results = predictions;
      });
    };

    $scope.set_location = function ($result) {
      $scope.final_dest = $result;
    };

    $scope.submit = function() {
      window.localStorage.time_left = JSON.stringify($scope.settings.time_left);
      window.localStorage.final_dest = JSON.stringify($scope.settings.final_dest);
      $scope.getLikes();
      $state.go('app.places');
    };

    $scope.getLikes = function() {
        Facebook.getLoginStatus(function(response) {
            Facebook.api('/me/likes', function(response) {
                $scope.likes = response;
            });
        });
    };
})



.controller('RateCtrl', function($scope) {
    $scope.place = window.localStorage.place || {};
    $scope.place.name = 'London Bridge';

    $scope.submit = function() {
      $http({
          method: 'POST',
          url: 'http://api.visitbritain.com/items/' + $scope.place.id + '/love'
      }).success(function(d){
        console.log(d);
        $scope.timeLine = d;
      });
    };

})

.controller('SearchCtrl', function($scope, $http) {
    $scope.timexx = function() {
        console.log(this.time_left);
        $scope.count_down = this.time_left;
    };
    $scope.time_left = "HH:MM";
    $scope.final_dest = "Heathrow Airport";

    $scope.timex = function() {
        stopped = $timeout(function() {
            console.log($scope.counter);
            $scope.counter--;
            $scope.countdown();
        }, 1000);
    };
    $scope.text;
    $scope.searchIt = function(t) {
        token = 't=A9NsGgd9UmxR';
        url = 'http://api.visitbritain.com/search?title=' + t + '&lang=en&' + token;
        $http({
            method: 'GET',
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(r) {
            // locs = [];
            // for (var i = 0; i < r.data.length; i++) {
            //     if (r.data[i].location != null) {
            //         locs[i] = [r.data[i].location.lat, r.data[i].location.lng];
            //     }

            // }
            console.log(r);
            $scope.results = r;
            $scope.Places = r;
        });
    };

})

.controller('placesCtrl', function($scope, $http) {
    console.log('huh');
    hello = $http.get('http://api.visitbritain.com/items?type=location&near=-3.393402,57.009337&limit=24&t=A9NsGgd9UmxR');

    //console.log(hello);
    pos = '-3.393402,57.009337';
    pos = '-0.155602,51.504034';
    limit = 'limit=24';
    token = 't=A9NsGgd9UmxR';
    me = '';
    uurl = 'http://api.visitbritain.com/items?type=location&near=' + pos + '&' + limit + '&' + token;
    cat = 'http://api.visitbritain.com/items?type=category&' + limit + '&' + token;

    $scope.test = function(lat, lng, lmt) {

        lt = parseFloat(lat);
        ln = parseFloat(lng);
        limit = 'limit=' + lmt;
        token = 't=A9NsGgd9UmxR';
        me = '';
        uurl = 'http://api.visitbritain.com/items?type=location&near=' + ln + ',' + lt + '&' + limit + '&' + token;
        console.log(uurl);
        $http({
            method: 'GET',
            url: uurl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function(r) {
            locs = {};
            for (var i = 0; i < r.data.length; i++) {
                if (r.data[i].location != null) {
                    locs[i] = [r.data[i].location.lat, r.data[i].location.lng];
                }

            }
            $http({
                method: 'POST',
                url: 'http://api.traveltimeapp.com/v3/routes',
                header: {
                  "Content-Type": "application/json"
                },
                data: {
                    "app_id": "893138db",
                    "app_key": "1f666db85092e28ea3ac921ea0c95fa6",
                    "target": {
                        "coords": [lt, ln],
                        "start_time": "2015-03-28T07:15:00.000Z",
                        "travel_time": 30000,
                        "mode": "walking_bus"
                    },
                    "points": locs
                }
            }).success(function(d){
              console.log(d);
              $scope.timeLine = d;
            })
            console.log(r);
            $scope.me = r;
            $scope.Places = r;
        });
    };


    $scope.test(51.5140186,-0.128734, 100);
})

.controller('CatsCtrl', function($scope, $stateParams, $http) {

    $scope.cat = function(lat, lng, lmt) {

        pos = parseFloat(lat);
        pos = parseFloat(lng);
        limit = 'limit=' + lmt;
        token = 't=A9NsGgd9UmxR';
        me = '';
        uurl = 'http://api.visitbritain.com/items?type=category&' + token;
        if (window.localStorage['cats'] == undefined) {
            $http({
                method: 'GET',
                url: uurl,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function(r) {
                catz = []
                for (var i = 0; i < r.data.length; i++) {
                    if (r.data[i].title.length > 1) {
                        catz[i] = {
                            "id": r.data[i].id,
                            "rank": r.data[i].rank,
                            "loves": r.data[i].loves,
                            "images": r.data[i].images,
                            "title": r.data[i].title,
                            "ckecked": false
                        };
                    }
                }
                window.localStorage['cats'] = JSON.stringify(catz);
                console.log(r);
                console.log(catz);

                $scope.cats = JSON.parse(window.localStorage['cats'] || '{}');
            });
        }

    };

    $scope.cat();
    $scope.cats = JSON.parse(window.localStorage['cats'] || '{}');
    $scope.clicked = function(id) {
        console.log(id);
        data = JSON.parse(window.localStorage['cats'] || '{}');
        for (var i = 0; i < data.length; i++) {
            if (parseInt(data[i].id) == parseInt(id)) {
                if (data[i].checked == false) {
                    data[i].checked = true;
                } else {
                    data[i].checked = false;
                }

            }
            console.log(data[i]);
        }
        window.localStorage['cats'] = JSON.stringify(data);
        console.log(data);

    }

})

.controller('GeoCtrl', function($scope, $cordovaGeolocation) {

    var posOptions = {
        timeout: 10000,
        enableHighAccuracy: false
    };
    $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function(position) {
            var lat = position.coords.latitude
            var long = position.coords.longitude
            $scope.my_lat = lat;
            $scope.my_long = long;
        }, function(err) {
            // error
        });


    var watchOptions = {
        frequency: 1000,
        timeout: 3000,
        enableHighAccuracy: false // may cause errors if true
    };

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
    watch.then(
        null,
        function(err) {
            // error
        },
        function(position) {
            var lat = position.coords.latitude
            var long = position.coords.longitude
        });


    watch.clearWatch();
    // OR
    // $cordovaGeolocation.clearWatch(watch)
    //   .then(function(result) {
    //     // success
    //     }, function (error) {
    //     // error
    //   });
})
