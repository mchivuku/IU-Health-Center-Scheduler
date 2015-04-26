<?php
use Illuminate\Support\ServiceProvider;

/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 4/17/15
 * Time: 4:32 PM
 */

require_once app_path()."/helpers/LDAP/LDAPService.php";

class LDAPServiceProvider extends ServiceProvider{

    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $app = $this->app;
        $app->bind('LDAPService', function () {
            return new LDAPService();
        });

    }
}