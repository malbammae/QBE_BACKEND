import { AsyncResource } from "async_hooks";
import create_sockets from "./sockets";

const numbers = require("./qbe/numbers");
const error = require("./qbe/error");
const initial = require("./qbe/initial");
const warning = require("./qbe/warning");
const success = require("./qbe/success");
var net = require("net");
const chalk = require("chalk");
const sockets = require("./sockets/router");
const getPixels = require("get-pixels");
const log = console.log;



class QBE {
  constructor( node) {
    this.node = node;
   
    this.socket = null;
    this.matrix = [initial];
    this.game = null;
    this.times = [];
    this.left = null;
    this.right = null;
    //this.right = this.rotate_left;
    //console.log("CREANDO NODO");
  }
  Set_Game(game){
      this.game=game;
  }
  create_socket() {
    // console.log("CREAR NODO");
    create_sockets(this.node, sock => {
      this.set_socket(sock);
    });
  }

  set_references(nodos) {
    this.nodos = nodos;
  }

  set_socket(socket) {
    //this.socket = socket;

    console.log("READY");
    socket.on("data", data => {
      // try {
      let option = `${String.fromCharCode(data[0])}${String.fromCharCode(
        data[1]
      )}`;
      if (sockets[option] == undefined) {
        socket.write("-1");
        return;
      } else {
        data = "" + data;
        data = data.substr(1);
        data = data.substr(1);

        sockets[option](this, data, socket);
      }
      //  } catch (error) {
      //    socket.write("-2");
      //  }
    });
  }

  /* receive() {
    sock.on("data", function(data) {
      console.log("DATA " + sock.remoteAddress + ": " + data);
      // Write the data back to the socket, the client will receive it as data from the server
      //sock.write('You said "' + data + '"');
    });
  }*/

  set_figure(figure) {}
  set_number(number) {
    this.matrix = [numbers[number]];
    this.time = [4];
  }

  set_gif(path) {
    getPixels(path, (err, pixels) => {
      if (err) {
        console.log("Bad image path");
        return;
      }

      let out = [];

      let ixx = 0;
      for (let jx = 0; jx < 8; ++jx) {
        let in_out = new Array(8);
        for (let ix = 0; ix < 8; ++ix) {
          in_out[ix] = [
            pixels.data[ixx],
            pixels.data[ixx + 1],
            pixels.data[ixx + 2]
          ];
          ixx = ixx + 4;
        }
        out.push(in_out);
      }
      //console.log(out);
      this.matrix = [out];
      this.time = [0];
      this.rotate_left();
    });
  }

  compare_gif(path) {
    return new Promise((resolve, reject) => {
      getPixels(path, (err, pixels) => {
        if (err) {
          console.log("Bad image path");
          resolve(false);
          return;
        }

        let matrix = this.matrix[0];
        let ixx = 0;
        for (let ix = 0; ix < 8; ++ix) {
          for (let jx = 0; jx < 8; ++jx) {
            //console.log(matrix[jx][7 - ix],[ pixels.data[ixx],pixels.data[+ixx + 1] ,pixels.data[+ixx + 2]]   );
            if (
              matrix[7 - jx][ix][0] != pixels.data[ixx] ||
              matrix[7 - jx][ix][1] != pixels.data[+ixx + 1] ||
              matrix[7 - jx][ix][2] != pixels.data[+ixx + 2]
            ) {
              //console.log("ERR", matrix[ix][jx][0], pixels.data[ixx], matrix[ix][jx][1], pixels.data[+ixx + 1], matrix[ix][jx][2], pixels.data[+ixx + 2]);
              resolve(false);
            }
            ixx = ixx + 4;
          }
        }
        resolve(true);
      });
    });
  }
  error() {
    //this.matrix = [error];
    this.set_gif("system/qbe/error.gif");
    this.time = [0];
  }
  success() {
    this.set_gif("system/qbe/success.gif");
    // this.matrix = [success];
    this.time = [0];
  }
  warning() {
    this.matrix = [warning];
    this.time = [0];
  }
  rotate_right() {
    let new_matrix = new Array(8);
    let old_matrix = this.matrix[0];

    for (let ix = 0; ix < 8; ++ix) {
      new_matrix[ix] = new Array(8);
      for (let jx = 0; jx < 8; ++jx) {
        new_matrix[ix][7 - jx] = old_matrix[jx][ix];
      }
    }
    this.matrix[0] = new_matrix;
  }
  rotate_left() {
    let new_matrix = new Array(8);
    let old_matrix = this.matrix[0];

    for (let ix = 0; ix < 8; ++ix) {
      new_matrix[ix] = new Array(8);
      for (let jx = 0; jx < 8; ++jx) {
        new_matrix[ix][jx] = old_matrix[jx][7 - ix];
      }
    }
    this.matrix[0] = new_matrix;
  }

  button() {
    this.BUTTON();
  }
  set_button(func) {
    this.BUTTON = func;
  }

  print_screen() {
    let out;
    for (let matrix of this.matrix) {
      for (let line of matrix) {
        out = `     `;
        for (let pos of line) {
          out = `${out} ${chalk.rgb(pos[0], pos[1], pos[2])("*")} `;
        }
        console.log(out);
      }
    }
  }
}

export default QBE;
