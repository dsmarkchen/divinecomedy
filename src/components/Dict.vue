<template>
  <div class="dict">     
    <b-input type="text" v-model="word" /> 
    <b-table :items="rows" />
  </div>
</template>

<script>
import dict_json from "../json/dict.json";


export default {
  name: "Dict",
  data() {
    return {
      dict: dict_json,
      word: ""
    }
 },
 computed: {
    rows() {
      let rows = [];
      this.dict.forEach((row) => {
        let reg = new RegExp(this.word, "g");
        if(this.word == "" || row.key.match(reg))
            rows.push(row);
      });
      return rows;
    }
 }
}
</script>

<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
/* ::v-deep/ .table > tbody > tr > td { */
/deep/ .table > tbody > tr > td {
  text-align: left;
}
</style>
