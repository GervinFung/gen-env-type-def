type ImportMetaEnv = {
	readonly NODE_ENV: 'development' | 'production' | 'staging' | 'testing';
	readonly REQUIRED_IN_DEV_ONLY?: 'true';
	readonly ORIGIN:
		| 'http://localhost:3000'
		| 'https://arkham.io'
		| 'https://staging.arkham.io'
		| 'http://localhost:8000';
	readonly TIME_OUT: '0' | '2_000_000' | '1_000_000';
	readonly SAME: 'hi';
	readonly REQUIRED_IN_TEST_ONLY?: 'false';
}
type ImportMeta = {
	readonly env: ImportMetaEnv;
}
