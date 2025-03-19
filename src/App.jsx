import React, { useState, useRef, useEffect } from 'react';

function App() {
	const [stream, setStream] = useState(null);
	const [error, setError] = useState(null);
	const [points, setPoints] = useState([]);
	const [distance, setDistance] = useState(null);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [dpi, setDpi] = useState(96); // Стандартное значение DPI
	const [calibration, setCalibration] = useState(null);

	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const containerRef = useRef(null);

	// Инициализация видеопотока
	const startStream = async () => {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
				audio: false,
			});
			setStream(mediaStream);
			setError(null);
		} catch (err) {
			setError(`Error accessing camera: ${err.message}`);
		}
	};

	// Обработчик клика по видео
	const handleVideoClick = (e) => {
		if (points.length >= 2) return;

		const rect = videoRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		setPoints((prev) => [...prev, { x, y }]);
	};

	// Расчет расстояния
	const calculateDistance = () => {
		if (points.length === 2) {
			const dx = points[1].x - points[0].x;
			const dy = points[1].y - points[0].y;
			const pixels = Math.sqrt(dx * dx + dy * dy);

			// Конвертация в сантиметры (с калибровкой)
			const cm = calibration
				? (pixels * calibration.actualCM) / calibration.pixels
				: pixels / (dpi / 2.54);

			setDistance(cm.toFixed(2));
		}
	};

	// Отрисовка точек и линий
	const drawMeasurement = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		points.forEach((point, i) => {
			ctx.beginPath();
			ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
			ctx.fillStyle = '#ff0000';
			ctx.fill();

			if (i > 0) {
				ctx.beginPath();
				ctx.moveTo(points[i - 1].x, points[i - 1].y);
				ctx.lineTo(point.x, point.y);
				ctx.strokeStyle = '#ff0000';
				ctx.lineWidth = 2;
				ctx.stroke();
			}
		});
	};

	// Полноэкранный режим
	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			containerRef.current.requestFullscreen();
			setIsFullscreen(true);
		} else {
			document.exitFullscreen();
			setIsFullscreen(false);
		}
	};

	// Обновление canvas при изменении точек
	useEffect(() => {
		if (videoRef.current && canvasRef.current) {
			canvasRef.current.width = videoRef.current.clientWidth;
			canvasRef.current.height = videoRef.current.clientHeight;
			drawMeasurement();
			calculateDistance();
		}
	}, [points]);

	// Очистка при размонтировании
	useEffect(() => {
		return () => {
			if (stream) stream.getTracks().forEach((track) => track.stop());
			if (document.fullscreenElement) document.exitFullscreen();
		};
	}, [stream]);

	return (
		<div className='container' ref={containerRef}>
			<h1>Camera Measurement Tool</h1>

			{error && <div className='error'>{error}</div>}

			<div className='video-container'>
				<video
					ref={videoRef}
					playsInline
					muted
					autoPlay
					onClick={handleVideoClick}
				/>
				<canvas ref={canvasRef} className='measurement-canvas' />
			</div>

			<div className='controls'>
				{!stream ? (
					<button onClick={startStream}>Start Camera</button>
				) : (
					<>
						<button onClick={toggleFullscreen}>
							{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
						</button>
						<button onClick={() => setPoints([])}>Reset Points</button>
					</>
				)}
			</div>

			{distance && (
				<div className='measurement-result'>Distance: {distance} cm</div>
			)}

			<div className='calibration'>
				<h3>Calibration</h3>
				<input
					type='number'
					placeholder='Known length (cm)'
					onChange={(e) => {
						if (points.length === 2) {
							const actualCM = parseFloat(e.target.value);
							const dx = points[1].x - points[0].x;
							const dy = points[1].y - points[0].y;
							const pixels = Math.sqrt(dx * dx + dy * dy);
							setCalibration({ actualCM, pixels });
						}
					}}
				/>
				<small>Measure a known length and enter its real size in cm</small>
			</div>
		</div>
	);
}

export default App;
