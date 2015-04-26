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

//MINUTES

//Minutes
define('ALLOW_CANCELLATION_UNTIL_TIME', 60);
define('CANCELLATION_EMAIL_TXT_PATH', '/config/cancellationEmail.txt');
define('POLICIES_MESSAGE_PATH', app_path().'/config/PolicyMessage.txt');
define('APPOINTMENT_CONFIRMATION_EMAIL_TXT_PATH',app_path(). '/config/AppointmentConfirmationMessage.txt');



define('CLEAR_OLD_SESSIONS_FROM_LOG_AFTER', 1800);
define('SHOW_APPT_TIMENOW_OFFSET',30);
