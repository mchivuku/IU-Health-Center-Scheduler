@extends('...layouts.new-appointment')
@section('new-appointment-content')

<p>You are scheduling an appointment for - {{$model->visitType}}</p>
<p>
<ul>
<li>Choose a provider</li>
<li>select desired appointment</li>
<li>select desired appointment time, then click next</li>
</ul>
</p>


{{ Form::open(array('method'=>'post','id'=>'scheduleSave','action'=>'NewAppointmentController@scheduleSave')) }}

<div id="datepickerCalendar"></div>

<ul class="time-of-day">
@foreach($model->tabs as $k=>$v)
<li  id="$k">{{$v}}</li>
@endforeach
</ul>

    <div class="available-timeslots">
@include('includes.timeslots',array('model'=>$model))
    </div>
{{Form::hidden('facility', $model->facility,array('id'=>'facility'));}}
{{Form::hidden('visitType', $model->visitType,array('id'=>'visitType'));}}
{{Form::hidden('selectedTimes','',array('id'=>'selectedTimes'));}}
{{Form::hidden('date','',array('id'=>'date'));}}


{{ Form::submit('Next', array('class' => 'btn')) }}
{{ Form::close() }}


@stop

@section('javascript')

{{ HTML::script('js/jquery-ui.js')}}

<script type="text/javascript">

$(document).ready(function(){
$(".five").on("click", function() {
       if ($(this).hasClass("full")) {

       } else {

           $(this).toggleClass("selected");
       }
   });


$("#datepickerCalendar").datepicker({

  onSelect: function(){
       var providerId = $('#provider').val();
        getTimes(providerId,this.value);

  }
});


$('#provider').change(function(){
       var date = $('#datepickerCalendar').val();
        getTimes($(this).val(),date);
});


$('form#scheduleSave .btn').click(function(event){
event.preventDefault();
var times=[];
$('.selected a').each(function(){
  times.push($(this).text());
});

$('#selectedTimes').val(times);
$('#date').val($('#datepickerCalendar').val());

$(this).parent('form').submit();
});

});


function getTimes(providerId,date){
    $.get('getTimes',
      {'providerId':providerId,
      'date':date},
        function(data) {
          $('#times').empty().html(data);
        });

}

</script>

@stop

