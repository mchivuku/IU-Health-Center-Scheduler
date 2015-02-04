@extends('...layouts.master')
@section('content')

<section class="section bg-none">
            <div class="row">
                <div class="section-header steps">

               {{ HTML::build_breadcrumb_navigation(array(array('route_name'=>'newAppointment.index','text'=>'Reason for Visit'),
               array('route_name'=>'newAppointment.schedule','text'=>'Choose a Time'),
               array('route_name'=>'newAppointment.finish','text'=>'Confirm Appointment')))}}

                </div>
            </div>

            <div class="row pad">
                 @yield('new-appointment-content')

            </div>
        </section>

@stop

