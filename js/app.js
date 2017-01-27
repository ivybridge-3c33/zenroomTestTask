
var app = angular.module('zenroomsApp', []);
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

app.controller('RateController', function RateController($scope, $http) {
  var today = new Date();
  var startDate = moment(new Date(today.getFullYear(), today.getMonth(), 1));
  $scope.calendarLabel = startDate.format('MMMM, Y');
  $scope.calendarDate = startDate.format('YYYY-MM-DD');

  $scope.navidate = function(to) {
    var d = moment();
    if(to == 'forward'){
      newDate = new Date(d.getFullYear(), d.getMonth()+1, 1);

    }else{
      newDate = new Date(d.getFullYear(), d.getMonth()-1, 1);
    }
  }

  $scope.dayChecked = 0;
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

  $scope.getRates = function() {
  	
  }

  $scope.setRates = function() {
    var scopeData = $scope.rateForm;
    var data = {
      price: scopeData.price,
      availability: scopeData.availability,
      startDate: scopeData.startDate,
      endDate: scopeData.endDate,
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
    if(moment(scopeData.startDate, 'YYYY-MM-DD', true).isValid() == false){
      errors.push('- Start date is not correct');
    }
    if(moment(scopeData.endDate, 'YYYY-MM-DD', true).isValid() == false){
      errors.push('- End date is not correct');
    }
    if(data.days.length == 0){
      errors.push('- Must select some day');
    }
    if(typeof data.price == 'undefined' || data.price <= 0){
      errors.push('- Price cannot less than 0 (zero)');
    }
    if(typeof data.availability == 'undefined' || data.availability <= 0){
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
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(response) {
      console.log(response);
        if(response == 1){
        }else{
            alert('error', "Error cannot load log data.", 'error code '+response.status);
        }
    }, function errorCallback(response) {
      console.log(response);
        alert('error', "Error Server error", 'error code '+response.status);
    });
  }

});