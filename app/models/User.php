<?php
require_once 'Base.php';
class User extends Base{


    protected $uid;
    protected $firstName;
    protected $lastName;
    protected $middleName;
    protected $universityId;
    protected $dataOfBirth;
    protected $email;
    protected $addressLine1;
    protected $addressLine2;
    protected $city;
    protected $state;
    protected $zipCode;
    protected $country;
    protected $phone;


    public function getName(){
        return $this->formatName($this->lastName,$this->firstName);
    }

    public function getPhone(){
        if(!empty($this->phone)) {
            $phone=preg_replace("/[^0-9]/","",$this->phone);
            $phone_fix=preg_replace("/([0-9]{3})([0-9]{3})([0-9]{4})/", "($1) $2-$3", $phone);
            return $phone_fix;
        }
    }
}