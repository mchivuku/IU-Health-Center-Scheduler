<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 8/27/14
 * Time: 8:35 AM
 */
namespace Scheduler\Repository;


class ShibbolethRepository
{


    protected $shibboleth_mapping = array(
        'firstName' => array('name' => 'givenName',
            'filter' =>
                array('flags' => FILTER_SANITIZE_STRING, 'options' => FILTER_FLAG_STRIP_LOW)),

        'lastName' => array('name' => 'sn', 'filter' => array('flags' => FILTER_SANITIZE_STRING,
            'options' => FILTER_FLAG_STRIP_LOW)),


        'universityId' => array('name' => 'iuEduSEMPLID', 'filter' =>
            array('flags' => FILTER_SANITIZE_NUMBER_INT
            )),

        'networkId' => array('name' => 'cn', 'filter' =>
            array('flags' => FILTER_SANITIZE_STRING, 'options' => FILTER_FLAG_STRIP_LOW)),

        'affiliation' => array('name' => 'unscoped-affiliation', 'filter' =>
            array('flags' => FILTER_SANITIZE_STRING, 'options' => FILTER_FLAG_STRIP_LOW)),

    );

    public function __construct()
    {

    }

    /*
    * LDAP variables are stored inside the server
    */
    function  getShibbolethVariables()
    {
        return $_SERVER;
    }


    /**
     *
     * Methods filter server parameter based on the filter type
     *
     * @param $type
     * @param $variable_name
     * @param $filter
     * @param null $default
     * @return mixed|null
     *
     */
    public function filterInput($type, $variable_name, $filter, $default = null)
    {
        $return = null;

        if (isset($type[$variable_name])) {
            if (isset($filter['options'])):
                $return = filter_var($type[$variable_name], $filter['flags'], $filter['options']);
            else:
                $return = filter_var($type[$variable_name], $filter['flags']);
            endif;

        }

        return (is_null($return) || $return === false) ? $default : $return;
    }


    private function getPersonPropertyValue($propertyName, $filter)
    {
        $entry = $this->getShibbolethVariables();
        return $this->filterInput($entry, $propertyName, $filter);

    }

    /***
     *
     * Public Methods -
     */
    public function  getUserUniversityId()
    {
        $array = $this->shibboleth_mapping;

        $propertyInfo = $array['universityId'];
        $name = $propertyInfo['name'];
        $filter = $propertyInfo['filter'];

        $univ = $this->getPersonPropertyValue($name, $filter);

        return $univ;

    }

    /**
     *
     * Get EduPersonAffiliation
     */
    public function getPersonAffiliation()
    {

        $array = $this->shibboleth_mapping;

        $propertyInfo = $array['affiliation'];
        $name = $propertyInfo['name'];
        $filter = $propertyInfo['filter'];
        $affiliation = $this->getPersonPropertyValue($name, $filter);
        return $affiliation;

    }
}