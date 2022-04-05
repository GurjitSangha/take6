<script>
	import '../app.css';
</script>

<div class="h-full">
	<slot />
</div>

<style>
	@media (prefers-color-scheme: dark) {
		:global(body) {
			background-color: #1e293b;
		}
	}
</style>
