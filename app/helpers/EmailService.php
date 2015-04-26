<?php

/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 10/20/14
 * Time: 4:23 PM
 */
class EmailService
{

    protected $headers;


    public $priorities = array(
        1 => 'Highest',
        2 => 'High',
        3 => 'Normal',
        4 => 'Low',
        5 => 'Lowest');

    function createHeaders()
    {
        $this->headers = "From: " . EMAIL . "\r\n";
        $this->headers .= "Reply-To: " . EMAIL . "\r\n";
        $this->headers .= "MIME-Version: 1.0\r\n";
        $this->headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
        $this->headers .= "Date: " . date('r', time()) . "\r\n";
        $this->headers .= "Message-ID: " . '<' . $_SERVER['REQUEST_TIME'] . '.' . md5(microtime()) . '@' .
            $_SERVER['SERVER_NAME'] . '>';

        $this->headers .= "MIME-Version: " . '1.0' . "\r\n";

    }

    /**
     *
     * @param
     */
    function send($parameters)
    {
        // Prepare the headers
        $this->createHeaders();

        mail($parameters['email'],
            $parameters['subject'], $parameters['message'], $this->headers);

        return;
    }


}