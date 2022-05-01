<script lang="ts">
  import MainCardLayout from "@layouts/MainCardLayout.svelte";
  import { Link } from "svelte-routing";
  import { rootPath } from "@stores/context";
</script>

<MainCardLayout>
  <div class="card-body">
    <h5 class="card-title">STRASS</h5>
    <p class="card-text">Welcome to STRASS.</p>
    <Link class="btn btn-primary" to={`${$rootPath}/program`}>Start</Link>
  </div>
</MainCardLayout>