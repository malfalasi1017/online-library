<script>
  import '../app.css';
  const { children } = $props();
</script>

<div class="min-h-screen bg-gray-50">
  {@render children()}
</div>