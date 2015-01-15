<!Doctype html>
<html>
<head>
    @include('includes.header')
</head>
<body>
<div class="container">

    <header class="row">
             @include('includes.userprofile')
    </header>
    <p>
@include('includes.emergencyinfo')</p>
    <div id="main" class="row">

            @yield('content')


    </div>

    <footer class="row">
        @include('includes.footer')
    </footer>

</div>
</body>
</html>