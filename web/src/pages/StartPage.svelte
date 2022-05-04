<script lang="ts">
  import MainCardLayout from "@layouts/MainCardLayout.svelte";
  import { Link } from "svelte-routing";
  import { rootPath } from "@stores/context";
</script>

<MainCardLayout>
  <div class="card-body">
    <h5 class="card-title">Safety enforcement via programmable strategies in Maude</h5>
    <p class="card-text">This work aims to provide a general mechanism for safety enforcement in rewriting logic computations. Our technique relies on an assertion-guided model transformation that leverages the newly defined Maude strategy language for ensuring rich safety policies in non-deterministic programs. The transformed system is guaranteed to comply with user-defined invariants that are expressed in a strategy-based, pattern-matching logics, thus preventing the concurrent system to reach any unsafe states. The performance and scalability of the proposed technique is empirically evaluated and benchmarked on a set of realistic programs.</p>
    <Link class="btn btn-primary" to={`${$rootPath}/program`}>Start</Link>
  </div>
</MainCardLayout>