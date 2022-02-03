<template>
  <div id="app">    
      <b-navbar>
     <template #start>
            <b-navbar-item href="/dict">
                Dictionary
            </b-navbar-item>

            <b-navbar-item href="/purgatorio">
                Purgatorio
            </b-navbar-item>
            <b-navbar-dropdown label="Profile">
                <b-navbar-item href="#">
                    Profile
                </b-navbar-item>
                <b-navbar-item href="#">
                    Logout
                </b-navbar-item>
            </b-navbar-dropdown>
        </template>
   </b-navbar>

  <b-navbar toggleable="lg" type="dark" variant="dark">
    <b-navbar-brand>LDC</b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
         <b-nav-item>
          <router-link to="/dict">Dict</router-link>              
        </b-nav-item>  
        <b-nav-item>
          <router-link to="/purgatorio">Purgatorio</router-link>              
        </b-nav-item>        

        <b-nav-item disabled>Paradiso</b-nav-item>        
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template #button-content>
            <em>User</em>
          </template>
          <b-dropdown-item><router-link to="/login">Log in</router-link></b-dropdown-item>
          <b-dropdown-item><router-link to="/profile">Profile</router-link></b-dropdown-item>
          <b-dropdown-item @click="logout()">Sign Out</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>

  <router-view />

  </div>
</template>

<script>


export default {
  name: 'App',
  components: {
    
  }
}
</script>

<style>
#app {
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
