// Adds a "Copy" button to every code block. Loaded only on posts that have one.
// Plain JavaScript on purpose: this file is shipped as it is, not bundled.

/** @type {NodeListOf<HTMLPreElement>} */
const blocks = document.querySelectorAll('.prose pre');

for (const pre of blocks) {
	const wrapper = document.createElement('div');
	wrapper.className = 'code-block';
	pre.replaceWith(wrapper);
	wrapper.append(pre);

	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'copy-code';
	button.textContent = 'Copy';
	wrapper.append(button);

	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let timer;
	button.addEventListener('click', async () => {
		try {
			await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? pre.innerText);
			button.textContent = 'Copied';
		} catch {
			button.textContent = 'Failed';
		}
		clearTimeout(timer);
		timer = setTimeout(() => (button.textContent = 'Copy'), 2000);
	});
}
