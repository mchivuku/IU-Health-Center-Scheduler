@extends('...layouts.master')

@section('content')
<section class="section bg-none">
<div class="row">
                <div class="new-appointment">
                   <div><p>New Appointment</p></div>
                    <div><a href="{{ URL::to('newAppointment') }}" class="button">Start</a></div>
                </div>
             </div>


 <div class="row">
                <div class="section-header existing-appointments light-tan">
                   <div> <p>Previous Appointments</p></div><div>&nbsp;</div>
                </div>
 <div class="tablesaw-container">

    {{ \HTML::build_table($model->pastAppointmentListViewModel->data,$model->pastAppointmentListViewModel->header ,
   array('class'=>'table display responsive no-wrap tablesaw','id'=>'pastAppts','data-tablesaw-mode'=>"stack"))}}

 </div>

 </div>


</section>

@stop

@section('javascript')

<!-- Render this partial view when you want to enable client-side sorting, pagination and filtering of a table. -->
{{ HTML::script('js/jquery.dataTables.js')}}



{{    $jsSortDef = "";

    if (isset($model->pastAppointmentListViewModel->sortColumnsClasses) && count($model->pastAppointmentListViewModel->sortColumnsClasses)>0)
    {

           $sortConfig=array();
            array_walk($model->pastAppointmentListViewModel->sortColumnsClasses,function($item)use(&$sortConfig){
            ($sortConfig[]=$item==\SortClass::NoSort?"{'bSortable' : false}" :
             '{"sType" : "'.SortClass::getDataTableSortClass($item).'"@}');
            });


        $jsSortDef = sprintf(', "aoColumns" : [ %s ]', join(",\n", str_replace("@","",$sortConfig)));

    }
}}

<div id="more-info" class="reveal-modal" data-reveal></div>


<script type="text/javascript">

    $(document).ready(function(){
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
            {{$jsSortDef}}
        });
$('a#more-info-link').on('click',function(event){

  event.preventDefault();
  var link = $(this).attr('href');

  $.get(link,null,function(data){

    $('#more-info').html(data);

  });

});

$('a#cancel-appt-link').on('click',function(event){

  event.preventDefault();
  var link = $(this).attr('href');

  $.get(link,null,function(data){
    $('#more-info').html(data);

  });

});

    });


</script>
@stop


