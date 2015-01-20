@extends('...layouts.master')

@section('content')


<div class="panel panel-default">
   <div class="panel-heading">Schedule A New Appointment</div>

  </div>


<div class="panel panel-default">
   <div class="panel-heading">Your next Scheduled Appointment</div>
   <div class="panel-body">

    @if($model->nextAppointment)
        {{$model->nextAppointment->visitType}} on   {{$model->nextAppointment->appointmentDate}} at
         {{$model->nextAppointment->facility}} for {{$model->nextAppointment->reason}}
    @endif
   </div>

  </div>


<div class="panel panel-default">
   <div class="panel-heading">Previous Appointments</div>
   <div class="panel-body">

   {{ HTML::build_table($model->pastAppointmentListViewModel->data,$model->pastAppointmentListViewModel->header ,
   array('class'=>'table display responsive no-wrap','id'=>'pastAppts'))}}


   </div>

  </div>

@stop

@section('javascript')
@include('...includes.clientSideDataTableFunctions',array('model'=>new ClientSideDataTableFunctionModel(count($model->pastAppointmentListViewModel->data),$model->pastAppointmentListViewModel->sortColumnsClasses,'pastAppts')))
@stop


