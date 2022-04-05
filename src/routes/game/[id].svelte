<script>
	import { page } from '$app/stores';
</script>

<div class="min-h-full flex items-center justify-center py-12 px-4">
	<div class="max-w-md w-full space-y-8 text-gray-500 dark:text-white">
		<div>
			<h2 class="text-center text-3xl font-extrabold">
				Welcome to game {$page.params.id}
			</h2>
		</div>
		<a href="/" class="mt-8">Back</a>
	</div>
</div>
