<script>
	import { getCardScore } from '$lib/utils';
	import { fly } from 'svelte/transition';

	export let value;
	export let selected = false;
	export let onClick = null;

	$: score = getCardScore(value);
	$: dots = Array(score).fill(0);
	$: isRed = score === 5 || score === 7;
	$: isOrange = score === 2 || score === 3;
</script>

<button
	on:click={() => {
		if (onClick) onClick(value);
	}}
	data-value={value}
	class="p-2 border-4 border-gray-200 rounded bg-white hover:bg-gray-50 flex flex-col items-center"
	class:border-green-400={selected}
	in:fly={{ y: 10, duration: 500 }}
>
	<p
		class="font-bold text-black text-sm mb-2"
		class:text-red-600={isRed}
		class:text-orange-600={isOrange}
	>
		{value}
	</p>
	<div class="flex flex-wrap items-center gap-1 w-8 h-8 justify-center">
		{#each dots as dot}
			<span
				class="bg-black w-2 h-2 rounded"
				class:bg-red-600={isRed}
				class:bg-orange-600={isOrange}
			/>
		{/each}
	</div>
</button>
