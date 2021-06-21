// crea la bbdd o la abre si ya existe
const db = new PouchDB('a');
var remoteCouch = false;

// function addTodo(text) {
//     var todo = {
//       _id: new Date().toISOString(),
//       title: text,
//       completed: false
//     };
//     db.put(todo, function callback(err, result) {
//       if (!err) {
//         console.log('Successfully posted a todo!', text);
//       }
//     });
//   }

let addTodo = text => {
    var todo = {
        _id: new Date().toISOString(),
        title: text,
        completed: true
    };
    return db.put(todo).then((resolve) => {
        console.log('Successfully posted a todo!', text);
        resolve('ok');
    }).catch(function (err) {
        if (err.name === 'conflict') {
            return addTodo(text);

        } else {
            // some other error
        }
    });

}


let dbChanges=()=>{
    db.allDocs({include_docs: true, descending: true}, function(err, doc) {
        console.log(doc.rows);
      });
}

db.changes({
    since: 'now',
    live: true
  }).on('change', dbChanges);





// addTodo('51houstonz')
//     .then(addTodo('52houston'))
//     .then(addTodo('53houston'))
//     .then(addTodo('54houston'))
//     .then(addTodo('55houston'))
//     .then(addTodo('56houston'))


