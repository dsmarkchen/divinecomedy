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
        <b-table :items="items" small />

        <b-table :items="contexts" :fields="context_fields" small />
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
import contexts_json from "../json/contexts.json";

function romanize(num) {
  var lookup = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1,
    },
    roman = "",
    i;
  for (i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  console.log("romanize " + roman);
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
      per_page: 33,
      dict: dict_json,
      notes: notes_json,
      items: [],
      contexts: [],
      currentLine: "",
      info: null,
      canto: "XIX",
      cantoNum: 19,
      current: "Purgatorio",
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
    context_fields() {
      return ["annotation"];
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
        if (this.current == "Purgatorio") {
          this.purgatorio.forEach((row) => {
            if (row.show) {
              rows.push({ line: row.line, nr: row.nr });
            }
          });
        } else {
          this.paradiso.forEach((row) => {
            if (row.show) {
              rows.push({ line: row.line, nr: row.nr });
            }
          });
        }
      }

      return rows;
    },
  },
  watch: {
    currentLine: function (newItems) {
      console.log(newItems);
      let args = this.filterLine(newItems);
      this.items = args;
      console.log("items", this.items);
    },
    canto(newCanto) {
      console.log("canto:" + newCanto);
      let canto = newCanto;
      let n = parseInt(canto);
      this.cantoNum = n;
      if (isNaN(n)) {
        this.filter(canto);
      } else {
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

      const patt2 = new RegExp(/»|’$/g);
      const patt3 = new RegExp(/^«|‘|—/);
      for (i = 0; i < x.length; i++) {
        let word = x[i]
          .toLowerCase()
          .replace(pattern, "")
          .replace(patt2, "")
          .replace(pattern, "")
          .replace(patt3, "");
        //console.log(word);
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
          if (res2.length > 0) tmp = tmp + newkey + ":" + res2[0].value;
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

      if (contexts_json.length > 0) {
        let res_context = contexts_json.filter((item) => {
          if (
            item.book.toLowerCase() == this.current.toLowerCase() &&
            item.canto == this.cantoNum.toString()
          ) {
            return true;
          }
          return false;
        });
        if (res_context != undefined && res_context.length > 0) {
          let val = res_context[0].context.filter((itm) => {
            let n = Number(itm.l);
            if (n == item.nr ||
               (n+1) == item.nr ||
               (n+2) == item.nr) {
              return true;
            }
            return false;
          });          
          this.contexts = [];
          if(val != undefined && val.length > 0) {
            let ind = (item.nr -1 )  % 3;
            let context = {
              book: this.current,
              canto: this.cantoNum,
              nr: item.nr,
              annotation: val[0].t[ind],
            };
            this.contexts.push(context);
          }
        }
      }
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
        let inf_lines = 0;
        this.inferno.forEach((row) => {
          if (row.canto == canto) {
            row.show = true;
            inf_lines++;
          } else {
            row.show = false;
          }
        });
        this.rows_length = inf_lines;
      } else if (this.current == "Purgatorio") {
        let purg_lines = 0;
        this.purgatorio.forEach((row) => {
          if (row.canto == canto) {
            row.show = true;
            purg_lines++;
          } else {
            row.show = false;
          }
        });
        this.rows_length = purg_lines;
      } else {
        let par_lines = 0;
        this.paradiso.forEach((row) => {
          if (row.canto == canto) {
            row.show = true;
            par_lines++;
          } else {
            row.show = false;
          }
        });
        this.rows_length = par_lines;
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
          //console.log(response.data);
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
          self.filter(self.canto);
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
    if (this.current == "Inferno") {
      const api = "997-0.txt";
      this.init(api);
    } else {
      const api = "998-0.txt";
      this.init2(api);
    }
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
