'use strict';

angular.module('chartsApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
	
	/**
	 * Utility function that generate some random data for our charts..
	 * @return {Number|Array} Array of random number data
	 */
	var generateData = function() {
		var values = [];
		var prevValue = Math.random() * 50;
		for (var i = 0; i < 100; i++) {
			prevValue = Math.abs(prevValue + Math.floor((Math.random() * 50)) - 25);
			values[values.length] = prevValue;
		}
		return values;
	};
	
	//Generate data for our charts...
	$scope.data = [];
	for (var i = 0; i < 12; i++) {
		$scope.data[i] = generateData();
	}
	
	$scope.onClick = function(item) {
		console.log(item);
	};
  });
