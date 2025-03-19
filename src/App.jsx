import { useEffect, useRef, useState } from 'react';

export default function CameraStream() {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [streaming, setStreaming] = useState(false);
	const [points, setPoints] = useState([]);
	const [distance, setDistance] = useState(null);
	const [calibration, setCalibration] = useState(null);
	const [isCalibrating, setIsCalibrating] = useState(false);

	useEffect(() => {
		if (streaming) {
			navigator.mediaDevices
				.getUserMedia({ video: { facingMode: 'environment' } })
				.then((stream) => {
					if (videoRef.current) {
						videoRef.current.srcObject = stream;
					}
				})
				.catch((error) => console.error('Ошибка доступа к камере:', error));
		} else {
			if (videoRef.current && videoRef.current.srcObject) {
				const stream = videoRef.current.srcObject;
				const tracks = stream.getTracks();
				tracks.forEach((track) => track.stop());
				videoRef.current.srcObject = null;
			}
		}
	}, [streaming]);

	const handleCanvasClick = (event) => {
		if (points.length < 2) {
			const rect = canvasRef.current.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			setPoints([...points, { x, y }]);
		}
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		points.forEach((point) => {
			ctx.beginPath();
			ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
			ctx.fillStyle = 'red';
			ctx.fill();
		});

		if (points.length === 2) {
			ctx.beginPath();
			ctx.moveTo(points[0].x, points[0].y);
			ctx.lineTo(points[1].x, points[1].y);
			ctx.strokeStyle = 'red';
			ctx.lineWidth = 2;
			ctx.stroke();

			const dx = points[1].x - points[0].x;
			const dy = points[1].y - points[0].y;
			const pixelDistance = Math.sqrt(dx * dx + dy * dy);

			if (calibration) {
				const realDistance =
					(pixelDistance / calibration.pixelDistance) * calibration.realLength;
				setDistance(realDistance.toFixed(2));
			} else {
				setDistance('Калибровка не установлена');
			}
		}
	}, [points, calibration]);

	const resetMeasurement = () => {
		setPoints([]);
		setDistance(null);
	};

	const calibrate = () => {
		if (points.length === 2) {
			const dx = points[1].x - points[0].x;
			const dy = points[1].y - points[0].y;
			const pixelDistance = Math.sqrt(dx * dx + dy * dy);
			const realLength = prompt(
				'Введите реальную длину эталонного объекта в см:'
			);
			if (realLength) {
				setCalibration({ pixelDistance, realLength: parseFloat(realLength) });
				setPoints([]);
				setDistance(null);
			}
		}
	};

	return (
		<div className='flex flex-col items-center p-4'>
			<h1 className='text-xl font-bold mb-4'>Камера в браузере</h1>
			<div className='relative w-full max-w-md'>
				<video
					ref={videoRef}
					autoPlay
					className='w-full rounded-lg shadow-md'
				/>
				<canvas
					ref={canvasRef}
					onClick={handleCanvasClick}
					className='absolute top-0 left-0 w-full h-full'
					width={videoRef.current?.videoWidth || 640}
					height={videoRef.current?.videoHeight || 480}
				/>
			</div>
			{distance && <p className='mt-2 text-lg'>Длина: {distance} см</p>}
			<div className='flex gap-2 mt-4'>
				<button
					onClick={() => setStreaming(!streaming)}
					className='px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600'
				>
					{streaming ? 'Остановить' : 'Запустить'} стрим
				</button>
				<button
					onClick={resetMeasurement}
					className='px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600'
				>
					Сбросить
				</button>
				<button
					onClick={calibrate}
					className='px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600'
				>
					Калибровать
				</button>
			</div>
		</div>
	);
}
