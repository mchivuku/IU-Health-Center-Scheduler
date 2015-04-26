<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 8/27/14
 * Time: 8:35 AM
 */
require_once 'Attributes.php';

class LDAPService
{

    protected $ldapconn;
    protected $domain;
    protected $port;
    protected $user;
    protected $password;
    protected $error;
    const  DefaultSearchRoot = "OU=Accounts,DC=ads,DC=iu,DC=edu" ;

    public function __construct(){


        $this->parseINI();

        $this->ldapconn   = ldap_connect($this->domain,$this->port);

        ldap_set_option($this->ldapconn, LDAP_OPT_REFERRALS, 0);
        ldap_set_option($this->ldapconn, LDAP_OPT_PROTOCOL_VERSION, 3);


        if (!$this->ldapconn) {
            $this->error = sprintf(
                'Unable to connect to LDAP server (Error: %s)',
                ldap_error($this->ds)
            );
            $this->errno = ldap_errno($this->ds);
            return false;
        }

    }

    public function parseINI()
    {
       $prefs =    parse_ini_file(app_path().'/config/ldap.php');

        foreach ($prefs as $k=>$v) $this->$k = $v;


    }

    private  function getDirectoryEntryForPerson($networkId){
        $searchPath =  sprintf("CN=%s", $networkId);

        if ($this->ldapconn){

            $link_id = ldap_bind($this->ldapconn, "ADS\\" . $this->user, $this->password);

            //bind successful
            if ($link_id) {
                $sr = ldap_search($this->ldapconn, self::DefaultSearchRoot, $searchPath);
                $info = ldap_get_entries($this->ldapconn,$sr);
                return $info[0];

            }
        }

    }

    private function extractValue($entry,$string){
        return isset($entry[$string])?$entry[$string][0]:'';
    }
    private function extractArray($entry,$string){
        $values= isset($entry[$string])?$entry[$string]:array();
        if(array_key_exists('count',$values))
            unset($values['count']);
        return $values;
    }

    private  function closeLdap(){
        if($this->ldapconn)ldap_close($this->ldapconn);
    }

    public function getUserUniversityId($networkId){
        $directory_entry = $this->getDirectoryEntryForPerson($networkId);
        $universityId = $this->extractValue($directory_entry,(string)new UniversityId());
        return $universityId;

    }

    public function getUserEnrollmentStatus($networkId){
        $directory_entry = $this->getDirectoryEntryForPerson($networkId);
        $currentEnrolled = $this->extractValue($directory_entry,(string)new IsCurrentlyEnrolled());
        return $currentEnrolled!=''?$currentEnrolled:'N';
    }

    public function getUserAffiliations($networkId){
        $directory_entry = $this->getDirectoryEntryForPerson($networkId);
        $affiliations = $this->extractArray($directory_entry,(string)new Affiliation());
        return $affiliations;
    }


}