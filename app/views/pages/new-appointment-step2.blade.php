@extends('...layouts.master')

@section('content')

<p>You are scheduling an appointment for - {{$model->visitType}}</p>
<p>
<ul>
<li>Choose a provider</li>
<li>select desired appointment</li>
<li>select desired appointment time, then click next</li>
</ul>
</p>


{{ Form::open(array('method'=>'post','action'=>'NewAppointmentController@scheduleSave')) }}

{{ Form::label('name', 'Select Provider') }}
{{ Form::select_list('provider',$model->providers,$model->selectedProvider,array('id'=>'provider')) }}

  <div id="calendar"></div>

    @include('include.availabletimes',array('model'=>$model))

{{ Form::submit('Next', array('class' => 'btn')) }}
{{ Form::close() }}



@stop

@section('javascript')

{{ HTML::script('js/jquery-ui.js')}}

<script type="text/javascript">

$(document).ready(function(){
    $('div#calendar').datepicker({
    });

});
</script>
@stop

