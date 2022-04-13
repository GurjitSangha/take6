<script>
	export let value;
	export let score;
	export let selected = false;
	export let onClick = null;
</script>

<button
	on:click={() => {
		if (onClick) onClick(value);
	}}
	data-value={value}
	class="p-4 border border-gray-200 rounded w-auto bg-white hover:bg-gray-50 flex items-center"
	class:bg-green-400={selected}
>
	<p class="font-bold text-gray-700 text-sm">{value}</p>
	<br />
	<p class="font-bold text-gray-700 text-sm">({score})</p>
</button>
