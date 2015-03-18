<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 11/17/14
 * Time: 12:55 PM
 */

date_default_timezone_set('America/New_York');
define('SLOT_DURATION', 300);

// APPT STATUS MESSAGES
define('APPT_CANCELLED_STATUS', 'CANC');
define('APPT_PENDING', 'PEN');
define('APPT_CHECKEDOUT', 'CHK');
define('APPT_ARRIVED', 'ARR');
define('APPT_PATIENTNOSHOW', 'PTnoShow');

//THIS IS THE SESSION TIME - 5mins
define('SESSION_ACTIVITY_TIME', 300);
define('EMAIL', 'iuhctech@indiana.edu');


define('DEFAULT_EMAIL_TEMPLATE', 'generic');
define('DEFAULT_POS_VALUE', 11);

//Minutes
define('ALLOW_CANCELLATION_UNTIL_TIME', 60);
define('CANCELLATION_EMAIL_TXT_PATH', '/config/cancellationEmail.txt');