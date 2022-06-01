<script lang="ts">
  import BenchmarksPage from "@pages/BenchmarksPage.svelte";
  import ConstraintsStepPage from "@pages/ConstraintsStepPage.svelte";
  import ProgramStepPage from "@pages/ProgramStepPage.svelte";
  import ResultStepPage from "@pages/ResultStepPage.svelte";
  import StartPage from "@pages/StartPage.svelte";
  import { rootPath } from "@stores/context";
  import { Route,Router } from "svelte-routing";
</script>

<Router basepath={$rootPath}>
  <Route path="/"><StartPage/></Route>
  <Route path="/program"><ProgramStepPage/></Route>
  <Route path="/constraints"><ConstraintsStepPage/></Route>
  <Route path="/result"><ResultStepPage/></Route>
  <Route path="/benchmarks"><BenchmarksPage/></Route>
  <Route>404 Page not found</Route>
</Router>