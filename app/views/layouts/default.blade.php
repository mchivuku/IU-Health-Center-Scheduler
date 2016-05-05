<!-- Header -->
@include('...includes.header')


<body class="home">
<div class="off-canvas-wrap" data-offcanvas>
<!-- Branding bar -->
@include('...includes.branding-bar')

<!-- Body -->
<div class="inner-wrap">

      <!-- Application Logo -->
        <header>
            <div class="row pad">
                <h1><span>{{$header_title['label']}}</span></h1>
                <p>{{$header_title['text']}}</p>
            </div>
        </header>

    <!-- Navigation -->
   @include('...includes.navigation')

    @include('...includes.alerts')


    @yield('content')

<!-- BELT -->
   @include('includes.belt')
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
           <!-- Include jQuery -->
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







