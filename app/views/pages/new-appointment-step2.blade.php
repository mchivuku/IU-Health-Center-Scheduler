@extends('...layouts.new-appointment')


@section('new-appointment-content')


 @if(isset($model->providers))
{{ Form::open(array('method'=>'post','action'=>'NewAppointmentController@scheduleConfirm','id'=>'scheduleSave')) }}

{{Form::hidden('facility', $model->facility,array('id'=>'facility','name'=>'facility'));}}
{{Form::hidden('visitType', $model->visitType,array('id'=>'visitType','name'=>'visitType'));}}

 {{Form::hidden('date','',array('id'=>'date','name'=>'date'));}}
 {{Form::hidden('startTime',$model->selected_startTime,array('id'=>'startTime','name'=>'startTime'));}}
 {{Form::hidden('tabId','',array('id'=>'tabId','name'=>'tabId'));}}

 <div class="column schedule-appointments">
<span class="step">1</span>
<label>Select a Provider</label>
        <div class="section-dropdown">
                    {{ Form::opt_group('provider',$model->providers,$model->selectedProvider,array('id'=>'providers')) }}

                    </div>

                    <span class="step">2</span><label>Select a Day</label>
                                        <div class="calendar">
                                            <div id="datepicker"></div>
                                            <p class="selected-day"><span class="legend"></span><span class="text">Selected Day</span></p>
                                            <p class="unavailable-day"><span class="legend"></span><span class="text">Unavailable</span></p>
                                        </div>
   </div>


<div class="column schedule-appointments">
<span class="step times">3</span>
<label class="times">Select a Start Time</label>
    <div class="timeslots">


    <ul class="time-of-day">
    @foreach($model->tabs as $k=>$v)

    @if( $model->activeTab == $k)
    <li class="{{strtolower($v)}} active"><a href="#">{{$v}}</a></li>

    @else
    <li class="{{strtolower($v)}}"><a href="#">{{$v}}</a></li>

    @endif
    @endforeach
    </ul>
<div class="available-timeslots">
       @include('includes.timeslots',array('model'=>$model))
       </div>
</div>

</div>

@else

 <div class="column schedule-appointments">
     <p> {{isset($model) && is_array($model)?$model['message']:""}} </p>
</div>
@endif


@stop

@section('next_back_button')
@if(isset($model->providers))
<section class="section bg-none">
                <div class="row pad extra-padding">


 <a href="{{$back_link}}" class="button back invert">Back</a>
   {{ Form::submit('Next', array('class' => 'button next','id'=>'scheduleSubmit')) }}


                </div>
            </section>
@else
<section class="section bg-none">  <div class="row pad extra-padding">

 <a href="{{$back_link}}" class="button back invert">Back</a>
   </div>
              </section>
@endif
@stop

@section('javascript')

{{ HTML::script('js/jquery-ui.js')}}

<script type="text/javascript">

var availableDates =
    <?php echo isset($model->available_dates)?json_encode(($model->available_dates)):json_encode
    (array());?>
</script>

{{ HTML::script('js/schedule.js')}}


<script type="text/javascript">
@if(isset($model->selectedDate))

 $(document).ready(function() {
    $('#datepicker').datepicker("setDate", <?echo "'".$model->selectedDate."'";?>);

 });

@endif

</script>
@stop
