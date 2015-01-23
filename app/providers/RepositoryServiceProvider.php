<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 2:08 PM
 */

 use Illuminate\Support\ServiceProvider;

 class RepositoryServiceProvider extends ServiceProvider{

        /**
         * Register the service provider.
         *
         * @return void
         */
        public function register()
        {

            $app = $this->app;

            $app->bind('ShibbolethRepository',
                function(){
                    return new \Scheduler\Repository\ShibbolethRepository();
                });

            $app->bind('UserRepository', function() {
                return new \Scheduler\Repository\UserRepository();
            });


            $app->bind('AppointmentRepository',function(){
                return new \Scheduler\Repository\AppointmentRepository();
            });

            $app->bind('FacilitiesRepository',function(){
                return new \Scheduler\Repository\FacilitiesRepository();
            });

            $app->bind('VisitTypeRepository',function(){
                return new \Scheduler\Repository\VisitTypeRepository();
            });

            $app->bind('SchedulerLogRepository',function(){
                return new \Scheduler\Repository\SchedulerLogRepository();
            });

            $app->bind('ProviderRepository',function(){
                return new \Scheduler\Repository\ProviderRepository();
            });

        }
    }
