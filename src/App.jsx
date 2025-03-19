import { useEffect, useRef, useState } from 'react';

export default function CameraStream() {
	const videoRef = useRef(null);
	const [streaming, setStreaming] = useState(false);

	useEffect(() => {
		if (streaming) {
			navigator.mediaDevices
				.getUserMedia({ video: true })
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

	return (
		<div className='flex flex-col items-center p-4'>
			<h1 className='text-xl font-bold mb-4'>Камера в браузере</h1>
			<video
				ref={videoRef}
				autoPlay
				className='w-full max-w-md rounded-lg shadow-md'
			/>
			<button
				onClick={() => setStreaming(!streaming)}
				className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600'
			>
				{streaming ? 'Остановить' : 'Запустить'} стрим
			</button>
		</div>
	);
}
