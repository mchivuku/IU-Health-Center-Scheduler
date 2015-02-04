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

    foreach ($data as $value) {
        $table .= $build_tr($value);
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

            if (\Route::currentRouteName() == $liItem['route_name']) {

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


\HTML::macro('display_times', function ($data, $attributes = null) {

    $num_elements_in_row = 6;

    $html = '<div ' . \HTML::attributes($attributes) . ' >';


    $build_min_row = function ($data) {
        if (is_null($data)) return false;

        $row = sprintf("<div class='minute-row'>");
        array_walk($data, function ($item) use (&$row) {
            $link = function ($x) {
                return sprintf("<a href='#times'>%s</a>", $x);
            };

            if ($item->flag) {
                $row .= "<div class='five'>";
                $row .= "<p>";
                $row .= $link($item->time);
                $row .= "</p></div>";

            } else {
                $row .= "<div class='five full'>";
                $row .= "<p>";
                $row .= $link($item->time);
                $row .= "</p></div>";

            }


        });

        $row .= '</div>';
        return $row;
    };


    foreach ($data as $hr => $minutes) {
        $html .= "<div class='hour'>";
        $html .= sprintf("<p>%s</p>", $hr) . "</div>";


        $half_one = array_slice($minutes, 0, 6);
        $half_second = array_slice($minutes, 6);
        $html .= "<div class='minutes'>";
        $html .= $build_min_row($half_one);
        $html .= $build_min_row($half_second);
        $html .= "</div>";

    }
    $html .= "</div>";
    return $html;


});