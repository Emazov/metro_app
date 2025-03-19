import { useState, useEffect, useRef } from 'react';

const App = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [points, setPoints] = useState([]);
	const [distance, setDistance] = useState(null);
	const [stream, setStream] = useState(null);

	// Инициализация камеры
	useEffect(() => {
		const enableCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				});
				setStream(stream);
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			} catch (err) {
				console.error('Ошибка доступа к камере:', err);
			}
		};

		enableCamera();

		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	// Обработчик клика по canvas
	const handleCanvasClick = (e) => {
		if (points.length >= 2) return;

		const rect = canvasRef.current.getBoundingClientRect();
		const newPoint = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		};

		setPoints([...points, newPoint]);

		if (points.length === 1) {
			const dx = newPoint.x - points[0].x;
			const dy = newPoint.y - points[0].y;
			setDistance(Math.sqrt(dx * dx + dy * dy));
		}
	};

	// Отрисовка точек и линий
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		if (videoRef.current) {
			canvas.width = videoRef.current.videoWidth;
			canvas.height = videoRef.current.videoHeight;
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Рисуем точки
		points.forEach((point, index) => {
			ctx.beginPath();
			ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
			ctx.fillStyle = 'red';
			ctx.fill();
			ctx.fillText(`${index + 1}`, point.x + 10, point.y - 10);
		});

		// Рисуем линию между точками
		if (points.length === 2) {
			ctx.beginPath();
			ctx.moveTo(points[0].x, points[0].y);
			ctx.lineTo(points[1].x, points[1].y);
			ctx.strokeStyle = 'red';
			ctx.lineWidth = 2;
			ctx.stroke();
		}
	}, [points]);

	const resetMeasurement = () => {
		setPoints([]);
		setDistance(null);
	};

	return (
		<div className='container'>
			<div style={{ position: 'relative' }}>
				<video
					ref={videoRef}
					autoPlay
					playsInline
					style={{ width: '100%', height: 'auto' }}
				/>
				<canvas
					ref={canvasRef}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
					}}
					onClick={handleCanvasClick}
				/>
			</div>

			<div className='controls'>
				{distance && (
					<div>
						<p>Расстояние: {(distance / 37.8).toFixed(2)} см</p>
						<small>(Калибровка требует точной настройки под устройство)</small>
					</div>
				)}
				<button onClick={resetMeasurement}>Сбросить</button>
			</div>
		</div>
	);
};

export default App;
