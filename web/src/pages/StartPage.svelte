<script lang="ts">
  import { Link } from "svelte-routing";
  import { rootPath } from "@stores/context";
</script>

<main>
  <div class="title-area">
    <h1 class="title">Safety enforcement via programmable strategies in Maude</h1> 
    by 
    <a class="author-link" href="http://www.dsic.upv.es/users/elp/alpuente.html">María Alpuente</a>,
    <a class="author-link" href="http://users.dimi.uniud.it/~demis.ballis/">Demis Ballis</a>,
    <a class="author-link" href="http://personales.upv.es/sanesro/">Santiago Escobar</a>,
    <a class="author-link" href="http://personales.alumno.upv.es/dagapas">Daniel Galán</a> and
    <a class="author-link" href="http://personales.upv.es/jusasan/">Julia Sapiña</a>
  </div>
  <div class="abstract-area">
    This work aims to provide a general mechanism for safety enforcement in rewriting logic computations. Our technique relies on an assertion-guided model transformation that leverages the newly defined Maude strategy language for ensuring rich safety policies in non-deterministic programs. The transformed system is guaranteed to comply with user-defined invariants that are expressed in a strategy-based, pattern-matching logics, thus preventing the concurrent system to reach any unsafe states. The performance and scalability of the proposed technique is empirically evaluated and benchmarked on a set of realistic programs.
  </div>

  <Link class="btn btn-primary start-btn" to={`${$rootPath}/program`}>Start</Link>

  <div class="backers-area">
    <a target="_blank" title="UPV" href="http://www.upv.es">
      <img class="backer-logo" src={`${$rootPath}/img/logo/upv.png`} alt="UPV" />
    </a>
    <a target="_blank" title="GVA" href="http://www.ceice.gva.es">
      <img class="backer-logo" src={`${$rootPath}/img/logo/gva.png`} alt="GVA" />
    </a>
    <a target="_blank" title="MINECO" href="http://www.mineco.gob.es">
      <img class="backer-logo" src={`${$rootPath}/img/logo/mineco.png`} alt="MINECO" />
    </a>
  </div>
</main>

<style>
  main {
    max-width: 990px;
    margin: auto;
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .title-area {
    text-align: center;
    padding: 15px;
    margin-top: 10px;
  }

  .title {
    font-size: 3.25em;
    font-family: "Oswald", sans-serif;
    max-width: 800px;
  }

  .author-link {
    font-size: 1em;
    text-decoration: none;
  }
  .author-link:hover {
    text-decoration: dotted;
  }

  .abstract-area {
    text-align: justify;
    padding-left: 100px;
    padding-right: 100px;
    margin-top: 30px;
    font-size: 1em;
    font-family: "Georgia", "Times New Roman", Times, serif;
  }

  :global(.start-btn) {
    margin-top: 50px;
    display: block;
    margin-right: auto;
    margin-left: auto;
    width: 150px;
  }

  .backers-area {
    padding: 5px;
    margin: 0 auto;
    margin-top: 60px;
    text-align: center;
    border: 2px solid black;
    background-color: white;
  }

  .backer-logo {
    margin-left: 10px;
    margin-right: 10px;
    margin-top: 5px;
    margin-bottom: 5px;
    border: 0px;
  }
</style>