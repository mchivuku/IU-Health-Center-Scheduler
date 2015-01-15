<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/9/15
 * Time: 11:27 AM
 */


spl_autoload_register('Scheduler_AutoLoader::ClassLoader');

class Scheduler_AutoLoader
{
    public static function ClassLoader($className)
    {
        /*Directories that contain classes*/
        $classesDir = array(

            'controllers/',
             'repository',
             'config','models/'


        );

        foreach ($classesDir as $directory) {
            $parts = explode('\\', $className);
            if (file_exists($directory . end($parts) . '.php')) {

                require_once($directory . end($parts) . '.php');
                return;
            }
        }

    }


}