import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';

export default [
	...svelte.configs.recommended,
	...svelte.configs.prettier,
	prettier,
	{
		ignores: ['.svelte-kit/', 'build/', 'node_modules/', 'static/', 'tests/']
	}
];
