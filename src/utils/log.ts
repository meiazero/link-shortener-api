interface LogRequest {
	method: string;
	path: string;
}

export function logRequest({ method, path }: LogRequest) {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] ${method.toUpperCase()} ${path}`);
}
