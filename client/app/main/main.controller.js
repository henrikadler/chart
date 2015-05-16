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
	
	$scope.data = [
      {name: "Greg", score: 98},
      {name: "Ari", score: 96},
      {name: 'Q', score: 75},
      {name: "Loser", score: 48}
    ];
	
	var generateData = function() {
		var values = [];
		var prevValue = 0;
		for (var i = 0; i < 100; i++) {
			prevValue = Math.abs(prevValue + Math.floor((Math.random() * 50)) - 25);
			values[values.length] = prevValue;
		}
		//values[values.length] = 0;
		return values; //[0,50, 110, 140, 130, 80, 75, 120, 130, 100,56,34,123,150,34,56,78,24,8,45,130,0];
	};
	
	$scope.data1 = generateData();
	$scope.data2 = generateData();
	$scope.data3 = generateData();
	$scope.data4 = generateData();
	
	$scope.lineChartData = [
		{name: 'serie1', data: [44,56,57,34,78,89,23,12,89,30]},
		{name: 'serie2', data: [54,76,13,47,27,13,56,15,45,50]},
		{name: 'serie3', data: [67,37,78,12,90,67,34,23,78,24]}
	];
	
	$scope.onClick = function(item) {
		console.log(item);
	};
  });
