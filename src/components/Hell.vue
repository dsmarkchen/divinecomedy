<template>
  <div class="hell">
    <h1>{{ msg }}</h1>
    <div class="container">
      <div class="row">

    <b-form-input type="text" v-model="canto" placeholder="canto number"/>
     <div class="mt-2">Canto: {{ canto }}</div>
      </div>
    </div>    
    <div class="container">
      <div class="row">
        <div class="col">
           <b-pagination
          :total-rows="rows_length"
          v-model="current"
          :per-page="diff"
          align="fill"
          class="my-0"
          aria-controls="my-table"
        ></b-pagination>

          <b-table
            id="my-table"
            show-empty
            :items="rows"
            :fields="cols"
            :per-page="diff"
            :current-page="current"
            @row-hovered="mouseover"
            @row-unhovered="mouseleave"
            :tbody-tr-class="rowClass"
          ></b-table>
        </div>
        <div class="col">
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th>key</th>
                <th>value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(argument, index) in items" v-bind:key="index">
                <td align="left">
                  {{ argument.key }}
                </td>
                <td align="left">                  
                  {{ argument.value }}
                  
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import inferno_json from "../json/inferno.json";
import dict_json from "../json/dict.json";
import notes_json from "../json/notes.json";

export default {
  name: "Hell",
  props: {
    msg: String,
  },
  methods: {
    mouseover(item, index, event) {
      console.log(item, index, event);
      item.hover = true;
      this.currentLine = item.line;
    },
    mouseleave(item, index, event) {
      console.log(item, index, event);
      item.hover = false;
    },
    rowClass(item, type) {
      if (!item || type !== "row") return;
      if (item.hover) return "table-primary"; //"table-success";

    },
    filterLine(line) {
      let x = line.split(" ");
      let i;
      let args = [];
      for (i = 0; i < x.length; i++) {
        let word = x[i].toLowerCase().replace(/;|,|\.$/g, '');
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
          tmp = tmp + newkey + ":" + res2[0].value;
        }

        var obj = { key: word, value: tmp };
        args.push(obj);
      }
      return args;

    }
  },
  watch: {
    currentLine: function (newItems) {
      console.log(newItems);
      let args = this.filterLine(newItems);
      this.items = args;
    },
  },
  computed: {
    rows() {
      let rows = [];
      let i;
      let j;      
      for (i = 0; i < this.context.length; i++) {
        let book = this.context[i];
        if (book.canto == this.canto) {
          for (j = 0; j < book.lines.length; j++) {
            let nr = j + 1;
            //if(nr > this.stop) break;
            //if(nr < this.start) continue;

            let text = book.lines[j];
            if (nr % 3 != 0) {
              nr = "";
            }

            let row = {
              line: text,
              nr: nr,
              hover: false,
            };

            rows.push(row);
          }
        }
      }
      console.log(rows);
      return rows;
    },
    cols() {
      let cols = [];      
      cols.push("line");
      cols.push("nr");
      return cols;
    },
  },
  created: function(){
    this.rows_length = 0;
    let i;
    for (i = 0; i < this.context.length; i++) {
        let book = this.context[i];
        let len = book.lines.length;
        this.rows_length += len;
    }
  },
  data: function () {
    return {
      context: inferno_json,
      dict: dict_json,
      notes: notes_json,
      canto: 1,
      current: 1,      
      diff: 6,
      currentLine: "",
      rows_length: 6,
      items: [],
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active {
  background: green;
}

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

.table tbody tr-tri-first {
  background: green;
}
/* ::v-deep/ .table > tbody > tr > td { */
/deep/ .table > tbody > tr > td {
text-align: left;
}
</style>
