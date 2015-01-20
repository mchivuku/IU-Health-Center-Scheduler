@include('...includes.header')
<body>

 <!-- Navigation -->
 @include('...includes.navigation')


   <!-- HEADER -->
   <div class="jumbotron">
         <div class="container">

            <div class="row">
                 <div class="col-md-4">
                   @include('...includes.userprofile')
                 </div>
                  <div class="col-md-4">
                         @include('...includes.emergencyinfo')
                                  </div>
            </div>

          </div>
       </div>


   <!-- Yield Content -->
    <div class="container">

    @yield('content')

    </div>

    <!-- /.container -->
@yield('javascript')

  <!-- Footer -->
 @include('...includes.footer')



