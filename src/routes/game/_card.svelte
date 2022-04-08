<script>
	export let value;
	export let score;
</script>

<button
	class="p-4 border border-gray-200 rounded w-16 bg-white hover:bg-gray-50 hover:border-b-4 hover:border-b-blue-500 flex items-center active:bg-gray-100"
>
	<h1 class="font-bold text-gray-700 text-sm">{value}</h1>
	<br />
	<h2 class="font-bold text-gray-700 text-sm">({score})</h2>
</button>
