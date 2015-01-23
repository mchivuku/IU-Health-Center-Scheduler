@extends('...layouts.master')
@section('content')

{{ Form::open(array('method'=>'post','action'=>'NewAppointmentController@schedule')) }}

{{ Form::label('name', 'Facilities') }}
{{ Form::select_list('facility',$model->facilities,$model->selectedFacility,array('id'=>'facilities')) }}

{{ Form::label('name', 'Visit Types') }}
{{ Form::select_list('visitType',$model->visitTypes,$model->selectedvisitType,array('id'=>'visitTypes')) }}

{{ Form::submit('Next', array('class' => 'btn')) }}
{{ Form::close() }}

@stop


