<?php
/*
This is a sample script to receive the data the chrome plugin sends.
*/

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');

if($_SERVER['REQUEST_METHOD'] == 'POST') {
  if($_SERVER['HTTP_AUTHORIZATION'] != 'Bearer YOURTOKENHERE') {
    header('HTTP/1.1 403 Forbidden');
    die();
  }
    
  $input = file_get_contents('php://input');
  if($input) {
    $tabs = json_decode($input, true);
    // The chrome extension sends {"0":18,"1":10} and we want just [18,10]
    $tabs['breakdown'] = array_values($tabs['breakdown']);
    
    // Maybe you want to write this to a file
    file_put_contents(dirname(__FILE__).'/tabs.json', json_encode($tabs));

    /*
    You can do more stuff with the data it sends. Here's some example values.

    $tabs['timestamp'] = '2017-04-27T20:55:32.645Z';
    $tabs['tzoffset'] = -25200;
    $tabs['num_windows'] = 2;
    $tabs['num_tabs'] = 28;
    $tabs['breakdown'] = [18,10];

    For example, you could insert them into a database:

    $db = new PDO('mysql:host=127.0.0.1;dbname=tabs', 'root', 'password');
    
    $query = $db->prepare('INSERT INTO tabs (date, tzoffset, num_windows, num_tabs, breakdown) VALUES(?,?,?,?,?)');
    $query->bindValue(1, date('Y-m-d H:i:s', strtotime($tabs['timestamp'])));
    $query->bindValue(2, $tabs['tzoffset']);
    $query->bindValue(3, $tabs['num_windows']);
    $query->bindValue(4, $tabs['num_tabs']);
    $query->bindValue(5, json_encode($tabs['breakdown']));
    $query->execute();    
    */
  }
}
