<script>
	import Hourglass from 'carbon-icons-svelte/lib/Hourglass.svelte';
	import CheckmarkOutline from 'carbon-icons-svelte/lib/CheckmarkOutline.svelte';
	export let score = null;
	export let name;
	export let isPlayer = false;
	export let showScore = true;

	export let icon = null;
</script>

<div
	class="border border-white text-white w-40 rounded px-4 py-2 flex justify-between items-center"
	class:border-pink-600={isPlayer}
>
	<div class="flex flex-col">
		<p class="font-bold overflow-hidden text-ellipsis w-24">{name}</p>
		{#if showScore}
			<p>Score: {score}</p>
		{/if}
	</div>

	{#if icon === 'waiting'}
		<Hourglass size={20} />
	{:else if icon === 'selected'}
		<CheckmarkOutline size={20} />
	{/if}
</div>
