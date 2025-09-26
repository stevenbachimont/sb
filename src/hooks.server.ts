import type { Handle } from '@sveltejs/kit';
import 'dotenv/config';

// Handle simple sans internationalisation pour le moment
export const handle: Handle = ({ event, resolve }) => {
	return resolve(event);
};
