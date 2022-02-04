<template>
  <div class="home">
    <div class="row">
    <div class="col-9">
    <v-select
      :options="books"
      v-model="current"
      @input="onchangebook"
    ></v-select>

    <b-input type="text" v-model="canto" />
    <b-pagination
      :total-rows="rows_length"
      v-model="current_page"
      :per-page="per_page"
      align="fill"
      class="my-0"
      aria-controls="my-table"
    ></b-pagination>

    <b-table
      id="my-table"
      :items="rows"
      :fields="fields"
      @row-hovered="mouseover"
      @row-unhovered="mouseleave"
      :current-page="current_page"
      :per-page="per_page"
      :tbody-tr-class="rowClass"
    />
    </div>
    <div class="col-3">
      <b-table :items="items" small/>
    </div>
</div>
  </div>
</template>

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

import axios from "axios";
import dict_json from "../json/dict.json";
import notes_json from "../json/notes.json";

function romanize(num) {
  var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},roman = '',i;
  for ( i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

export default {
  name: "Home",
  components: {
    vSelect,
  },

  data() {
    return {
      rows_length: 30,
      current_page: 1,
      per_page: 9,
      dict: dict_json,
      notes: notes_json,
      items: [],
      currentLine: "",
      info: null,
      canto: "I",
      current: "Inferno",
      books: ["Inferno", "Purgatorio", "Paradiso"],
      inferno: [],
      purgatorio: [],
      paradiso: [],
    };
  },
  computed: {
    fields() {
      return ["nr", "line"];
    },
    rows() {
      var rows = [];
      if (this.current == "Inferno") {
        this.inferno.forEach((row) => {
          if (row.show) {
            rows.push({ line: row.line, nr: row.nr });
          }
        });
      } else {
        this.purgatorio.forEach((row) => {
          if (row.show) {
            rows.push({ line: row.line, nr: row.nr });
          }
        });
      }

      return rows;
    },
  },
  watch: {
    currentLine: function (newItems) {
      console.log(newItems);
      let args = this.filterLine(newItems);
      this.items = args;
    },
    canto(newCanto) {
      console.log("canto:" + newCanto);
      let canto = newCanto;
      let n = parseInt(canto);
      if(isNaN(n))  {
        this.filter(canto);
      }
      else {
        let roman = romanize(canto);
        this.filter(roman);
      }
      
      this.$forceUpdate();
    },
  },
  methods: {
    filterLine(line) {
      let x = line.split(" ");
      let i;
      let args = [];
      const pattern = new RegExp(/\.|:|;|\?|,|!$/g);
      const pattern2 = new RegExp(/^«|‘/g);
      for (i = 0; i < x.length; i++) {
        let word = x[i].toLowerCase().replace(pattern, "").replace(/’$/g, "").replace(pattern, "").replace(pattern2, "");
        console.log(word);
        let res = this.dict.filter((item) => {
          return item.key.toLowerCase() == word;
        });
        let resnote = this.notes.filter((item) => {
          return item.key.toLowerCase() == word;
        });

        let tmp = "";
        if (res.length > 0) {
          tmp = res[0].value;
        }
        if (resnote.length > 0) {
          let newkey = resnote[0].value;
          let res2 = this.dict.filter((item) => {
            return item.key.toLowerCase() == newkey.toLowerCase();
          });
          if(res2.length > 0)
            tmp = tmp + newkey + ":" + res2[0].value;          
        }

        var obj = { key: word, value: tmp };
        args.push(obj);
      }
      return args;
    },
    rowClass(item, type) {
      if (!item || type !== "row") return;
      if (item.hover) return "table-primary"; //"table-success";

    },
    mouseover(item) {
      console.log("over", item.nr);
      item.hover = true;
      this.currentLine = item.line;
    },
    mouseleave(item) {
      console.log("leave", item.nr);
      item.hover = false;
    },
    onchangebook(newBook) {
      if (newBook == "Purgatorio") {
        this.init2("998-0.txt");
      }
      if (newBook == "Inferno") {
        this.init("997-0.txt");
      }

      if (newBook == "Paradiso") {
        this.init3("999-0.txt");
      }
    },
    filter(canto) {
      if (this.current == "Inferno") {
        this.inferno.forEach((row) => {
          if (row.canto == canto) {
            row.show = true;
          } else {
            row.show = false;
          }
        });
        this.rows_length = this.inferno.length;
      } else if (this.current == "Purgatorio") {
        this.purgatorio.forEach((row) => {
          if (row.canto == canto) {
            row.show = true;
          } else {
            row.show = false;
          }
        });
        this.rows_length = this.purgatorio.length;
      } else {
        this.paradiso.forEach((row) => {
          if (row.canto == canto) {
            row.show = true;
          } else {
            row.show = false;
          }
        });
      }
    },
    init(api) {
      let self = this;
      axios
        .get(api)
        .then((response) => {
          let res = response.data;
          let lines = res.replace(/\r/gm, "").split("\n");
          this.info = lines;
          let i;
          let book = false;
          let canto = "";
          let nr = 1;
          for (i = 0; i < lines.length; i++) {
            const line = lines[i];
            const regex_book = new RegExp("^Inferno", "g");

            const regex_canto = /^Canto/g;

            const regex_end = new RegExp("END OF THE PROJECT", "g");
            if (line.match(regex_end)) {
              break;
            }

            if (line.match(regex_book)) {
              book = true;
              continue;
            }

            if (book) {
              if (line.match(regex_canto)) {
                canto = line.replace(regex_canto, "").trim();
                nr = 1;
                continue;
              }
              if (line.length != "") {
                let gem = { show: true, line: line, canto: canto, nr: nr++ };
                self.inferno.push(gem);
                //console.log(gem);
              }
            }
          }
          self.rows_length = nr;
        })
        .catch(function (error) {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
        });
    },

    init2(api) {
      let self = this;
      axios
        .get(api)
        .then((response) => {
          console.log(response.data);
          let res = response.data;
          let lines = res.replace(/\r/gm, "").split("\n");
          this.info = lines;
          let i;
          let book = false;
          let canto = "";
          let nr = 1;
          for (i = 0; i < lines.length; i++) {
            const line = lines[i];
            const regex_book = new RegExp("^Purgatorio", "g");
            const regex_canto = /^Canto/g;
            const regex_end = new RegExp("END OF THE PROJECT", "g");
            if (line.match(regex_end)) {
              break;
            }

            if (line.match(regex_book)) {
              book = true;
              continue;
            }

            if (book) {
              if (line.match(regex_canto)) {
                canto = line.replace(regex_canto, "").trim();
                nr = 1;
                continue;
              }
              if (line.length != "")
                self.purgatorio.push({
                  show: true,
                  line: line,
                  canto: canto,
                  nr: nr++,
                });
            }
          }
          self.rows_length = nr;
        })
        .catch(function (error) {
          if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
        });
    },
    init3(api) {
      let self = this;
      axios.get(api).then((response) => {
        console.log(response.data);
        let res = response.data;
        let lines = res.replace(/\r/gm, "").split("\n");
        this.info = lines;
        let i;
        let book = false;
        let canto = "";
        let nr = 1;
        for (i = 0; i < lines.length; i++) {
          const line = lines[i];
          const regex_book = new RegExp("^Paradiso", "g");
          const regex_canto = /^Canto/g;
          const regex_end = new RegExp("END OF THE PROJECT", "g");
          if (line.match(regex_end)) {
            break;
          }

          if (line.match(regex_book)) {
            book = true;
            continue;
          }

          if (book) {
            if (line.match(regex_canto)) {
              canto = line.replace(regex_canto, "").trim();
              nr = 1;
              continue;
            }
            if (line.length != "")
              self.paradiso.push({
                show: true,
                line: line,
                canto: canto,
                nr: nr++,
              });
          }
        }
      });
    },
  },
  mounted() {
    const api = "997-0.txt";
    this.init(api);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

/* ::v-deep/ .table > tbody > tr > td { */
/deep/ .table > tbody > tr > td {
  text-align: left;
}
</style>
