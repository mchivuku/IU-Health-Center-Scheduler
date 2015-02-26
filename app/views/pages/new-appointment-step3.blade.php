@extends('...layouts.new-appointment')
@section('new-appointment-content')

                   <div class="section-confirm">

                   {{ Form::open(array('method'=>'post','action'=>'NewAppointmentController@scheduleSave','id'=>'scheduleSave')) }}

                     {{Form::hidden('visitType', $model->visitType,array('id'=>'visitType','name'=>'visitType'));}}
                   {{Form::hidden('visitDuration',
                   $model->visitDuration,array('id'=>'visitDuration','name'=>'visitDuration'));}}
                    {{Form::hidden('endTime',
                                      $model->endTime,array('id'=>'endTime','name'=>'endTime'));}}
                    {{Form::hidden('date',$model->encDate,array('id'=>'date','name'=>'date'));}}
                    {{Form::hidden('startTime',$model->startTime,array('id'=>'startTime','name'=>'startTime'));}}

         {{Form::hidden('provider', $model->providerId,array('id'=>'provider','name'=>'provider'));}}

                    <ul>
                        <li><strong>Visit Type: </strong>{{$model->visitTypeText}}</li>
                        <li><strong>Provider Name: </strong>{{$model->providerName}}</li>
                         <li><strong>Appointment Date: </strong>{{$model->displayDate}}</li>
                          <li><strong>Appointment Start Time: </strong>{{$model->startTime}}</li>

                         <li><strong>Appointment End Time: </strong>{{$model->endTime}}</li>

                    </ul>
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
