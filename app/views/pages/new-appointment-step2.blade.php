@extends('...layouts.new-appointment')
@section('new-appointment-content')


 @if(isset($model->providers))
{{ Form::open(array('method'=>'post','action'=>'NewAppointmentController@scheduleConfirm','id'=>'scheduleSave')) }}

{{Form::hidden('facility', $model->facility,array('id'=>'facility','name'=>'facility'));}}
{{Form::hidden('visitType', $model->visitType,array('id'=>'visitType','name'=>'visitType'));}}
{{Form::hidden('visitDuration',
$model->visitDuration,array('id'=>'visitDuration','name'=>'visitDuration'));}}
 {{Form::hidden('date','',array('id'=>'date','name'=>'date'));}}
 {{Form::hidden('startTime',$model->selected_startTime,array('id'=>'startTime','name'=>'startTime'));}}

 <div class="column schedule-appointments">
<span class="step">1</span>
<label>Select a Provider</label>
        <div class="section-dropdown">
                    {{ Form::opt_group('provider',$model->providers,$model->selectedProvider,array('id'=>'providers')) }}

                    </div>

                    <span class="step">2</span><label>Select a Day</label>
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
    <li class="{{strtolower($v)}} active"><a href="#">{{$v}}</a></li>

    @else
    <li class="{{strtolower($v)}}"><a href="#">{{$v}}</a></li>

    @endif
    @endforeach
    </ul>

       @include('includes.timeslots',array('model'=>$model))
</div>

</div>

@else

 <div class="column schedule-appointments">
     <p> {{$model['message']}} </p>
</div>
@endif



@stop

@section('next_back_button')
@if(isset($model->providers))
<section class="section bg-none">
                <div class="row pad extra-padding">

   <a   class="button back invert" href="{{ URL::to('newAppointment') }}">Back</a>
{{ Form::submit('Next', array('class' => 'button next','id'=>'scheduleSubmit')) }}
                </div>
            </section>
@else
<section class="section bg-none">  <div class="row pad extra-padding">
  <a   class="button back invert" href="{{ URL::to('newAppointment') }}">Back</a>
   </div>
              </section>
@endif
@stop


@section('javascript')

{{ HTML::script('js/jquery-ui.js')}}

<script type="text/javascript">
$(document).ready(function(){


$('ul.time-of-day li').on("click", function() {
    $('ul.time-of-day li.active').removeClass('active');
    $(this).addClass('active');
    getAvailableTimes(getProviderId(),getDate(),gettabId());

});


$('#providers').change(function(){
        getAvailableTimes($(this).val(),getDate(),gettabId());
});

$("#datepicker").datepicker({
  onSelect: function(){
       getAvailableTimes(getProviderId(),$(this).val(),gettabId());

  }



});

update_time_links();

/* Form post */

$('#scheduleSubmit').click(function(event){
event.preventDefault();

$('#startTime').val($('.available-timeslots .morning,.available-timeslots .afternoon').children('.selected').text());
$('#date').val($('#datepicker').val());
$('form#scheduleSave').submit();
});

});

function update_time_links(){

$('.morning, .afternoon').children().on('click',function(){
           $('div.selected').removeClass('selected');
           $(this).addClass('selected');
           var startTime = $(this).text();
           saveSelectedTime(startTime)

});
}

 function getProviderId(){
  return $('#providers').val();
 }
 function gettabId(){
    return $("ul.time-of-day li.active").index()+1;
 }
 function getDate(){
    return $('#datepicker').val();
 }
 function getVisitType(){
 return $('#visitType').val();
 }
 function getFacility(){
 return $('#facility').val();
 }
 function getFirstAvailableProvider(){
 return $('#firstAvailableProvider').val();
 }
 function getAvailableTimes(providerId,date,tabId){
     var visitType =  getVisitType();
     var facility = getFacility();
     var firstAvailableProvider = getFirstAvailableProvider();

     $.get('getAvailableTimes',
         {'providerId':providerId,'visitType':visitType, 'facility':facility,

          'date':date,'tabId':tabId},
       function(data) {
       if(data.message){
        $('.available-timeslots').empty().html(data.message);
       }else{
             $('.available-timeslots').empty().html(data);
                 update_time_links();
       }

        });

 }

function saveSelectedTime(startTime){

     var visitDuration = $('#visitDuration').val();
     var firstAvailableProvider = getFirstAvailableProvider();
    $.get('saveSelectedTime',
         {'providerId':getProviderId(),'visitType':getVisitType(), 'facility':getFacility(),'firstAvailableProvider':firstAvailableProvider,
          'date':getDate(),'startTime':startTime,'visitDuration':visitDuration}
     );

}
</script>

@stop
