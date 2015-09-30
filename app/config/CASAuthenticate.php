<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 4/17/15
 * Time: 4:04 PM
 */


require app_path().'/helpers/CASHelper.php';
class CASAuthenticate{



    public static function logon()
    {

        $helper = new \CASHelper();
        $url =$helper->buildRedirectURL();

        // check session time - how long a session has been active
        if (isset($_SESSION['LAST_SESSION']) && (time() - $_SESSION['LAST_SESSION'] > 900)) {
            $_SESSION['CAS'] = false; // set the CAS session to false
        }

        $authenticated=false;
        if(isset($_SESSION['CAS']))
            $authenticated = $_SESSION['CAS'];

        // if not authenticated send user to cas;
        if (!$authenticated) {
            $_SESSION['LAST_SESSION'] = time(); // update last activity time stamp
            $_SESSION['CAS'] = true;
            $authenticationURL = $helper->getAuthenticationURL($url);
            $helper->authenticate($authenticationURL);
        }

        // retrieve the CAS ticket
        $casticket = $helper->extractCASticket();

        if ($authenticated) {
            if (isset($_GET['casticket'])) {
                $helper->validate($url,$_GET['casticket']);
            }

            // Authenticate
           if(!isset($_SESSION['user'])){
                 $authenticationURL = $helper->getAuthenticationURL($url);
                 $helper->authenticate($authenticationURL);

           }
        }
    }
}