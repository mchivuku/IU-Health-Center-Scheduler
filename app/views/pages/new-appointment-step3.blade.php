@extends('...layouts.new-appointment')
@section('new-appointment-content')
     <div class="section-confirm">


@if(isset($model->errorMsg))
<h4>{{($model->errorMsg)}}</h4>
@endif


            {{ Form::open(array('method'=>'post','action'=>'NewAppointmentController@scheduleSave','id'=>'scheduleSave')) }}

            {{Form::hidden('visitType', $model->visitType,array('id'=>'visitType','name'=>'visitType'));}}
            {{Form::hidden('visitDuration',
            $model->visitDuration,array('id'=>'visitDuration','name'=>'visitDuration'));}}
            {{Form::hidden('endTime',
            $model->endTime,array('id'=>'endTime','name'=>'endTime'));}}
            {{Form::hidden('date',$model->encDate,array('id'=>'date','name'=>'date'));}}
            {{Form::hidden('startTime',$model->startTime,array('id'=>'startTime','name'=>'startTime'));}}

            {{Form::hidden('facility',
            $model->facility,array('id'=>'facility','name'=>'facility'));}}
            {{Form::hidden('provider', $model->providerId,array('id'=>'provider','name'=>'provider'));}}

<div id="sessioncounter">



</div>
            <ul>
            <li><strong>Visit Type: </strong>{{$model->visitTypeText}}</li>
            <li><strong>Provider Name: </strong>{{$model->providerName}}</li>
             <li><strong>Appointment Date: </strong>{{$model->displayDate}}</li>
              <li><strong>Appointment Start Time: </strong>{{date('g:i A',strtotime($model->startTime))}}</li>
            </ul>
            @if(($model->email)!="")
                    <p>
                        <input type="checkbox" name="sendemail"> <label>Send me an email confirmation of this appointment</label>
                   </p>
            @endif

            </div>



@stop


@section('next_back_button')

            <section class="section bg-none">
            <div class="row pad extra-padding">

            {{$model->backUrl}}
            {{ Form::submit('Confirm', array('class' => 'button next')) }}
            </div>
            </section>
@stop


@section('javascript')



          <script type="text/javascript">

           function timeoutwarming() {
               if (window.confirm('session is timing out')) {
                   location.href = location.href;
               }
           }

           function sessiontimeout(topRef, expire) {
               expire.setSeconds(expire.getSeconds() - 1);
               if (expire.getFullYear() < 2015) {
                   window.location.href = "https://seville.iuhc.iub" +
                   ".edu/comm/hcScheduler/public/newAppointment/clearsession?visitType="+$('#visitType').val()
                   +"&facility="+$('#facility').val()
                   return;
               }
               if (topRef) {
                   topRef.innerHTML = ('' + expire).match(/\d\d:\d\d:\d\d/);
               }
           }

           window.onload = function() {
               var expire = new Date(2015, 0, 1);
               expire.setSeconds(<?echo SESSION_ACTIVITY_TIME;?> * 60);
               var topRef = document.getElementById('sessioncounter');

               window.setInterval(
                   function() {
                       sessiontimeout(topRef, expire);
                   },
                   1000
               );
           }
           </script>


@stop


