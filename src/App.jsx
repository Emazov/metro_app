import { useState, useEffect, useRef } from 'react';

const App = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [points, setPoints] = useState([]);
	const [distance, setDistance] = useState(null);
	const [stream, setStream] = useState(null);
	const [isStreamActive, setIsStreamActive] = useState(false);
	const canvasRectRef = useRef({ width: 0, height: 0 });

	// Инициализация размеров canvas
	const updateCanvasDimensions = () => {
		if (videoRef.current && canvasRef.current) {
			const video = videoRef.current;
			const aspectRatio = video.videoWidth / video.videoHeight;

			// Устанавливаем размеры видео и canvas
			const containerWidth = video.parentElement.offsetWidth;
			const calculatedHeight = containerWidth / aspectRatio;

			video.style.width = `${containerWidth}px`;
			video.style.height = `${calculatedHeight}px`;

			canvasRef.current.width = video.videoWidth;
			canvasRef.current.height = video.videoHeight;

			canvasRectRef.current = {
				width: containerWidth,
				height: calculatedHeight,
				scaleX: video.videoWidth / containerWidth,
				scaleY: video.videoHeight / calculatedHeight,
			};
		}
	};

	// Инициализация камеры
	const startStream = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'environment',
					width: { ideal: 1920 },
					height: { ideal: 1080 },
				},
			});

			setStream(stream);
			setIsStreamActive(true);

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.onloadedmetadata = () => {
					videoRef.current.play();
					updateCanvasDimensions();
				};
			}
		} catch (err) {
			console.error('Ошибка доступа к камере:', err);
			alert('Не удалось получить доступ к задней камере');
		}
	};

	const stopStream = () => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			setStream(null);
			setIsStreamActive(false);
			if (videoRef.current) {
				videoRef.current.srcObject = null;
			}
		}
	};

	// Обработчик клика с коррекцией координат
	const handleCanvasClick = (e) => {
		if (!isStreamActive || points.length >= 2) return;

		const rect = canvasRef.current.getBoundingClientRect();
		const scaleX = canvasRectRef.current.scaleX;
		const scaleY = canvasRectRef.current.scaleY;

		const newPoint = {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		};

		setPoints((prev) => [...prev, newPoint]);

		if (points.length === 1) {
			const dx = newPoint.x - points[0].x;
			const dy = newPoint.y - points[0].y;
			setDistance(Math.sqrt(dx * dx + dy * dy));
		}
	};

	// Отрисовка
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		points.forEach((point, index) => {
			ctx.beginPath();
			ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
			ctx.fillStyle = '#ff0000';
			ctx.fill();

			ctx.font = '20px Arial';
			ctx.fillText(`${index + 1}`, point.x + 15, point.y - 15);
		});

		if (points.length === 2) {
			ctx.beginPath();
			ctx.moveTo(points[0].x, points[0].y);
			ctx.lineTo(points[1].x, points[1].y);
			ctx.strokeStyle = '#ff0000';
			ctx.lineWidth = 3;
			ctx.stroke();
		}
	}, [points]);

	const resetMeasurement = () => {
		setPoints([]);
		setDistance(null);
	};

	useEffect(() => {
		window.addEventListener('resize', updateCanvasDimensions);
		return () => window.removeEventListener('resize', updateCanvasDimensions);
	}, []);

	return (
		<div className='container'>
			<div style={{ position: 'relative', backgroundColor: '#000' }}>
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted
					style={{ display: 'block', objectFit: 'contain' }}
				/>
				<canvas
					ref={canvasRef}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						touchAction: 'none',
					}}
					onClick={handleCanvasClick}
				/>
			</div>

			<div style={{ padding: '20px', textAlign: 'center' }}>
				<div style={{ margin: '10px 0' }}>
					<button
						onClick={isStreamActive ? stopStream : startStream}
						style={{
							padding: '12px 24px',
							fontSize: '16px',
							backgroundColor: isStreamActive ? '#ff4444' : '#4CAF50',
							color: 'white',
							border: 'none',
							borderRadius: '8px',
							margin: '5px',
						}}
					>
						{isStreamActive ? 'Выключить камеру' : 'Включить камеру'}
					</button>

					<button
						onClick={resetMeasurement}
						style={{
							padding: '12px 24px',
							fontSize: '16px',
							backgroundColor: '#2196F3',
							color: 'white',
							border: 'none',
							borderRadius: '8px',
							margin: '5px',
						}}
					>
						Сбросить точки
					</button>
				</div>

				{distance && (
					<div style={{ fontSize: '24px', margin: '20px 0' }}>
						Расстояние: {(distance * 0.02645833).toFixed(2)} см
						<div style={{ fontSize: '12px', color: '#666' }}>
							(Для точности направьте камеру перпендикулярно объекту)
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default App;
