@extends('...layouts.new-appointment')

@section('new-appointment-content')

<div class="column schedule-appointments">
    <p> {{$message}} </p>
	<input type="hidden" id="facility" value="{{$facility}}" />
	<input type="hidden" id="visitType" value="{{$visitType}}" />

    <div class="calendar">
        <div id="datepicker"></div>
        <p class="selected-day"><span class="legend"></span><span class="text">Selected Day</span></p>
        <p class="unavailable-day"><span class="legend"></span><span class="text">Unavailable</span></p>
    </div>

</div>
@stop

@section('next_back_button')

<section class="section bg-none">  <div class="row pad extra-padding">

    <a href="{{$back_link}}" class="button back invert">Back</a>
</div>
</section>
@stop

@section('javascript')


<script type="text/javascript">
$(document).ready(function(){

    $("#datepicker").datepicker({
                 beforeShowDay: $.datepicker.noWeekends,
                 minDate: 0,
                 onSelect: function () {
                 	window.location.href = 'https://seville.iuhc.iub.edu/comm/hcScheduler/public/' +
                 	 'newAppointment/schedule?facility='+$('#facility').val()+'&visitType='+$('#visitType').val()+'&date='+
                 	  $(this).val()
                 }
           });

        var date = new Date(<?echo "'".$validDateRange->EndDate."'";?>);
		var currentMonth = date.getMonth();
		var currentDate = date.getDate();
		var currentYear = date.getFullYear();
		$("#datepicker" ).datepicker( "option", "maxDate", new Date(currentYear, currentMonth, currentDate));

});

</script>

@stop

