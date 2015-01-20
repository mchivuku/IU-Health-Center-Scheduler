<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 2:34 PM
 */


use Illuminate\Support\ServiceProvider;

    class ControllerServiceProvider extends ServiceProvider
    {

        /**
         * Register the service provider.
         *
         * @return void
         */
        public function register()
        {
            $app=$this->app;

            $app->bind('HomeController', function ($app)
            {
                return new \Scheduler\Controllers\HomeController($app->UserRepository,
                    $app->ShibbolethRepository, $app->AppointmentRepository);
            });

            $app->bind('AppointmentController', function ($app)
            {
                return new \Scheduler\Controllers\AppointmentController($app->UserRepository,
                    $app->ShibbolethRepository, $app->AppointmentRepository);
            });


        }


    }

