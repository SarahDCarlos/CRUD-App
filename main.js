class Stage {
    constructor(name) {
        this.name = name;
        this.performers= [];
    }

    addPerformer(name, time) {
        this.performers.push(new Performer(name, time)); //adds performer to array in Stage class
    }
}


class Performer {
    constructor(name, time){
        this.name = name;
        this.time = time;

    }
}

class StageService { //send HTTP request
    static url = "https://crudcrud.com/api/6120adedd3604e6393c354ac51b0d93c/stages";

    //create methods and return so we can use these methods and the promise that comes back

    static getAllStages() {
        return $.get(this.url); //return all stages from that url (jquery)

    }

    static getStage(id) {
        return $.get(this.url + `/${id}`);

    }

    static createStage(stage){
        return $.ajax({
            url: this.url,
            dataType: 'json',
            data: JSON.stringify(stage),
            contentType: 'application/json',
            type: 'POST'
        
        }); //use ajax method
    }

    static updateStage(stage) { //send request
        return $.ajax({
            url: this.url + `/${stage._id}`, //_id this is the value that database reates for stage... mongodatabase
            dataType: 'json',
            data: JSON.stringify(stage),
            contentType: 'application/json',
            type: 'PUT'
        
        }); //use ajax method
    }

    static deleteStage(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

//use stageservice class in DOM manager class
//rerender or repaint DOM each time we create a new class

class DOMManager {
    static stages; //variable to represent all stages in this class

    static getAllStages() { //calls getallstages method in stageserviceclass and rerenders the dom
        //top down and call methods that we havent created yet
        StageService.getAllStages().then(stages => this.render(stages)); //returns a promise so use.then 
        //render does not exist yet 
    
    }

    static deleteStage(id) {
        StageService.deleteStage(id) //delete stage
            .then(() => {
                return StageService.getAllStages(); //send http request: once we delete the stage, get all stages again, then render those stages again
            })
            .then((stages) => this.render(stages)); //re-render 
    }

    static createStage(name) {
        StageService.createStage(new Stage(name))
            .then(() =>{
                return StageService.getAllStages();
            })
            .then((stages) => this.render(stages));
    }

    static addPerformer(id) {
        for (let stage of this.stages){
            if(stage._id == id) {
                stage.performers.push(new Performer($(`#${stage._id}-performer-name`).val(), $(`#${stage._id}-performer-time`).val())); //$ is jquery then template literal  then jquery for id is #
                StageService.updateStage(stage) 
                    //send updated request to API to save new data
                    .then(() => {
                        return StageService.getAllStages();
                    })
                    .then((stages) => this.render(stages));
                }
            }
        }
    
    static deletePerformer(stageId, performerId) {
        for(let stage of this.stages) {
            if(stage._id == stageId) {
                for(let performer  of stage.performers) {
                    if(performer._id == performerId){
                        stage.performers.splice(stage.performers.indexOf(performer), 1);
                        StageService.updateStage(stage)
                            .then(() => {
                                return StageService.getAllStages();

                            })
                            .then((stages) => this.render(stages));
                    }
                }
            }
        }
    }


    //Build RENDER METHOD
    static render(stages) {
        this.stages = stages;
        $('#app').empty(); //grab reference to div and render everything
        //for loop to go over stages and rerender
        for (let stage of stages) {
            $('#app').prepend( //write html in js use backticks
                `<div id="${stage._id}" class="card">
                    <div class="card-header">
                        <h2>${stage.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteStage('${stage._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${stage._id}-performer-name" class="form-control" placeholder="Performer Name">
                                    
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${stage._id}-performer-time" class="form-control" placeholder="Performer time 24hrs">
                                </div>
                            </div>
                            <button id="${stage._id}-new-performer" onclick="DOMManager.addPerformer('${stage._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
                //nested loop to render each performer inside the stage

            );
                for(let performer of stage.performers){
                    $(`#${stage._id}`).find('.card-body').append(
                        `<p>
                            <span id="name-${performer._id}"><strong>Performer: </strong> ${performer.name}</span>
                            <span id="time-${performer._id}"><strong>Time: </strong> ${performer.time}</span>
                            <button class="btn btn-danger" onclick="DOMManager.deletePerformer('${stage._id}', '${performer._id}')">Delete Stage</button>
                        `
                    )
                }
        }
    }
}


$('#create-new-stage').click(() => {
    DOMManager.createStage($('#new-stage-name').val());
    $('#new-stage-name').val(' ');
})

//add buttons delete stage, add performer, delete performer; add above the render of stages



//TEST

DOMManager.getAllStages();