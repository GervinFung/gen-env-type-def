const guard = <T, Err extends Error>({
	value,
	error,
}: Readonly<{
	value: T;
	error: Err;
}>) => {
	const t = value;
	if (t !== undefined && t != null) {
		return t;
	}
	// eslint-disable-next-line @typescript-eslint/only-throw-error
	throw error;
};

export { guard };
