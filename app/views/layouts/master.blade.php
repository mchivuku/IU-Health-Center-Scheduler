<!-- Header -->
@include('...includes.header')


<body class="home">

<!-- Branding bar -->
@include('...includes.branding-bar')

<!-- Menu bar search -->
@include('...includes.navigation')


<!-- Body -->
<div class="inner-wrap">

<!-- Application Logo -->
    <header>
            <div class="row pad">
                <h1><span>IU Health Center Appointments</span></h1>
                <p>Schedule an appointment or get information about appointments you have already scheduled.</p>
            </div>
        </header>



    <section class="section bg-none persistent-info">
        <div class="row">
            @include('...includes.emergencyinfo')
             @include('...includes.userprofile')
        </div>
    </section>


  <section class="section bg-none">
    @yield('content')
  </section>


</div>

 <!-- Footer -->
@include('...includes.footer')

           <!-- javascript files -->
           <!-- Include jQuery -->
           {{ HTML::script('//code.jquery.com/jquery-2.1.1.min.js')}}
           <!-- Include Global files -->
           {{ HTML::script('//assets.iu.edu/web/2.x/js/global.js')}}
             <!-- Include Search files -->
           {{ HTML::script('//assets.iu.edu/search/2.x/search.js')}}

<!-- SIte.js-->

{{ HTML::script('js/site.js')}}

@yield('javascript')

</body>
</html>







