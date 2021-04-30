const Node = require('./TrieNode');

class TrieHelper {
  constructor(node) {
    this.__node = node;
  }

  insert(filter) {
    let currentNode = this.__node;

    [...filter.akun].forEach(char => {
      const index = parseInt(char);

      if(currentNode.children[index] === undefined){
        currentNode.children[index] = new Node(char);
      }
      currentNode = currentNode.children[index];
    });

    currentNode.isTail = true;
    currentNode.filters.push(filter);
  }
  

  getFilter(akun, ledger) {
    let currentNode = this.__node[ledger];
    let filters = [];

    const akunArr = [...akun];

    for (let index = 0; index < akunArr.length; index++) {
      const segmenAkun = parseInt(akunArr[index]);

      if(currentNode.children[segmenAkun] === undefined || currentNode.children[segmenAkun] === null) {
        return filters;
      }

      currentNode = currentNode.children[segmenAkun];

      if(currentNode.isTail) {
        filters.push(...currentNode.filters);
      }
    }

    return filters;
  }
}

module.exports = TrieHelper;


// exports.insert = (node, filter) => {
//   let currentNode = node;

//   [...filter.akun].forEach(char => {
//     const index = parseInt(char);

//     if(currentNode.children[index] === undefined){
//       currentNode.children[index] = new Node(char);
//     }
//     currentNode = currentNode.children[index];
//   });
//   currentNode.isTail = true;
//   currentNode.filters.push(filter);
// }


// exports.getFilter = (node, akun) => {
//   let currentNode = node;
//   let filters = [];

//   const akunArr = [...akun];

//   for (let index = 0; index < akunArr.length; index++) {
//     const segmenAkun = parseInt(akunArr[index]);

//     if(currentNode.isTail) {
//       filters.push(...currentNode.filters);
//     }
    
//     if(currentNode.children[segmenAkun] === undefined) {
//       return filters;
//     }

//     currentNode = currentNode.children[segmenAkun];
//   }

//   return filters;
// }