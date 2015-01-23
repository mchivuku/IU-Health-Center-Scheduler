<?php

\Form::macro('select_list',function($name,$values,$selected,$attributes=array()){


$selected = Form::getValueAttribute($name, $selected);
$options['id'] = Form::getIdAttribute($name, $attributes);
$options['name'] = $name;

$html = array();

foreach ($values as $value)
{
    $display='';
    if(empty($value->Name)){
        $display = $value->Id;
    }else{
        $display = $value->Name;
    }
$html[] = Form::getSelectOption($display, $value->Id, $selected);
}

$options = HTML::attributes($options);

$list = implode('', $html);

return "<select{$options}>{$list}</select>";


});

?>