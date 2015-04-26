@extends('...layouts.master')

@section('content')


<section class="section bg-none settings">

{{ Form::open(array('method'=>'get','action'=>'SettingsController@save','id'=>'save')) }}

<!-- CSRF Token -->
    <input type="hidden" name="_token" value="{{{ csrf_token() }}}" />
<!-- ./ csrf token -->

<div class="row">
<div class="settings">
<div class="column">
<h2>Messages</h2>
</div>
<div class="column">
@if(!isset($textenabled->iu_scheduler_textenabled))

 <input type="checkbox" name="textenabled" checked id="textEnabledOptionUpdate">


@else

<input type="checkbox" name="textenabled" <?php echo ($textenabled->textenabled)?"checked":"";?> id="textEnabledOptionUpdate">


@endif

 <p> I agree to receive text messages confirming my appointments
</p>
</div>
</div>


</div>

<div class="row pad extra-padding submit">
                  {{ Form::submit('Submit', array('class' => 'button next','id'=>'submit')) }}
 </div>

</section>
@stop

@section('javascript')

<script type="text/javascript">

$(document).ready(function(){
$('#textEnabledOptionUpdate').click(function(event){


var currentValue = $(this).is(":checked");
$('#textEnabledValue').val(currentValue);

});

});
</script>
@stop