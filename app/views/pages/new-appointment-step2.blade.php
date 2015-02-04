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

<div class="form-group">


{{ Form::label('name', 'Select Provider',array('class'=>'control-label')) }}
{{ Form::select_list('provider',$model->providers,$model->selectedProvider,array('id'=>'provider','class'=>'form-control')) }}

</div>

{{Form::hidden('facility', $model->facility,array('id'=>'facility'));}}
{{Form::hidden('visitType', $model->visitType,array('id'=>'visitType'));}}
{{Form::hidden('selectedTimes','',array('id'=>'selectedTimes'));}}
{{Form::hidden('date','',array('id'=>'date'));}}



   <div class="container">
   <div class="row-fluid">
   <div class="col-md-4"><div id="datepickerCalendar"></div></div>
        <div class="col-md-8" id="times">  @include('includes.timeslots',
        array('model'=>$model))</div>

   </div>
   </div>


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

