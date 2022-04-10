<script>
	export let value;
	export let score;
</script>

<div
	class="p-4 border border-gray-200 rounded w-auto bg-white hover:bg-gray-50 hover:border-t-4 hover:border-t-blue-500 flex items-center"
>
	<h1 class="font-bold text-gray-700 text-sm">{value}</h1>
	<br />
	<h2 class="font-bold text-gray-700 text-sm">({score})</h2>
</div>
