@include('...includes.header')


<body class="home">
<div class="off-canvas-wrap" data-offcanvas>
@include('...includes.branding-bar')

<div class="inner-wrap">

      <!-- Application Logo -->
        <header>
            <div class="row pad">

                <h1><span>{{$header_title['label']}}</span></h1>
                <p>{{$header_title['text']}}</p>
 <NOSCRIPT>
                                     <div id="error">You must enable JavaScript to use the appointment scheduler.</div>
                               </NOSCRIPT>
            </div>
        </header>

    <!-- Navigation -->
   @include('...includes.navigation')



    @include('...includes.alerts')

    <section class="section bg-none persistent-info">

        <div class="row">

             @include('...includes.emergencyinfo')
             @include('...includes.userprofile')
        </div>
    </section>

    @yield('content')


 <!-- Footer -->
@include('...includes.footer')

</div>

 <div class="right-off-canvas-menu show-for-medium-down">
            <nav class="mobile off-canvas-list">
                <ul>
                   @include('...includes.navigation-items')
                </ul>
            </nav>
        </div>



           <!-- javascript files -->
           <!-- Include jQuery -//code.jquery.com/jquery-2.1.1.min.js -->
           {{ HTML::script('//code.jquery.com/jquery-2.1.1.min.js')}}
           <!-- Include Global files -->
           {{ HTML::script('//assets.iu.edu/web/2.x/js/global.js')}}
             <!-- Include Search files -->
           {{ HTML::script('//assets.iu.edu/search/2.x/search.js')}}

<!-- SIte.js-->

{{ HTML::script('js/site.js')}}

@yield('javascript')

</div>


</body>
</html>





