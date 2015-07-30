<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">

          <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0,
          maximum-scale=1.0">
           <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
           <!--meta http-equiv="X-UA-Compatible" content="IE=9"/-->
               <title>{{$title}}</title>

          <!-- stylesheets -->
          {{ HTML::style('http://www.iu.edu/favicon.ico', array('rel'=>'shortcut icon','type' => 'image/x-icon')) }}
          {{ HTML::style('//assets.iu.edu/web/2.x/css/global.css',array('media' => 'screen','rel'=>'stylesheet','type'=>'text/css')) }}
          {{ HTML::style('//assets.iu.edu/brand/2.x/brand.css',array('media' => 'screen','rel'=>'stylesheet',
 'type'=>'text/css')) }}
         {{ HTML::style('//assets.iu.edu/search/2.x/search.css',array('media' => 'screen','rel'=>'stylesheet',
  'type'=>'text/css')) }}


           {{ HTML::style('css/site.css',array('media' => 'screen')) }}

            <!-- javascript files -->
           {{ HTML::script('https://assets.iu.edu/web/1.5/libs/modernizr.min.js')}}


  </head>