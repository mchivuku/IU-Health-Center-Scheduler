<?php

/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/19/15
 * Time: 10:48 AM
 */
ini_set('display_errors',1);
error_reporting(-1);
class ClientSideDataTableFunctionModel
{

    private $_tableHTMLId;
    public $totalRows;
    public $sortableColumns;
    public $tableHTMLId;


    public function __construct($total,$sortClasses,$tableId){
        $this->tableHTMLId=$tableId;
        $this->totalRows=$total;
        $this->sortableColumns=$sortClasses;
    }

}


class  SortClass
{
    const NoSort = 1;
    const String = 2;
    const StringStripHtml = 3;
    const Numeric = 4;
    const NumericStripHtml = 5;
    const Date = 6;
    const Currency = 7;
    const CurrencyStripHtml = 8;

    private static $sortClassDataTableMappings
        = array(SortClass::NoSort => "null", SortClass::Numeric => "numeric",
SortClass::NumericStripHtml => "numeric-html",
            SortClass::Date => "date", SortClass::Currency => "currency", SortClass::CurrencyStripHtml => "currency-html",
            SortClass::String => "string", SortClass::StringStripHtml => "html");

    static function  getDataTableSortClass( $sc)
    {
        return self::$sortClassDataTableMappings[$sc];
    }


}
