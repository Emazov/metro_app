import { useEffect, useRef, useState } from 'react';

const CameraMeasureApp = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [points, setPoints] = useState([]);
	const [stream, setStream] = useState(null);
	const [cmPerPixel, setCmPerPixel] = useState(null);
	const [isCalibrating, setIsCalibrating] = useState(false);
	const [knownDistance, setKnownDistance] = useState('');
	const animationFrameRef = useRef();

	// Инициализация камеры
	const startCamera = async () => {
		try {
			const newStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
			});
			const video = videoRef.current;
			video.srcObject = newStream;

			await new Promise((resolve) => {
				video.onloadedmetadata = () => {
					video.play();
					const canvas = canvasRef.current;
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					resolve();
				};
			});

			setStream(newStream);
			startCanvasAnimation();
		} catch (error) {
			console.error('Error accessing camera:', error);
		}
	};

	// Калибровка системы
	const handleCalibration = () => {
		if (points.length === 2 && knownDistance) {
			const dx = points[1].x - points[0].x;
			const dy = points[1].y - points[0].y;
			const pixelDistance = Math.sqrt(dx ** 2 + dy ** 2);
			const newCmPerPixel = parseFloat(knownDistance) / pixelDistance;
			setCmPerPixel(newCmPerPixel);
			setIsCalibrating(false);
			setPoints([]);
		}
	};

	// Расчет расстояния с коррекцией перспективы
	const calculateDistance = () => {
		if (!cmPerPixel || points.length < 2) return '0.00';

		const dx = points[1].x - points[0].x;
		const dy = points[1].y - points[0].y;
		const pixelDistance = Math.sqrt(dx ** 2 + dy ** 2);

		// Базовая коррекция перспективы (требует доработки под конкретный случай)
		const distance3D = pixelDistance * cmPerPixel * Math.cos(Math.PI / 6);

		return distance3D.toFixed(2);
	};

	// Обработчик кликов для canvas
	const handleCanvasClick = (e) => {
		if (!isCalibrating && points.length >= 2) return;

		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const newPoint = {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		};

		setPoints((prev) => [...prev, newPoint]);
	};

	// Отрисовка интерфейса
	return (
		<div className='w-full h-screen flex flex-col items-center bg-black text-white'>
			<video ref={videoRef} className='hidden' autoPlay playsInline />
			<canvas
				ref={canvasRef}
				className='w-full h-auto max-h-[80vh]'
				onClick={handleCanvasClick}
			/>

			<div className='mt-4 text-xl'>
				{cmPerPixel
					? `Distance: ${calculateDistance()} cm`
					: 'Need calibration'}
			</div>

			{isCalibrating && (
				<div className='calibration-panel'>
					<input
						type='number'
						placeholder='Known distance (cm)'
						value={knownDistance}
						onChange={(e) => setKnownDistance(e.target.value)}
						className='text-black p-2 m-2'
					/>
					<button
						onClick={handleCalibration}
						className='bg-yellow-500 px-4 py-2 rounded'
					>
						Calibrate
					</button>
				</div>
			)}

			<div className='flex gap-4 my-4'>
				<button
					onClick={() => setIsCalibrating(true)}
					className='bg-purple-500 px-4 py-2 rounded'
				>
					Calibrate
				</button>
				<button
					onClick={() => setPoints([])}
					className='bg-blue-500 px-4 py-2 rounded'
				>
					Reset
				</button>
			</div>
		</div>
	);
};

// Остальные функции (startCanvasAnimation, stopCamera) остаются как в предыдущей версии

export default CameraMeasureApp;
