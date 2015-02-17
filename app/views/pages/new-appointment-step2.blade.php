@extends('...layouts.new-appointment')
@section('new-appointment-content')


{{ Form::open(array('method'=>'post','id'=>'scheduleSave','action'=>'NewAppointmentController@scheduleSave')) }}

{{Form::hidden('facility', $model->facility,array('id'=>'facility'));}}
{{Form::hidden('visitType', $model->visitType,array('id'=>'visitType'));}}
{{Form::hidden('selectedTimes','',array('id'=>'selectedTimes'));}}
{{Form::hidden('date','',array('id'=>'date'));}}

<div class="column schedule-appointments">
<span class="step">1</span>

 <div class="section-dropdown">
                    {{ Form::select_list('provider',$model->providers,$model->selectedProvider,array('id'=>'providers')) }}

                    </div>

 <span class="step">2</span>
                    <div class="calendar">
                        <div id="datepicker"></div>
                    </div>

   </div>


<div class="column schedule-appointments">

    <div class="timeslots">
    <span class="step block">3</span>

    <ul class="time-of-day">
    @foreach($model->tabs as $k=>$v)

    @if( $model->activeTab == $k)
    <li class="{{$v}} active">{{$v}}</li>

    @else
    <li class="{{$v}}">{{$v}}</li>

    @endif
    @endforeach
    </ul>

       @include('includes.timeslots',array('model'=>$model))
</div>

</div>



@stop

@section('javascript')

{{ HTML::script('js/jquery-ui.js')}}

<script type="text/javascript">
$(document).ready(function(){

$('ul.time-of-day li').on("click", function() {
    $('ul.time-of-day li.active').removeClass('active');
    $(this).addClass('active');
    var providerId = $('#providers').val();
    var visitType = $('#visitType').val();
    var facility = $('#facility').val();
    var date = $('#datepicker').val();
    var tabId = $("ul.time-of-day li").index($(this))+1;
    $.get('getAvailableTimes',
         {'providerId':providerId,'visitType':visitType, 'facility':facility,
          'date':date,'tabId':tabId},
       function(data) {
          $('.available-timeslots').empty().html(data);
        });

});

$("#datepicker").datepicker({
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
