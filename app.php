<?php 
class app {

	private $db;
	
	function __construct()
	{
		try {
			$pdo = new PDO('mysql:host=localhost; dbname=zenrooms', 'root', 'oomNouj', [PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"]);
			$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
			$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
			$this->db = $pdo;
		} catch (PDOException $e) {
			echo json_encode(['errors' => "DataBase Error: ".$e->getMessage()]);
		}

		$urlData = [];
		if(isset($_SERVER['PATH_INFO'])){
			$urlData = $_SERVER['PATH_INFO'];
			$urlData = trim($urlData, '/');
			if($urlData!=''){
				$urlData =  explode('/', $urlData);
			}
		}

		if(count($urlData) > 0){
			$functionName = $urlData[0];
			unset($urlData[0]);
			if(method_exists($this, $functionName)){
				call_user_func_array([$this, $functionName], $urlData);
			}else{
				echo 'Page not found';
			}
		}
	}

	private function getRoomTypes()
	{
		try {
			$stmt = $this->db->prepare('select * from roomtype');
			$stmt->execute();
			echo json_encode();
			$data = [];
			foreach($stmt->fetchAll() as $arr){
				$data[$arr['idroomtype']] = $arr;
			}
			echo json_encode($data);
		} catch (PDOException $e) {
			echo json_encode(['errors' => "DataBase Error: ".$e->getMessage()]);
		} catch (Exception $e) {
			echo json_encode(['errors' => "Error: ".$e->getMessage()]);
		}
	}

	private function getRates()
	{
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			try {
				$date = $_POST['rateBetween'];
				$startOfMonth =  date('Y-m-01', strtotime($date));
				$endOfMonth =  date('Y-m-t', strtotime($date));
				$stmt = $this->db->prepare('select * from roomtypes');
				$stmt->execute();
				$rates = [];
				foreach($stmt->fetchAll() as $room){
					$stmt = $this->db->prepare('select ratedate, price, available from rate where idroomtype = ? and ratedate between ? and ? and');
					$stmt->execute(array($room['idroomtype'], $startOfMonth, $endOfMonth));
					$room['rates'] = $stmt->fetchAll();
					$rates[] = $room;
				}
				
			} catch (PDOException $e) {
				echo json_encode(['errors' => "DataBase Error: ".$e->getMessage()]);
			} catch (Exception $e) {
				echo json_encode(['errors' => "Error: ".$e->getMessage()]);
			}
		}else{
			echo 'Access denined';
		}
	}

	private function setRate()
	{
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {

		}
		
	}

}

new app();
