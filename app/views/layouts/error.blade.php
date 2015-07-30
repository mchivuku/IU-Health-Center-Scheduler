@extends('...layouts.default')
@section('content')

<section class="section bg-none error">
    <div class="row pad">
        <div class="instructions">
            <h2>{{$title}}</h2>
            @yield('error_content')
        </div>
    </div>
</section>


@stop