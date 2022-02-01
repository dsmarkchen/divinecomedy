<template>
  <div class="container">
    <h4>Profile</h4>
    <p>email: <mark>{{ em }}</mark></p>

    <p>That is all.  </p>
  </div>
</template>
<script>

export default {
  name: "Profile",
  data: function () {
    return {      
      em: "",
    };
  },
};
</script>
