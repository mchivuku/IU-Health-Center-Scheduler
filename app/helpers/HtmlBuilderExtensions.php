<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/16/15
 * Time: 12:42 PM
 */

/***
 *  File contains functions for HTML extensions
 *
 */

\HTML::macro('build_table', function($data,$header,$attributes=null)
{

    $build_tr = function($data){
        if(is_null($data)) return false;

        if(is_object($data)) {
            $tr_row=(array)($data);
         }
        else
            $tr_row=$data;

        $row = '<tr>';
        array_walk($tr_row,function($item)use(&$row){
              $row .= '<td>' . $item . '</td>';
        });

        $row .= '</tr>';
        return $row;
    };


    $table = '<table ' . \HTML::attributes($attributes) . ' >';


    if(!is_null($header)) {
        $table .= '<thead><tr>';
        foreach ($header as $value) {
            $table .= '<th> ' . $value . ' </th>';
        }
        $table .= '</thead>';
    }

    $table .= '<tbody>';

    foreach ($data as $value) {
        $table .= $build_tr($value);
    }

    $table .= '</tbody>';
    $table .= '</table>';

    return   $table;
});

\HTML::macro('nav_link',function($id,$route,$title,$attributes=array()){

    $defaults   = array('class' => '', 'title' => $title);
    $attributes = $attributes + $defaults;

    $is_active  = ( \Request::is($route)
          ||\Request::is($route.'/*'));

    // $is_active='true';
   // if(\Route::find($route) !== null )
    //{
        //$href = URL::to_route($route);
    //}
    //else
    //{
      //  $href = URL::to($route);
    //}

    $href=$route;
   // if($is_active) $attributes['class'] .= ' active';

    return '<li '  .  HTML::attributes($attributes) . '><a href=' .$href. '>'.$title.'</a></li>';
});

