@extends('...layouts.master')

@section('content')


<section class="section bg-none">


<!-- CSRF Token -->
    <input type="hidden" name="_token" value="{{{ csrf_token() }}}" />
<!-- ./ csrf token -->

<div class="row">
<div class="settings">
<div class="column">
<h2>Messages</h2>
</div>
<div class="column">
 {{ Form::checkbox('textenabled',$textenabled,$checked,array("id"=>'textEnabledOptionUpdate')) }}
 <p> I agree to receive text messages confirming my appointments
</p>
</div>
</div>


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