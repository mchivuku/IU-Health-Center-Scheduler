@extends('...layouts.master')
@section('content')

     <section class="section bg-none" id="content">
            <div class="row">
                <div class="section-header steps">

               {{ HTML::build_breadcrumb_navigation(array(array('route_name'=>'newAppointment.index','text'=>'Reason for Visit'),
               array('route_name'=>'newAppointment.schedule','text'=>'Choose a Time'),
               array('route_name'=>array('newAppointment.finish','newAppointment.save'),'text'=>'Confirm Appointment')))}}

                </div>
            </div>

             <div class="row pad">
                  <div class="instructions">
                               @include('includes.instruction')
               </div>


                <!-- Session Flash Message -->

              @if (Session::has('session-expiration-message'))
                  <div class="alert alert-info">{{ Session::get('session-expiration-message') }}</div>
             @endif

                 @yield('new-appointment-content')

                 @yield('next_back_button')
            </div>

        </section>



@stop






