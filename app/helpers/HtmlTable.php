<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 12:25 PM
 */

/**
 * Class HtmlTable
 *
 * HTMl table class that builds HTML table on the page
 */
class HtmlTable{

    protected $header;
    protected $htmlAttributes;
    protected $tableData;

    public function __construct($header, $htmlAttributes,$tableData){

        $this->header = $header;
        $this->htmlAttributes=$htmlAttributes;
        $this->tableData = $tableData;

    }

    function buildHTMLAttributes(){
        $result = '';
        if(!is_null($this->htmlAttributes)) {
            foreach ($this->htmlAttributes as $key => $value) {
                $result .= $key . ' = "' . $value . '" ';
            }
        }
        return $result;

    }

    public function buildTable(){
        $table = '<table ' . $this->buildHTMLAttributes() . ' >';

        if(!is_null($this->header)) {
            $table .= '<thead><tr>';
            foreach ($this->header as $value) {
                $table .= '<th>' . ucfirst($value) . '</th>';
            }
            $table .= '</thead></tr>';
        }

        $table .= '<tbody>';
        foreach ($this->tableData as $value) {
            $table .= $this->createTr($value);
        }

        $table .= '</tbody>';
        $table .= '</table>';

        return  $table;
    }

    protected function createTr($trData = null)
    {
        if(is_null($trData)) return false;
        $row = '<tr>';

        array_walk($trData,function($item)use(&$row){
            $row .= '<td>' . $item . '</td>';
        });

        $row .= '</tr>';
        return $row;

    }
}