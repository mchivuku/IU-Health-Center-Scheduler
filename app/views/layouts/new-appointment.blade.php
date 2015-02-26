@extends('...layouts.master')
@section('content')

     <section class="section bg-none" id="content">
            <div class="row">
                <div class="section-header steps">

               {{ HTML::build_breadcrumb_navigation(array(array('route_name'=>'newAppointment.index','text'=>'Reason for Visit'),
               array('route_name'=>'newAppointment.schedule','text'=>'Choose a Time'),
               array('route_name'=>'newAppointment.finish','text'=>'Confirm Appointment')))}}

                </div>
            </div>

            <div class="row pad">
               <div class="instructions">
                               @include('includes.instruction')
               </div>

                 @yield('new-appointment-content')

            </div>
        </section>

        @yield('next_back_button')

@stop






