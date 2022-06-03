var tasks = {};
//-------------------------------------------------this creates the dynamically inputted elements
var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");

  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);

  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};
var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
  
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

//----------------------------------- save the thingys to local storage-----------------------------------------

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};






// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();

  }
});

$(".list-group").on("click","p",function(){
 var text = $(this)
 .text()
 .trim();


 //establishes locaiton to all text area elements
var textInput =$("<textarea>").addClass("form-control").val(text);
 //replaces with user input
$(this).replaceWith(textInput);
//hilights location
  textInput.trigger("focus");
});

//---------------------------------------this is to make the thing blur when out sike of the text area 
$(".list-group").on("blur", "textarea", function(){

  var text = $(this).val();

  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

  var index = $(this)
  .closest(".list-group-item")
  .index();

  tasks[status][index].text = text;
  saveTasks();

//recreate p element
var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  //replace textarea with p element

  $(this).replaceWith(taskP);

}); 

//-----------------this is to make the date editable------------------------------------------

 
//due date was clicked

$(".list-group").on("click", "span", function(){

  //get current text

  var date =$(this).text().trim();


//create new input element

var dateInput =$("<input>")

.attr("type", "text")
.addClass("form-control")
.val(date);

//swap out elements
$(this).replaceWith(dateInput);

  // enable jquery ui datepicker--------------------------------put the  date picker in editable areas
  //forces it back to a p element
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

//automatically focus on new element

dateInput.trigger("focus");

  
  
});

//--------------------------------this is to make the them convert back when the use clicks outside of the text box


//value of due date was changed
$(".list-group").on("change", "input[type='text']", function(){

  //get current text

  var date = $(this)

  .val()
  .trim();

  // get the parent ul's id attribute

  var status =$(this)

  .closest(".list-group")
  .attr("id")
  .replace("list-", "");

    // get the task's position in the list of other li elements
    var index = $(this)
    .closest(".list-group-item")
    .index();


      // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();


  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

      // replace input with span element
  $(this).replaceWith(taskSpan);

//------------------------------------------------changes the color when selected rather than refreshed
  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
})


// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});



// this makes the tasks movable
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper:"clone",//makes a copy of the original and that is what is used 
  
  activate: function(event){
  //console.log("activate", this);
  },

  deactivate: function(event){
  //console.log("deactivate", this);
  },

  over: function(event) {
 //console.log("over", event.target);
  },

  out: function(event) {
  //console.log("out", event.target);
 },
 update: function(event) {

  var tempArr= [];
  // loop over current set of children in sortable list
  $(this).children().each(function() {
    var text = $(this)
      .find("p")
      .text()
      .trim();
  
    var date = $(this)
      .find("span")
      .text()
      .trim();

      tempArr.push({

        text: text,
        date: date

      });
  
  });
  console.log(tempArr);

  //-----------------------------------------------keeps the tasks in place---------------------------

  // trim down list's ID to match object property
var arrName = $(this)
.attr("id")
.replace("list-", "");

// update array on tasks object and save
tasks[arrName] = tempArr;
saveTasks();

}
})


//----------------------------------------------deletes/removes tasks
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop", event);
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});


//---------------------------------------------- date picker
$("#modalDueDate").datepicker({
  minDate: 1
});

//---------------------------retrieves date from span element and applies the past due function
var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  // ensure it worked
  console.log(date); 

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date
  console.log(time);

  //-----------------------------------checks time to see if in the past or not
// remove any old classes from element
$(taskEl).removeClass("list-group-item-warning list-group-item-danger");

// apply new class if task is near/over due date
if (moment().isAfter(time)) {
  $(taskEl).addClass("list-group-item-danger");
}

else if (Math.abs(moment().diff(time, "days")) <= 2) {
  $(taskEl).addClass("list-group-item-warning");
}
};
// load tasks for the first time
loadTasks();


