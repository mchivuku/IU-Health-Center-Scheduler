<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>
            {{$title}}
        </title>
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <style>
            html { height: 100%; }

            body {
                padding-bottom: 40px;
                padding-top: 40px;
            }
        </style>

           {{ HTML::style('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css', array('media' => 'screen')) }}

           {{ HTML::style('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css',
           array('media' => 'screen')) }}
           {{ HTML::style('css/jquery.dataTables.css',
                                 array('media' => 'screen')) }}
           {{ HTML::style('css/dataTables.responsive.css',
                      array('media' => 'screen')) }}
           {{ HTML::script('js/jquery.js')}}
           {{ HTML::script('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js')}}
           {{ HTML::script('js/jquery.dataTables.js')}}
           {{ HTML::script('js/dataTables.responsive.min.js')}}


  </head>