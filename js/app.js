
var app = angular.module('zenroomsApp', ["xeditable"]);
app.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-sm';
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
/*app.directive('datepicker', function($parse){
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
          datepicker: '@'
        },
        link: function($scope, $element, $attrs, $ngModelCtrl){
            $(function(){
                $($element).datepicker({
                    dateFormat:'yy-mm-dd',
                    minDate: 0,
                    beforeShow: function(element, datepicker){
                        if($attrs.minDate){
                            angular.element($element).datepicker("option", "minDate", $attrs.minDate);
                        }
                    },
                    onSelect:function(date){
                      if($scope.datepicker != ''){
                        $($scope.datepicker).datepicker("option", "minDate", date);
                        if(date > $($scope.datepicker).datepicker("getDate")){
                          $($scope.datepicker).datepicker("setDate", date);
                        }
                      }
                        $scope.$apply(function(){
                            $ngModelCtrl.$setViewValue(date);
                        });
                    }
                });
            });
        }
    }
});*/

app.controller('RateController', function RateController($scope, $filter, $http, $q) {
  var today = new Date();
  var startDate = moment();
  $scope.totalDayOfCalendar = 15;
  $scope.calendarLabel = startDate.format('MMMM, Y');
  $scope.calendarDate = startDate.format('YYYY-MM-DD');
  $scope.monthSelectionYear = startDate.format('YYYY');
  $scope.monthSelectionMonth = startDate.format('M');
  $scope.minimumPrice = 0;

  $scope.dayChecked = 0;
  $scope.daysOfMonth = [];
  $scope.roomtypes = [];

  $scope.rateForm = {
    price: 0,
    availability: 0,
    startDate: null,
    endDate: null,
    daysRange: {
      alldays: {value:'alldays', label:'All days'} , 
      weekday: {value:'weekday', label:'All weekdays'}, 
      weekend: {value:'weekend', label:'All weekends'}
    },
    days: [
      {value:1, label:"monday", type: "weekday"},
      {value:2, label:"tuesday", type: "weekday"},
      {value:3, label:"wednesday", type: "weekday"},
      {value:4, label:"thursday", type: "weekday"},
      {value:5, label:"friday", type: "weekday"},
      {value:6, label:"saturday", type: "weekend"},
      {value:7, label:"sunday", type: "weekend" }
    ]

  }

  $scope.colorList = [
    '#7CB9E8',
    '#669999',
    '#E3DAC9',
    '#FFC1CC',
    '#E7FEFF',
    '#f3946f',
    '#c294da',
    '#74a5d4',
  ];

  $scope.setMinimum = function(idroomtype){
    angular.forEach($scope.roomtypes, function(val){
      if(val.idroomtype == idroomtype){
        $scope.minimumPrice = val.minimumprice;
        $scope.maximumAvailability = val.totalrooms;
        if(parseInt(val.totalrooms) < parseInt($scope.rateForm.availability)){
          $scope.rateForm.availability = parseInt(val.totalrooms);
        }
        if(parseFloat(val.minimumprice) > $scope.rateForm.price){
          $scope.rateForm.price = parseFloat(val.minimumprice);
        }
        return;
      }
    });
  }

  $scope.navigate = function(to) {
    var startDate = moment($scope.calendarDate);
    if(to == 'forward'){
      startDate = startDate.add($scope.totalDayOfCalendar, 'days');
    }else{
      startDate = startDate.subtract($scope.totalDayOfCalendar, 'days');
    }
    $scope.calendarDate = startDate.format('YYYY-MM-DD');
  	$scope.calendarLabel = startDate.format('MMMM, Y');
  	$scope.monthSelectionYear = startDate.format('YYYY');
  	$scope.monthSelectionMonth = startDate.format('M');

    $scope.getRates();
  }

  $scope.countDay = function(data){
    if(data.Selected == true){
      $scope.dayChecked++;
    }else{
      $scope.dayChecked--;
    }
  }

  $scope.eval = function(command){
    eval(command);
  };

  $http.get('app.php/getRoomTypes').then(function(response) {
    $scope.roomtypes = response.data;
  });

  $scope.daysRangeToggle = function(type) {
    angular.forEach($scope.rateForm.daysRange, function (item, key) {
      if(item.value != type){
        item.Selected = false;
      }
    });
    var totalDay = 0;
    angular.forEach($scope.rateForm.days, function (item, key) {
      if(type == 'alldays'){
        item.Selected = true;
      }else{
        item.Selected = (type == item.type);
      }
      if(item.Selected == true){
        totalDay++;
      }
    });

    $scope.dayChecked = totalDay;
  }

  $scope.dayToggle = function(type) {
    var countDaysGroup = {weekdays: 0, weekends: 0};
    angular.forEach($scope.rateForm.days, function (item, key) {
      if(item.type == 'weekday' && item.Selected == true){ countDaysGroup.weekdays++; }
      else if(item.type == 'weekend' && item.Selected == true) { countDaysGroup.weekends++; }
    });
    if(countDaysGroup.weekdays == 5 && countDaysGroup.weekends == 2){
      $scope.rateForm.daysRange.alldays.Selected = true;
      $scope.daysRangeToggle('alldays');
    }else if(countDaysGroup.weekdays == 5 && countDaysGroup.weekends == 0){
      $scope.rateForm.daysRange.weekday.Selected = true;
      $scope.daysRangeToggle('weekday');
    }else if(countDaysGroup.weekdays == 0 && countDaysGroup.weekends == 2){
      $scope.rateForm.daysRange.weekend.Selected = true;
      $scope.daysRangeToggle('weekend');
    }else{
      $scope.rateForm.daysRange.alldays.Selected = false;
      $scope.rateForm.daysRange.weekday.Selected = false;
      $scope.rateForm.daysRange.weekend.Selected = false;
    }

  }

  $scope.months = function(){
  	var months = [];
  	for(var i = 1; i <= 12; i++){
  		months[i] = moment(new Date(0, i, 0)).format('MMMM');
  	}
  	return months;
  }

  $scope.updateMonthSelection = function() {
    if($scope.monthSelectionMonth > 0){
    	var newDate = moment([$scope.monthSelectionYear, $scope.monthSelectionMonth-1]);
    	$scope.calendarDate = newDate.format('YYYY-MM-DD');
    	$scope.calendarLabel = newDate.format('MMMM, Y');
    	$scope.getRates();
    }else{
      alert('Please select month');
    }
  }

  $scope.years = function(){
  	var currentDate = new Date();
  	var min = currentDate.getFullYear();
  	var max = min+3;
    var years = [];
    for (var i = min; i <= max; i++) {
      years.push(i);
    }
    return years;
  }

  $scope.getRates = function() {
    var currentDate = moment($scope.calendarDate);
    var startDate = currentDate.clone().subtract(1, 'days').startOf('day'); //.format('D');
    var toDate = currentDate.add($scope.totalDayOfCalendar, 'days').clone().startOf('day'); //.format('D');
    var daysOfMonth = [];
    while(startDate.add(1, 'days').diff(toDate) < 0) {
      daysOfMonth.push({day: startDate.format('D'), label: startDate.format('ddd'), month: startDate.format('MMM')});
    }
    $scope.daysOfMonth = daysOfMonth;

    $http({
        method: 'POST',
        url: 'app.php/getRates',
        data: {startDate: $scope.calendarDate, totalDayOfCalendar: $scope.totalDayOfCalendar},
        headers: {'Content-Type': 'application/json'}
    }).then(function successCallback(response) {
        if(typeof response.data.errors == 'undefined'){
          $scope.rateList = response.data;
        }else{
            alert('error', "Error cannot load data.", response.data.errors + 'error code '+response.status);
        }
    }, function errorCallback(response) {
        alert('error', "Error Server error", 'error code '+response.status);
    });
  }

  $scope.getRates();


  $scope.setRates = function() {
    var scopeData = $scope.rateForm;
    var data = {
      idroomtype: scopeData.idroomtype,
      price: scopeData.price,
      availability: scopeData.availability,
      startDate: moment(scopeData.startDate).format('YYYY-MM-DD'),
      endDate: moment(scopeData.endDate).format('YYYY-MM-DD'),
    };

    var days = [];
    if(scopeData.daysRange.alldays.Selected == true){
      data.daysRange = 'alldays';
    }else if(scopeData.daysRange.weekday.Selected == true){
      data.daysRange = 'weekday';
    }else if(scopeData.daysRange.weekend.Selected == true){
      data.daysRange = 'weekend';
    }
    angular.forEach(scopeData.days, function(val, key) {
      if(val.Selected == true){
        days.push(val.value);
      }
    });
    data.days = days;
    var errors = [];
    if(scopeData.idroomtype == ''){
      errors.push('- Roomtype cannot be null');
    }
    if(moment($scope.rateForm.startDate, 'YYYY-MM-DD', true).isValid() == false){
      errors.push('- Start date is not correct');
    }
    if(moment($scope.rateForm.endDate, 'YYYY-MM-DD', true).isValid() == false){
      errors.push('- End date is not correct');
    }
    if($scope.rateForm.endDate < $scope.rateForm.startDate){
      errors.push('- End date cannot less then Start date');
    }
    var currentDate = new Date();
    if($scope.rateForm.startDate < moment([currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()]).toDate()){
      errors.push('- Start date cannot less then today');
    }
    if(data.days.length == 0){
      errors.push('- Must select some day');
    }
    if(data.price < 0){
      errors.push('- Price cannot less than 0 (zero)');
    }
    if(data.availability < 0){
      errors.push('- Availability cannot less than 0 (zero)');
    }

    if(errors.length > 0){
      var msg = "";
      angular.forEach(errors, function(val){
        msg += val+"\n";
      });
      alert(msg);
      return;
    }

    $http({
        method: 'POST',
        url: 'app.php/setRates',
        data: data,
        headers: {'Content-Type': 'application/json'}
    }).then(function successCallback(response) {
        if(typeof response.data.success == 'string'){
        	alert('Update Success fully');
          $scope.getRates();
        }else{
          alert('error', "Error cannot save data.", response.data.errors + 'error code '+response.status);
        }
    }, function errorCallback(response) {
        alert('error', "Error Server error", 'error code '+response.status);
    });
  }

  $scope.saveManualRate = function(type, data){
    $http({
        method: 'POST',
        url: 'app.php/saveManualRate',
        data: data,
        headers: {'Content-Type': 'application/json'}
    }).then(function successCallback(response) {
        alert('Update Success fully');
        $scope.getRates();
    }, function errorCallback(response) {
        if(response.data != null){
          alert(response.data.errors);
        }
        return "Error Server error", 'error code '+response.status;
    });
  }

  $scope.checkManualValue = function(type, data){
    if((!isNaN(data.price) && (function(x) { return (x | 0) === x; })(parseFloat(data.price)))==false){
      return type+' must be numeric';
    }
    console.log(data);
    if(type == 'price'){

    }
  }

  $scope.newRec = 0;

  $scope.addRoomType = function() {
    $scope.inserted = {
      roomtypename: '',
      description: null,
      minimumprice: 0,
      totalrooms: 0,
      isNew: true,
    };
    $scope.roomtypes['newRec'+$scope.newRec] = ($scope.inserted);
    $scope.newRec++;
  }

  $scope.cancelEdit = function(index, val){
    if(typeof val.isNew != 'undefined'){
      delete $scope.roomtypes[index];
    }
  }

  $scope.saveRoomType = function(index, val){
      $http({
          method: 'POST',
          url: 'app.php/saveRoomType',
          data: val,
          headers: {'Content-Type': 'application/json'}
      }).then(function successCallback(response) {
          if(typeof response.data.data == 'object'){
            alert('Data saved');
            $scope.roomtypes[index] = response.data.data;
            $scope.getRates();
          }else{
            alert('error', "Error cannot save data.", response.data.errors + 'error code '+response.status);
          }
      }, function errorCallback(response) {
          alert('error', "Error Server error", 'error code '+response.status);
      });
  }

  $scope.removeRoomType = function(index, val){
    var idroomtype = val.idroomtype;
    if(confirm('Are you sure to delete?')){
      $http({
          method: 'POST',
          url: 'app.php/removeRoomType',
          data: {idroomtype: idroomtype},
          headers: {'Content-Type': 'application/json'}
      }).then(function successCallback(response) {
          if(typeof response.data.success == 'string'){
            delete $scope.roomtypes[index];
            delete $scope.rateList[index];
            alert('Roomtype has been deleted');
            $scope.getRates();
          }else{
            alert('error', "Error cannot delete roomtype .", response.data.errors + 'error code '+response.status);
          }
      }, function errorCallback(response) {
          alert('error', "Error Server error", 'error code '+response.status);
      });
    }
  }

  $scope.checkPastDay = function(date){
    var currentDate = new Date();
    if(moment(date).toDate() < moment([currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()]).toDate()){
      return 'yes';
    }
    return 'no';
  }


}); 