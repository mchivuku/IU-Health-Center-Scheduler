@extends('...layouts.new-appointment')
@section('new-appointment-content')

{{ Form::open(array('method'=>'post','action'=>'NewAppointmentController@schedule')) }}


<div class="section-dropdown">
  {{ Form::label('name', 'Facilities',array('class'=>'control-label')) }}
  {{ Form::select_list('facility',$model->facilities,$model->selectedFacility,array('id'=>'facilities','class'=>'form-control')) }}

    {{ Form::label('name', 'Visit Types',array('class'=>'control-label')) }}
    {{ Form::select_list('visitType',$model->visitTypes,$model->selectedvisitType,array('id'=>'visitTypes','class'=>'form-control')) }}



{{ Form::submit('Next', array('class' => 'button next')) }}
</div>
 {{ Form::close() }}

@stop

