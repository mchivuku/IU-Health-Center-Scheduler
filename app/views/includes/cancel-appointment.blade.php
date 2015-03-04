<h2>Cancel Appointment</h2>
Are you sure you want to cancel appointment?

{{ Form::open(array('method'=>'post','action'=>'HomeController@cancelAppointment')) }}
{{Form::hidden('encId', $encId,array('name'=>'encId'));}}
{{ Form::submit('Cancel Appointment', array('class' => 'button next','id'=>'cancel')) }}
   <a class="close-reveal-modal" tabindex="1" aria-label="Close">&#215;</a>
