<script lang="ts">
  import { Router, Route } from "svelte-routing";
  import StartPage from "@pages/StartPage.svelte";
  import ProgramStepPage from "@pages/ProgramStepPage.svelte";
  import ConstraintsStepPage from "@pages/ConstraintsStepPage.svelte";
  import ResultStepPage from "@pages/ResultStepPage.svelte";
  import { rootPath } from "@stores/context";
</script>

<Router basepath={$rootPath}>
  <Route path="/"><StartPage/></Route>
  <Route path="/program"><ProgramStepPage/></Route>
  <Route path="/constraints"><ConstraintsStepPage/></Route>
  <Route path="/result"><ResultStepPage/></Route>
  <Route>404 Page not found</Route>
</Router>