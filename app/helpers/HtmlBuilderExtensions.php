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

\HTML::macro('build_table', function ($data, $header, $attributes = null) {

    $build_tr = function ($data) {
        if (is_null($data)) return false;

        if (is_object($data)) {
            $tr_row = (array)($data);
        } else
            $tr_row = $data;

        $row = '<tr>';
        array_walk($tr_row, function ($item) use (&$row) {
            $row .= '<td>' . $item . '</td>';
        });

        $row .= '</tr>';
        return $row;
    };


    $table = '<table ' . \HTML::attributes($attributes) . ' >';


    if (!is_null($header)) {
        $table .= '<thead><tr>';
        foreach ($header as $value) {
            $table .= '<th> ' . $value . ' </th>';
        }
        $table .= '</thead>';
    }

    $table .= '<tbody>';

    if(isset($data)){
        foreach ($data as $value) {
            $table .= $build_tr($value);
        }
    }

    $table .= '</tbody>';
    $table .= '</table>';

    return $table;
});

\HTML::macro('build_breadcrumb_navigation',
    function ($items, $attributes = array()) {

        $default_selected = 'current-step';

        $html = "<ul" . \HTML::attributes($attributes) . ">";

        foreach ($items as $liItem) {

                if (\Route::currentRouteName() == $liItem['route_name'] || (is_array($liItem['route_name']) && in_array
                (\Route::currentRouteName(),
                        $liItem['route_name']))){

                    $html .= "<li class='" . $default_selected . "'>";

                } else {
                    $html .= "<li>";
                }

            $html .= $liItem['text'];

            $html .= "</li>";

        }

        $html .= "</ul>";

        return $html;

    });


\HTML::macro('display_times', function ($data) {
         $html = '';
        array_walk($data, function ($item) use (&$html) {

            $build_row = function ($slot) {
                if (is_null($slot)) return false;

                if($slot->flag){
                    $row = sprintf("<div class='selected'>");
                }else{
                    $row = sprintf("<div>");
                }

                $link = function ($x) {

                      $hours = date('H',strtotime($x));
                      $ext = ($hours <= 12) ? 'a.m.' : 'p.m.';

                     return sprintf("<a href='#' title='%s'>%s</a>",$x, date('g:i',strtotime($x))." ".$ext);
                };

                $row .= $link($slot->time);
                $row .= "</div>";
                return $row;

            };

            $html.=$build_row($item);
        });

    return empty($html)?"No times available":$html;

});

