import { useEffect, useRef, useState } from 'react';

export default function CameraStream() {
	const videoRef = useRef(null);
	const [streaming, setStreaming] = useState(false);
	const [points, setPoints] = useState([]);
	const [distance, setDistance] = useState(null);

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
			const rect = event.target.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			setPoints([...points, { x, y }]);
		}
	};

	useEffect(() => {
		if (points.length === 2) {
			const dx = points[1].x - points[0].x;
			const dy = points[1].y - points[0].y;
			const pixelDistance = Math.sqrt(dx * dx + dy * dy);
			const realDistance = (pixelDistance / 100) * 2.54; // Примерный коэффициент
			setDistance(realDistance.toFixed(2));
		}
	}, [points]);

	const resetMeasurement = () => {
		setPoints([]);
		setDistance(null);
	};

	return (
		<div className='flex flex-col items-center p-4'>
			<h1 className='text-xl font-bold mb-4'>Камера в браузере</h1>
			<div className='relative'>
				<video
					ref={videoRef}
					autoPlay
					className='w-full max-w-md rounded-lg shadow-md'
				/>
				<canvas
					onClick={handleCanvasClick}
					className='absolute top-0 left-0 w-full h-full'
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
			</div>
		</div>
	);
}
