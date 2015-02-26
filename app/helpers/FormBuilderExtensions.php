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

\Form::macro('opt_group',function($name,$values,$selected,$attributes=array()){

    $selected = Form::getValueAttribute($name, $selected);
    $options['id'] = Form::getIdAttribute($name, $attributes);
    $options['name'] = $name;


    $result = "";
    foreach($values as $opts){


        $label = $opts['label'];
        $result .= "<optgroup
                        label='$label'>";

        $html =array();
        foreach ($opts['items'] as  $option)
        {
            $display="";
            $id="";
            if(is_object($option)){

                if(empty($option->Name)){
                    $display = $option->Id;
                }else{
                    $display = $option->Name;
                }
                $id = $option->Id;
            }
            else{

                if(empty($option['Name'])){
                    $display = $option['Id'];
                }else{
                    $display = $option['Name'];
                }
                $id=$option['Id'];
            }

            $html[] = Form::getSelectOption($display, $id, $selected);
        }

        $result  .= implode('', $html)."</optgroup>";

    }

   $options = HTML::attributes($options);
   return "<select{$options}>{$result}</select>";

});
?>