const guard = <T>(t: T, error: Error) => {
	if (t !== undefined && t != null) {
		return t;
	}

	throw error;
};

export { guard };
