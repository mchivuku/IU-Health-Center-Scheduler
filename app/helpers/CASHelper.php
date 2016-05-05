<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 4/17/15
 * Time: 3:59 PM
 */

class CASHelper
{

    const CASServer = "https://cas.iu.edu/cas";

    /** format of the url to redirect to CAS */
    const  FmtAuthenticationUrl = "%s/login?cassvc=IU&casurl=%s";

    /****
     * Format of the URL to which CAS ticket validation request should be sent. This validation
     * request will return an XML response, not newline-separated tokens.
     */
    const  FmtValidationUrl =
        "%s/validate?cassvc=IU&casticket=%s&casurl=%s";


    function buildRedirectURL()
    {

        $filename="/var/www/iuhc/comm/hcScheduler/app/caserror.txt";

        if (!$handle = fopen($filename, 'a')) {
            echo "Cannot open file ($filename)";
            exit;
        }

       //Figure out what the protocol is
        if (isset($_SERVER['HTTPS'])) {
            $protocol = "https";
        } else {
            $protocol = "http";
        }
        $server = $_SERVER["SERVER_NAME"];
        $script_path = $_SERVER["REQUEST_URI"];
        //If the port differs from the standard http(s) ports, we should preserve that
        if ((!$_SERVER["SERVER_PORT"] == "80") && (!$_SERVER["SERVER_PORT"] = "443")) {
            $port = ":{$_SERVER["SERVER_PORT"]}";
        } else {
            $port = "";
        }

        $pageURL =  urlencode("{$protocol}://{$server}{$port}{$script_path}");

        fwrite($handle, $pageURL.PHP_EOL);

        fclose($handle);

        return $pageURL;
    }


    /// The URL to which *CAS* should redirect after successful authentication.
    function getAuthenticationURL($url)
    {
        $url = sprintf(self::FmtAuthenticationUrl, self::CASServer, $url);
        return $url;
    }


    //first time - redirect to Login
    function authenticate($url)
    {
        echo '<META HTTP-EQUIV="Refresh" Content="0; URL='.$url.'">';
        exit;

    }


    /***
     * Function to validate casticket,
     * @param $casticket
     * @param $redirectURL
     * @param $netid
     * @return bool
     */
    function validate($url,$casticket)
    {

        $validateurl = sprintf(self::FmtValidationUrl, self::CASServer, $casticket, $url);

        $ch = curl_init();
        $timeout = 5; // set to zero for no timeout
        curl_setopt($ch, CURLOPT_URL, $validateurl);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        ob_start();
        curl_exec($ch);
        curl_close($ch);
        $cas_answer = ob_get_contents();
        ob_end_clean();
        //split CAS answer into access and user
        list($access, $user) = explode("\n", $cas_answer);
        $access = trim($access);
        $user = trim($user);

        if ($access == "yes") {
            $_SESSION['user']=$user;
        }


    }


    function extractCASticket()
    {
        return isset($_GET['casticket']) ? $_GET['casticket'] : '';
    }




}