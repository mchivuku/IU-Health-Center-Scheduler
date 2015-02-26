@extends('...layouts.default')
@section('content')

<section class="section bg-none error">
                <div class="row pad extra-padding">
                <h2>{{$title}}</h2>
                   @yield('error_content')
                </div>
            </section>
@stop