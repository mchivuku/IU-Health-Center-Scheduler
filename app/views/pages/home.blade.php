@extends('...layouts.master')

@section('content')
        <div class="row">
                <div class="new-appointment">
                    <p>New Appointment</p>
                    <a href="{{ URL::to('newAppointment') }}" class="button">Start</a>
                </div>
            </div>


                <div class="row">
                <div class="section-header existing-appointments dark-tan">
                    <p>Your next Scheduled Appointment</p>
                </div>
                 @if($model->nextAppointment)
                        {{$model->nextAppointment->visitType}} on  {{$model->nextAppointment->appointmentDate}} at
                         {{$model->nextAppointment->facility}} for {{$model->nextAppointment->reason}}
                    @endif
                </div>



 <div class="row">
                <div class="section-header existing-appointments light-tan">
                    <p>Previous Appointments</p>
                </div>
 <div class="tablesaw-container">

   {{ HTML::build_table($model->pastAppointmentListViewModel->data,$model->pastAppointmentListViewModel->header ,
   array('class'=>'table display responsive no-wrap tablesaw','id'=>'pastAppts','data-tablesaw-mode'=>"stack"))}}

 </div>

 </div>




@stop

@section('javascript')

<!-- Render this partial view when you want to enable client-side sorting, pagination and filtering of a table. -->
{{ HTML::script('js/jquery.dataTables.js')}}
{{ HTML::script('js/tablesaw.stackonly.js')}}


<script type="text/javascript">
    $(document).ready(function() {
        $('table#pastAppts').dataTable({
            responsive: true,
            'bJQueryUI': false,
            'bProcessing': true,
            'bSortClasses': false,
            'aaSorting': [],
            'asStripClasses': ['odd', 'even'],
            'sLength': 'inline-help',
            'sInfo': 'inline-help',
            "paging":   false


        });

    });

</script>
@stop


