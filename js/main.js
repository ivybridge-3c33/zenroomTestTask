jQuery(document).ready(function($) {
	$('body').on('click', '#operationBtn', function(){
		$('#operationsBox').toggle('fast');
	});

	$('body').on('change', '.daysRange', function(){
		var type = $(this).data('rangetype');
		$('.daysRange[data-rangetype!="'+type+'"]').prop('checked', false);

		if(type == 'alldays'){
			$('.day').prop('checked', true);
		}else{
			$('.day[data-datetype="'+type+'"]').prop('checked', true);
			$('.day[data-datetype!="'+type+'"]').prop('checked', false);
		}
		if($('.daysRange:checked').length == 0){
			$('.day').prop('checked', false);
		}
	});

	$('body').on('change', '.day', function(){
		if($('.day:checked').length == 7){
			$('.daysRange[data-rangetype="alldays"]').prop('checked', true).trigger('change');
		}else{
			if($('.day[data-datetype="weekday"]:checked').length == 5 && $('.day[data-datetype="weekend"]:checked').length == 0){
				$('.daysRange[data-rangetype="weekday"]').prop('checked', true).trigger('change');
			}else if($('.day[data-datetype="weekday"]:checked').length == 0 && $('.day[data-datetype="weekend"]:checked').length == 2){
				$('.daysRange[data-rangetype="weekend"]').prop('checked', true).trigger('change');
			}else{
				$('.daysRange').prop('checked', false);
			}
		}
	});


	$.ajax({
		url: sourceFile('getRoomTypes'),
		type: 'post',
		dataType: 'html',
	})
	.done(function(res) {
		try{
			var data = $.parseJSON(res);
			$.each(data, function(index, val) {
				$('#idroomtype').append('<option value="'+val.idroomtype+'" data-minimumprice="'+val.minimumprice+'">'+val.roomtypename+'</option>');
			});
		}catch(err){
			alert(res);
		}
	})	
	.fail(function(res) {
		alert('Error! something went wrong');
	})
	.always(function() {
	});


	var today = new Date();
	var startDate = moment(new Date(today.getFullYear(), today.getMonth(), 1));
	$('#monthLabel').html(startDate.format('MMMM, Y'));
	$('#rateMonth').val(startDate.format('YYYY-MM-DD'));
	$('#rateMonth').datepicker( {
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        dateFormat: 'dd-MM-yy',
		beforeShow: function (e, t) {
            $("#ui-datepicker-div").addClass("hide-calendar");
			$("#ui-datepicker-div").addClass('HideTodayButton');
        },
        onClose: function(dateText, inst) { 
        	var newDate = new Date(inst.selectedYear, inst.selectedMonth, 1);
            $(this).datepicker('setDate', newDate);
            $('#monthLabel').html(moment(newDate).format('MMMM, YYYY'));
			loadRates();
        }
    });

	$('body').on('click', '.monthBtn', function(){
		var d = $("#rateMonth").datepicker('getDate');
		var newDate = null;
		if($(this).data('type')=='backward'){
        	newDate = new Date(d.getFullYear(), d.getMonth()-1, 1);
		}else{
        	newDate = new Date(d.getFullYear(), d.getMonth()+1, 1);
		}
        $('#rateMonth').datepicker('setDate', newDate);
        $('#monthLabel').html(moment(newDate).format('MMMM, YYYY'));
		loadRates();
	});


	$('body').on('click', '#selectMonthBtn', function(){
		$('#rateMonth').datepicker('show');
	});

	$('#setRateForm').submit(function(e){
		e.preventDefault();
	});
});

function loadRates()
{
	$.ajax({
		url: sourceFile('getRates'),
		type: 'post',
		dataType: 'html',
		data: {month: $('#rateMonth').val()},
		beforeSend: function(){
			$('#rateList').empty();
		}
	})
	.done(function(res) {
		try{
			var data = $.parseJSON(res);
			$.each(data, function(index, val) {
				
			});
		}catch(err){
			alert(res);
		}
	})
	.fail(function(res) {
		alert('Error! something went wrong');
	})
	.always(function() {
	});
	
}

function sourceFile(functionName)
{
	return 'app.php/'+functionName;
}