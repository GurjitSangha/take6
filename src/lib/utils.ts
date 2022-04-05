export const randId = (length) => {
	return Math.random()
		.toString(16)
		.slice(2, 2 + length);
};
