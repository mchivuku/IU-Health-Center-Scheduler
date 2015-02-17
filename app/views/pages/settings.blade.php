@extends('...layouts.master')

@section('content')


<section class="section bg-none">
<!-- CSRF Token -->
    <input type="hidden" name="_token" value="{{{ csrf_token() }}}" />
<!-- ./ csrf token -->

<div class="row">
{{ Form::label('name', 'Settings: Messages')}}
  {{ Form::checkbox('textenabled',$textenabled,$checked,array("id"=>'textEnabledOptionUpdate')) }}
   I agree to receive text messages confirming my appointments

</div>

</section>
@stop

@section('javascript')

<script type="text/javascript">

$(document).ready(function(){

$('#textEnabledOptionUpdate').click(function(){
var currentValue = $(this).is(":checked");
$.ajax({
    url: 'settings/save',
           method: 'get',
                data: {textEnabled: currentValue, _token: $('input[name="_token"]').val()}

});

});

});
</script>
@stop