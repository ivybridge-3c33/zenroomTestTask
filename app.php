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
				header("HTTP/1.0 404 Not Found");
				echo 'Page not found';
			}
		}
	}

	private function getRoomTypes()
	{
		try {
			$stmt = $this->db->prepare('select * from roomtype');
			$stmt->execute();
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

	private function saveManualRate()
	{
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			try {
				$data = file_get_contents('php://input');
				$postData = json_decode($data, true);

				$rateDate = $postData['ratedate'];
				$idroomtype = $postData['idroomtype'];
				$price = $postData['price'];
				$key = $rateDate.'-'.$idroomtype;
				$availability = $postData['available'];

				$stmt = $this->db->prepare('INSERT INTO rate (idrate, idroomtype, price, available, ratedate) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE price = ?, available = ?');
				$stmt->execute([$key, $idroomtype, $price, $availability, $rateDate, $price, $availability]);
				$stmt = $this->db->prepare('INSERT INTO ratebackup (idroomtype, price, available, ratedate) VALUES (?, ?, ?, ?)');
				$stmt->execute([$idroomtype, $price, $availability, $rateDate]);
			} catch (PDOException $e) {
				header("HTTP/1.0 500 Internal Server Error");
				echo json_encode(['errors' => "DataBase Error: ".$e->getMessage()]);
			} catch (Exception $e) {
				header("HTTP/1.0 500 Internal Server Error");
				echo json_encode(['errors' => "Error: ".$e->getMessage()]);
			}
		}else{
			echo 'Access denined';
		}
	}

	private function getRates()
	{
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			try {
				$data = file_get_contents('php://input');
				$postData = json_decode($data, true);
				$date = $postData['startDate'];
				$totalDayOfCalendar = $postData['totalDayOfCalendar'];
				$startDate =  date('Y-m-d', strtotime($date));
				$toDate =  date('Y-m-d', strtotime('+'.($totalDayOfCalendar -1). 'day', strtotime($date)));;
				$stmt = $this->db->prepare('select * from roomtype where active = 1');
				$stmt->execute();
				$rates = [];
				$roomTypes = $stmt->fetchAll();
				foreach($roomTypes as $roomType){
					$stmt = $this->db->prepare('select ratedate, price, available from rate where idroomtype = ? and ratedate between ? and ? order by ratedate asc');
					$stmt->execute([$roomType['idroomtype'], $startDate, $toDate]);
					$rateList = $stmt->fetchAll();
					$begin = new DateTime($date);
					$end = new DateTime($date);
					$end->add(new DateInterval('P'.($totalDayOfCalendar).'D'));

					$interval = DateInterval::createFromDateString('1 day');
					$period = new DatePeriod($begin, $interval, $end);

					$newRateList = [];
					foreach ( $period as $dt ){
						$firstKey = key($rateList);
						if(isset($rateList[$firstKey]) && $dt->format('Y-m-d') == $rateList[$firstKey]['ratedate']){
							$rateList[$firstKey]['idroomtype'] = $roomType['idroomtype'];
							$rateData = $rateList[$firstKey];
							$rateData['price'] = (int) $rateData['price'];
							$rateData['available'] = (int) $rateData['available'];
							$newRateList[] = $rateData;
							unset($rateList[$firstKey]);
						}else{
							$newRateList[] = ['ratedate' => $dt->format('Y-m-d'), 'price' => 0, 'available' => 0, 'idroomtype' => $roomType['idroomtype']];
						}
					}
					$roomType['rates'] = $newRateList;
					$rates[$roomType['idroomtype']] = $roomType;
				}

				echo json_encode($rates);
				
			} catch (PDOException $e) {
				echo json_encode(['errors' => "DataBase Error: ".$e->getMessage()]);
			} catch (Exception $e) {
				echo json_encode(['errors' => "Error: ".$e->getMessage()]);
			}
		}else{
			echo 'Access denined';
		}
	}

	private function setRates()
	{
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			$data = file_get_contents('php://input');
			$postData = json_decode($data, true);
			$idroomtype = $postData['idroomtype'];
			$price = $postData['price'];
			$availability = $postData['availability'];
			$days = $postData['days'];

			$begin = new DateTime($postData['startDate']);
			$end = new DateTime($postData['endDate']);

			$interval = DateInterval::createFromDateString('1 day');
			$period = new DatePeriod($begin, $interval, $end);

			foreach ( $period as $dt ){
				if(in_array($dt->format('N'), $days)){
					try {
						$rateDate = $dt->format('Y-m-d');
						$key = $rateDate.'-'.$idroomtype;
						$stmt = $this->db->prepare('INSERT INTO rate (idrate, idroomtype, price, available, ratedate) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE price = ?, available = ?');
						$stmt->execute([$key, $idroomtype, $price, $availability, $rateDate, $price, $availability]);
						$stmt = $this->db->prepare('INSERT INTO ratebackup (idroomtype, price, available, ratedate) VALUES (?, ?, ?, ?)');
						$stmt->execute([$idroomtype, $price, $availability, $rateDate]);
					} catch (PDOException $e) {
						$this->db->rollBack();
						echo json_encode(['errors' => "DataBase Error: ".$e->getMessage()]);
					} catch (Exception $e) {
						$this->db->rollBack();
						echo json_encode(['errors' => "Error: ".$e->getMessage()]);
					}
				}
			}

			echo json_encode(['success' => '1']);
		}else{
			echo 'Access denined';
		}
	}

	private function removeRoomType()
	{
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			$data = file_get_contents('php://input');
			$postData = json_decode($data, true);
			$idroomtype = $postData['idroomtype'];

			try {
				$stmt = $this->db->prepare('DELETE FROM roomtype where idroomtype = ?');
				$stmt->execute([$idroomtype]);
			} catch (PDOException $e) {
				echo json_encode(['errors' => "DataBase Error: ".$e->getMessage()]);
			} catch (Exception $e) {
				echo json_encode(['errors' => "Error: ".$e->getMessage()]);
			}
			echo json_encode(['success' => '1']);
		}else{
			echo 'Access denined';
		}
	}

	private function saveRoomType()
	{
		if ($_SERVER['REQUEST_METHOD'] === 'POST') {
			$data = file_get_contents('php://input');
			$postData = json_decode($data, true);
			$isNew = isset($postData['isNew']) ? $postData['isNew'] : 0;
			$roomtypename = $postData['roomtypename'];
			$description = $postData['description'];
			$minimumprice = $postData['minimumprice'];
			$totalrooms = $postData['totalrooms'];
			try {
				if($isNew == 0){
					$idroomtype = $postData['idroomtype'];
					$stmt = $this->db->prepare('update roomtype set roomtypename = ?, description = ?, minimumprice = ?, totalrooms = ? where idroomtype = ?');
					$stmt->execute([$roomtypename, $description, $minimumprice, $totalrooms, $idroomtype]);
				}else{
					$stmt = $this->db->prepare('insert into roomtype (roomtypename, description, minimumprice, totalrooms) values (?, ?, ?, ?)');
					$stmt->execute([$roomtypename, $description, $minimumprice, $totalrooms]);
					$idroomtype = $this->db->lastInsertId();
				}
				$stmt = $this->db->prepare('select * from roomtype where idroomtype = ?');
				$stmt->execute([$idroomtype]);
				echo json_encode(['success' => '1', 'data' => $stmt->fetch()]);
			} catch (PDOException $e) {
				echo json_encode(['errors' => "DataBase Error: ".$e->getMessage()]);
			} catch (Exception $e) {
				echo json_encode(['errors' => "Error: ".$e->getMessage()]);
			}
		}else{
			echo 'Access denined';
		}
	}

}

new app();
