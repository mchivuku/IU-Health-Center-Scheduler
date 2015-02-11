@extends('...layouts.new-appointment')

@section
@section('new-appointment-content')

{{ Form::open(array('method'=>'get','action'=>'NewAppointmentController@schedule')) }}


<div class="section-dropdown">
  {{ Form::label('name', 'Facilities') }}
  {{ Form::select_list('facility',$model->facilities,$model->selectedFacility,array('id'=>'facilities')) }}

    {{ Form::label('name', 'Type of Appointment') }}
    {{ Form::select_list('visitType',$model->visitTypes,$model->selectedvisitType,array('id'=>'visitTypes')) }}


   <a class="button back invert" href="{{ URL::to('/') }}">Back</a>
{{ Form::submit('Next', array('class' => 'button next')) }}
</div>
 {{ Form::close() }}

@stop


@section('javascript')
<script type="text/javascript">
$(document).ready(function(){
  $('#facilities').change(function(){
        $.getJSON("{{ url('/newAppointment/getVisitTypes')}}",
            { facilityId: $(this).val() },
            function(data) {
                var model = $('#visitTypes');
                model.empty();
                $.each(data, function(index, element) {
                  model.append("<option value='"+ element.id +"'>" + element.name + "</option>");
                });
            });
    });

});
</script>

@stop



