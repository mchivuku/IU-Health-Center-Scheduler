<?php

class ExampleTest extends TestCase
{

    /**
     * A basic functional test example.
     *
     * @return void
     */
    public function testBasicExample()
    {
        $crawler = $this->client->request('GET', 'https://seville.iuhc.iub.edu/comm/hcScheduler/public');

        $this->assertTrue($this->client->getResponse()->isOk());
    }

}
